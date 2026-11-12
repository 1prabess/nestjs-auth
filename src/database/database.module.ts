import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '../configs/database.config.js';
import { ConfigType } from '@nestjs/config';
import { entities } from './entities.js';

@Module({
    imports: [TypeOrmModule.forRootAsync({
        inject: [databaseConfig.KEY],
        useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
            type: 'postgres' as const,
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            entities: entities,
            synchronize: false,
            logging: false,
        })
    })],
    exports: [TypeOrmModule]
})
export class DatabaseModule {}
