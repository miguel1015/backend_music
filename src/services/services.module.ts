import { Module } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { SERVICES } from './services';
import { PROFILES } from './profiles';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    InfrastructureModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'test-key'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  providers: [...SERVICES, ...PROFILES],
  exports: [...SERVICES],
})
export class ServiceModule {}
