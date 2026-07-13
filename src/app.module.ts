import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";
import { APP_FILTER } from "@nestjs/core";

import { AuthModule } from "./modules/auth/auth.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AppDataSource } from "./common/database/data-source";
import { loggerModuleConfig } from "./common/logger/logger.config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(loggerModuleConfig), 
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV !== "production",
    }),
    AuthModule,
    TasksModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}