import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ENTITIES } from '@app/domain/entities';

// Las columnas `timestamp` (sin zona) guardan la hora en UTC (now() de
// Postgres). Por defecto `pg` las lee y escribe en la hora local del servidor,
// lo que corría las fechas 5 horas en Perú: se fuerzan a UTC.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pg = require('pg');
const TIMESTAMP_OID = 1114;
pg.types.setTypeParser(TIMESTAMP_OID, (value: string) =>
  value === null ? null : new Date(`${value.replace(' ', 'T')}Z`),
);
pg.defaults.parseInputDatesAsUTC = true;

// En Vercel (NODE_ENV=production) cada función abre su propia conexión y
// arranca en frío: no se sincroniza el esquema ni se registran las consultas
const isProduction = process.env.NODE_ENV === 'production';

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
      logging: !isProduction,
      synchronize: !isProduction,
      extra: isProduction ? { max: 3 } : undefined,
    }),
  ],
})
@Global()
export class DatabaseModule {}
