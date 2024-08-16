import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ENTITIES } from '@app/domain/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      url: process.env.DB_DATABASE,
      entities: [...ENTITIES],
      logging: true,
      synchronize: true,
    }),
  ],
})
@Global()
export class DatabaseModule {}
