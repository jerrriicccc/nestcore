import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entity/user.entity';
import { CreateDto } from '../users/dto/user.dto';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { generateRBACToken } from 'src/component/validateaccess/RbacToken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async registerOAuthUser(payload: any): Promise<UserEntity> {
    if (Array.isArray(payload)) {
      throw new BadRequestException(
        'registerOAuthUser does not accept an array payload',
      );
    }
    // Fill required fields with defaults if not provided
    const user = this.userRepository.create({
      email: payload.email,
      assignedroles: payload.assignedroles || [],
      password: payload.password || randomUUID(), // random password for OAuth
      phonenumber: payload.phonenumber || '',
      statusid: payload.statusid || 2, // active
      birthdate: payload.birthdate || null,
      verificationtoken: null,
      failedloginattempts: 0,
      defaultroleid: payload.defaultroleid || 2,
      ...payload,
    });
    const saved = await this.userRepository.save(user);
    if (Array.isArray(saved)) {
      throw new InternalServerErrorException(
        'registerOAuthUser: save returned an array, expected a single User',
      );
    }
    return saved;
  }
  async generateJwt(user: any) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async findOrCreateUserByGithub(
    githubProfile: any,
    githubEmail: string,
  ): Promise<UserEntity> {
    // First, try to find the user by their GitHub ID
    let user = await this.userRepository.findOne({
      where: { githubId: githubProfile.id.toString() },
    });

    if (user) {
      return user;
    }

    // If not found by GitHub ID, try to find by email
    user = await this.userRepository.findOne({ where: { email: githubEmail } });

    if (user) {
      // User exists, so link their GitHub ID to their account
      user.githubId = githubProfile.id.toString();
      await this.userRepository.save(user);
      return user;
    }

    // If user is not found by email either, create a new user (Sign-up via GitHub)

    const newUser = this.userRepository.create({
      email: githubEmail,
      githubId: githubProfile.id.toString(),
      password: randomUUID(), // Create a random password as it's required
      statusid: 2, // Automatically verified and active
      defaultroleid: 2, // Default role
      failedloginattempts: 0,
    });

    return this.userRepository.save(newUser);
  }

  async register(createDto: CreateDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const hashedPassword = await argon2.hash(createDto.password);

      const user = this.userRepository.create({
        ...createDto,
        password: hashedPassword,
        verificationtoken: randomUUID(),
        statusid: 1,
        failedloginattempts: 0,
        defaultroleid: 2,
      });

      await this.userRepository.save(user);

      await this.mailService.sendVerificationEmail(
        user.email,
        user.verificationtoken || '',
      );

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Error during registration:', error);
      throw new InternalServerErrorException('Failed to register user.');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationtoken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.verificationtoken = null;
    user.statusid = 2; // Set status to verified
    await this.userRepository.save(user);

    return {
      message: 'Email verified successfully. You can now login.',
      redirectUrl: 'http://localhost:5000/auth/verify-success',
    };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'defaultroleid',
        'assignedroles',
        'statusid',
        'failedloginattempts',
      ],
    });

    if (!user) {
      throw new UnauthorizedException(
        "Couldn't find your account. Please sign up.",
      );
    }

    if (user.statusid === 3) {
      throw new UnauthorizedException(
        'Account is locked. Please contact support.',
      );
    }

    if (user.statusid === 1) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    // Validate password (handle invalid hash formats gracefully)
    let isPasswordValid = false;
    try {
      isPasswordValid = await argon2.verify(user.password, password);
    } catch (e) {
      // If stored password is not a valid argon2 hash (legacy/plain), treat as invalid
      isPasswordValid = false;
    }
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts
    await this.userRepository.update(user.id, { failedloginattempts: 0 });

    // Return structured response expected by frontend (with RBAC tokens)
    return this.generateLoginResponse(user);
  }

  private async handleFailedLogin(user: UserEntity) {
    await this.userRepository.increment(
      { id: user.id },
      'failedloginattempts',
      1,
    );

    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['failedloginattempts', 'statusid'],
    });

    if (updatedUser && updatedUser.failedloginattempts >= 5) {
      await this.userRepository.update(user.id, { statusid: 3 });
      throw new UnauthorizedException(
        'Too many failed attempts. Account has been locked.',
      );
    }
  }

  /**
   * Map module name from lowercase plural (appointments) to database format (Appointment)
   * This maps the module name used in the code to the accesskey format in the database
   * Database uses singular capitalized form: appointments -> Appointment, customers -> Customer
   */
  private mapModuleNameToAccessKey(moduleName: string): string {
    // Remove trailing 's' if plural, then capitalize first letter
    // appointments -> appointment -> Appointment
    // customers -> customer -> Customer
    const singular = moduleName.endsWith('s')
      ? moduleName.slice(0, -1)
      : moduleName;
    return singular.charAt(0).toUpperCase() + singular.slice(1);
  }

  /**
   * Get user's role permissions from database for a specific module
   * @param roleId - User's role ID
   * @param moduleName - Module name (e.g., 'appointments', 'customers')
   * @returns Array of access permissions (e.g., ['Read', 'Create'])
   */
  private async getUserRolePermissions(
    roleId: number,
    moduleName: string,
  ): Promise<string[]> {
    try {
      // Map module name to database accesskey format
      const accessKey = this.mapModuleNameToAccessKey(moduleName);

      // Query rolelines table for the user's role and module
      const query = `
        SELECT rl.accessvalue 
        FROM rolelines rl 
        WHERE rl.roleid = ? 
        AND rl.accesskey = ?
      `;

      console.log(
        `Getting permissions for roleId: ${roleId}, module: ${moduleName}, accessKey: ${accessKey}`,
      );

      const result = await this.dataSource.query(query, [roleId, accessKey]);

      if (result && result.length > 0 && result[0].accessvalue) {
        // accessvalue is stored as JSON string, parse it
        const accessValue =
          typeof result[0].accessvalue === 'string'
            ? JSON.parse(result[0].accessvalue)
            : result[0].accessvalue;

        console.log(
          `Found permissions for role ${roleId} on module ${moduleName}:`,
          accessValue,
        );
        return Array.isArray(accessValue) ? accessValue : [];
      }

      console.log(
        `No permissions found for role ${roleId} on module ${moduleName} (accessKey: ${accessKey})`,
      );
      return [];
    } catch (error) {
      console.error('Error getting user role permissions:', error);
      return [];
    }
  }

  /**
   * Get permissions from multiple roles for a specific module
   * Returns permissions from all assigned roles (without merging/removing duplicates)
   * @param roleIds - Array of role IDs (from assignedroles)
   * @param moduleName - Module name (e.g., 'appointments', 'customers')
   * @returns Array of access permissions from all roles
   */
  private async getUserPermissionsFromMultipleRoles(
    roleIds: (string | number)[],
    moduleName: string,
  ): Promise<string[]> {
    try {
      if (!roleIds || roleIds.length === 0) {
        console.log(`No roles provided for module ${moduleName}`);
        return [];
      }

      // Map module name to database accesskey format
      const accessKey = this.mapModuleNameToAccessKey(moduleName);

      // Convert role IDs to numbers and filter out invalid ones
      const validRoleIds = roleIds
        .map((id) => {
          const numId = typeof id === 'string' ? parseInt(id, 10) : id;
          return isNaN(numId) ? null : numId;
        })
        .filter((id): id is number => id !== null);

      if (validRoleIds.length === 0) {
        console.log(`No valid role IDs provided for module ${moduleName}`);
        return [];
      }

      // Query rolelines table for all roles and module
      const query = `
        SELECT rl.roleid, rl.accessvalue 
        FROM rolelines rl 
        WHERE rl.roleid IN (${validRoleIds.map(() => '?').join(',')})
        AND rl.accesskey = ?
      `;

      console.log(
        `Getting permissions for roles [${validRoleIds.join(', ')}], module: ${moduleName}, accessKey: ${accessKey}`,
      );

      const results = await this.dataSource.query(query, [
        ...validRoleIds,
        accessKey,
      ]);

      // Collect all permissions from all roles (keeping all permissions, including duplicates)
      const allPermissions: string[] = [];
      for (const result of results) {
        if (result.accessvalue) {
          // accessvalue is stored as JSON string, parse it
          const accessValue =
            typeof result.accessvalue === 'string'
              ? JSON.parse(result.accessvalue)
              : result.accessvalue;

          if (Array.isArray(accessValue)) {
            allPermissions.push(...accessValue);
            console.log(
              `Role ${result.roleid} permissions for ${moduleName}:`,
              accessValue,
            );
          }
        }
      }

      console.log(
        `All permissions for roles [${validRoleIds.join(', ')}] on module ${moduleName}:`,
        allPermissions,
      );

      return allPermissions;
    } catch (error) {
      console.error(
        'Error getting user permissions from multiple roles:',
        error,
      );
      return [];
    }
  }

  async generateLoginResponse(user: UserEntity) {
    try {
      // Generate access token
      const accessToken = this.generateAccessToken(user);

      // Generate RBAC tokens for each module
      const rbacTokens: { [key: string]: string } = {};
      const modules = ['appointments', 'customers']; // Add more modules as needed

      // Get assigned roles - ONLY use assignedroles, do NOT use defaultroleid
      if (!user.assignedroles || user.assignedroles.length === 0) {
        console.log(
          `User ${user.id} has no assigned roles. Skipping RBAC token generation.`,
        );
        // Return response without RBAC tokens if no assigned roles
        return {
          status: 'success',
          data: {
            access_token: accessToken,
            rbac_tokens: {},
            user: {
              id: user.id,
              email: user.email,
              defaultroleid: user.defaultroleid,
              assignedroles: user.assignedroles,
            },
          },
        };
      }

      const assignedRoles = user.assignedroles;

      console.log(
        `Generating RBAC tokens for user ${user.id} with assigned roles:`,
        assignedRoles,
      );

      for (const module of modules) {
        // Get permissions from database for this module and all assigned roles
        const permissions = await this.getUserPermissionsFromMultipleRoles(
          assignedRoles,
          module,
        );

        // If no permissions found, skip this module (user has no access)
        if (permissions.length === 0) {
          console.log(
            `Skipping module ${module} - no permissions found for roles [${assignedRoles.join(', ')}]`,
          );
          continue;
        }

        // Create access data for the module with actual database permissions
        const accessData = {
          module: module,
          access: permissions, // Use permissions from database (collected from all assigned roles)
          role: assignedRoles, // Store all assigned roles
          userId: user.id,
          email: user.email,
        };

        // Encrypt the access data
        const encryptedAccess = this.encryptAccessData(accessData);

        // Generate RBAC token with encrypted access data
        rbacTokens[module] = generateRBACToken(
          accessToken,
          user,
          module,
          encryptedAccess,
        );
      }

      const response = {
        status: 'success',
        data: {
          access_token: accessToken,
          rbac_tokens: rbacTokens,
          user: {
            id: user.id,
            email: user.email,
            defaultroleid: user.defaultroleid,
            assignedroles: user.assignedroles,
          },
        },
      };

      return response;
    } catch (error) {
      console.error('Generate login response error:', error);
      throw error;
    }
  }

  private generateAccessToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      id: user.id, // Add explicit id field for RBAC validation
      email: user.email,
      defaultroleid: user.defaultroleid,
      assignedroles: user.assignedroles || [], // Include assigned roles in token
      iat: Math.floor(Date.now() / 1000),
    };

    const secret =
      this.configService.get<string>('JWT_SECRET') || 'defaultsecret';

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION',
        '24h',
      ),
      secret,
      issuer: this.configService.get<string>('JWT_ISSUER', 'nestjs-api'),
      audience: this.configService.get<string>(
        'JWT_AUDIENCE',
        'typescript-app',
      ),
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        statusid: true,
        defaultroleid: true,
      },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.statusid === 3) {
      throw new UnauthorizedException(
        'Account is locked. Please contact support.',
      );
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getLoggedInByUser(req: Request): Promise<string | null> {
    const user = (req as any).user;
    return user?.email ?? null;
  }

  async findExistingUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: {
          id: true,
          email: true,
          statusid: true,
          defaultroleid: true,
          assignedroles: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  /**
   * Encrypt access data using AES-256-CBC
   * @param accessData The access data to encrypt
   * @returns Encrypted string in format "iv:encryptedData"
   */
  private encryptAccessData(accessData: any): string {
    const algorithm = 'aes-256-cbc';
    const secretKey =
      process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    // Generate random IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(JSON.stringify(accessData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV and encrypted data separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
  }

  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      failedloginattempts: 0,
      statusid: 2, // Set to active
    });

    return { message: 'Password reset successfully' };
  }

  async findAndActivateUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (user) {
      // Update user status to active and reset failed login attempts
      user.statusid = 2; // Active status
      user.failedloginattempts = 0;

      await this.userRepository.save(user);

      return user;
    }

    return null;
  }
}
