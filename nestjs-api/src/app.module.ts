import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SecurityMiddleware } from './middleware/security.middleware';

// ENTITIES
import { UserEntity } from './pages/users/entity/user.entity';
import { UserStatusEntity } from './pages/userstatuses/entity/userstatuses.entity';
import { RoleEntity } from './pages/roles/entity/role.entity';
import { RoleAccessDetailEntity } from './pages/roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleAccessTypeEntity } from './pages/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleAccessOptionEntity } from './pages/roleaccessoptions/entity/roleaccessoption.entity';
import { RoleLineEntity } from './pages/rolelines/entity/roleline.entity';
import { AppointmentEntity } from './pages/appointments/entity/appointment.entity';
import { AppointmentStatusEntity } from './pages/appointmentstatuses/entity/appointmentstatus.entity';
import { AppointmentNumberEntity } from './pages/appointmentnumbers/entity/appointmentnumber.entity';
import { AppointmentSettingEntity } from './pages/appointmentsettings/entity/appointmentsetting.entity';
import { AppointmentWorkflowSettingEntity } from './pages/appointmentworkflowsettings/entity/appointmentworkflowsetting.entity';

// MODULES
import { UserModule } from './pages/users/user.module';
import { AuthModule } from './pages/auth/auth.module';
import { MailModule } from './pages/email/mail.module';
import { RolesModule } from './pages/roles/role.module';
import { UserStatusesModule } from './pages/userstatuses/userstatuses.module';
import { RoleAccessDetailsModule } from './pages/roleaccessdetails/roleaccessdetail.module';
import { RoleAccessTypesModule } from './pages/roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from './pages/roleaccessoptions/roleaccessoption.module';
import { RoleLinesModule } from './pages/rolelines/roleline.module';
import { AppointmentModule } from './pages/appointments/appointment.module';
import { AppointmentStatusModule } from './pages/appointmentstatuses/appointmentstatus.module';
import { AppointmentNumberModule } from './pages/appointmentnumbers/appointmentnumber.module';
import { AppointmentSettingModule } from './pages/appointmentsettings/appointmentsetting.module';
import { AppointmentWorkflowSettingModule } from './pages/appointmentworkflowsettings/appointmentworkflowsetting.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'nestjsds'),
        charset: 'utf8mb4',
        entities: [
          UserEntity,
          UserStatusEntity,
          RoleEntity,
          RoleAccessDetailEntity,
          RoleAccessTypeEntity,
          RoleAccessOptionEntity,
          RoleLineEntity,
          AppointmentEntity,
          AppointmentStatusEntity,
          AppointmentNumberEntity,
          AppointmentSettingEntity,
          AppointmentWorkflowSettingEntity,
        ],
        synchronize: configService.get<boolean>('DB_SYNC', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/assets',
    }),

    AuthModule,
    MailModule,
    UserModule,
    UserStatusesModule,
    RolesModule,
    RoleAccessDetailsModule,
    RoleAccessTypesModule,
    RoleAccessOptionsModule,
    RoleLinesModule,
    AppointmentModule,
    AppointmentStatusModule,
    AppointmentNumberModule,
    AppointmentSettingModule,
    AppointmentWorkflowSettingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
