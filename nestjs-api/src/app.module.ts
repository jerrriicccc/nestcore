import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SecurityMiddleware } from './middleware/security.middleware';

// ENTITIES
import { User } from './users/entity/user.entity';
import { UserStatus } from './userstatuses/entity/userstatuses.entity';
import { Role } from './roles/entity/role.entity';
import { RoleAccessDetail } from './roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleAccessType } from './roleaccesstypes/entity/roleaccesstype.entity';
import { RoleAccessOption } from './roleaccessoptions/entity/roleaccessoption.entity';
import { RoleLine } from './rolelines/entity/roleline.entity';
import { Appointment } from './appointments/entity/appointment.entity';
import { GroomServiceEntity } from './groomservice/entity/groomservice.entity';
import { DaycareServiceEntity } from './daycareservice/entity/daycareservice.entity';
import { AdditionalServiceEntity } from './additionalservice/entity/additionalservice.entity';
import { TimeScheduleEntity } from './timeschedule/entity/timeschedule.entity';
import { StatusEntity } from './appointmentstatuses/entity/appointmentstatus.entity';
import { CategoryTypeEntity } from './categorytype/entity/categorytype.entity';
import { PetEntryLineEntity } from './petentrylines/entity/petentryline.entity';
import { AppointmentNumberEntity } from './appointmentnumbers/entity/appointmentnumber.entity';
import { AppointmentSettingEntity } from './appointmentsetting/entity/appointmentsetting.entity';

// MODULES
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/role.module';
import { UserStatusesModule } from './userstatuses/userstatuses.module';
import { RoleAccessDetailsModule } from './roleaccessdetails/roleaccessdetail.module';
import { RoleAccessTypesModule } from './roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from './roleaccessoptions/roleaccessoption.module';
import { RoleLinesModule } from './rolelines/roleline.module';
import { AppointmentModule } from './appointments/appointment.module';
import { GroomServiceModule } from './groomservice/groomservice.module';
import { DaycareServiceModule } from './daycareservice/daycareservice.module';
import { AdditionalServiceModule } from './additionalservice/additionalservice.module';
import { TimeScheduleModule } from './timeschedule/timeschedule.module';
import { StatusModule } from './appointmentstatuses/appointmentstatus.module';
import { CategoryTypeModule } from './categorytype/categorytype.module';
import { PetEntryLineModule } from './petentrylines/petentryline.module';
import { AppointmentNumberModule } from './appointmentnumbers/appointmentnumber.module';
import { AppointmentSettingModule } from './appointmentsetting/appointmentsetting.module';

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
          RoleAccessDetail,
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

    MailModule,
    UserModule,
    AuthModule,
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
