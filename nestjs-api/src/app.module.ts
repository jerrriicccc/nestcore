import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SecurityMiddleware } from './middleware/security.middleware';

// ENTITIES
import { User } from './pages/users/entity/user.entity';
import { UserStatus } from './pages/userstatuses/entity/userstatuses.entity';
import { Role } from './pages/roles/entity/role.entity';
import { RoleAccessDetailEntity } from './pages/roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleAccessType } from './pages/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleAccessOption } from './pages/roleaccessoptions/entity/roleaccessoption.entity';
import { RoleLine } from './pages/rolelines/entity/roleline.entity';
import { Appointment } from './pages/appointments/entity/appointment.entity';
import { GroomServiceEntity } from './pages/groomservice/entity/groomservice.entity';
import { DaycareServiceEntity } from './pages/daycareservice/entity/daycareservice.entity';
import { AdditionalServiceEntity } from './pages/additionalservice/entity/additionalservice.entity';
import { TimeScheduleEntity } from './pages/timeschedule/entity/timeschedule.entity';
import { StatusEntity } from './pages/appointmentstatuses/entity/appointmentstatus.entity';
import { CategoryTypeEntity } from './pages/categorytype/entity/categorytype.entity';
import { PetEntryLineEntity } from './pages/petentrylines/entity/petentryline.entity';
import { AppointmentNumberEntity } from './pages/appointmentnumbers/entity/appointmentnumber.entity';
import { AppointmentSettingEntity } from './pages/appointmentsetting/entity/appointmentsetting.entity';

// MODULES
import { UserModule } from './pages/users/user.module';
import { AuthModule } from './pages/auth/auth.module';
import { MailModule } from './pages/mail/mail.module';
import { RolesModule } from './pages/roles/role.module';
import { UserStatusesModule } from './pages/userstatuses/userstatuses.module';
import { RoleAccessDetailsModule } from './pages/roleaccessdetails/roleaccessdetail.module';
import { RoleAccessTypesModule } from './pages/roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from './pages/roleaccessoptions/roleaccessoption.module';
import { RoleLinesModule } from './pages/rolelines/roleline.module';
import { AppointmentModule } from './pages/appointments/appointment.module';
import { GroomServiceModule } from './pages/groomservice/groomservice.module';
import { DaycareServiceModule } from './pages/daycareservice/daycareservice.module';
import { AdditionalServiceModule } from './pages/additionalservice/additionalservice.module';
import { TimeScheduleModule } from './pages/timeschedule/timeschedule.module';
import { StatusModule } from './pages/appointmentstatuses/appointmentstatus.module';
import { CategoryTypeModule } from './pages/categorytype/categorytype.module';
import { PetEntryLineModule } from './pages/petentrylines/petentryline.module';
import { AppointmentNumberModule } from './pages/appointmentnumbers/appointmentnumber.module';
import { AppointmentSettingModule } from './pages/appointmentsetting/appointmentsetting.module';

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
          User,
          UserStatus,
          Role,
          RoleAccessDetailEntity,
          RoleAccessType,
          RoleAccessOption,
          RoleLine,
          Appointment,
          GroomServiceEntity,
          DaycareServiceEntity,
          AdditionalServiceEntity,
          TimeScheduleEntity,
          StatusEntity,
          CategoryTypeEntity,
          PetEntryLineEntity,
          AppointmentNumberEntity,
          AppointmentSettingEntity,
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
    GroomServiceModule,
    DaycareServiceModule,
    AdditionalServiceModule,
    TimeScheduleModule,
    StatusModule,
    CategoryTypeModule,
    PetEntryLineModule,
    AppointmentNumberModule,
    AppointmentSettingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
