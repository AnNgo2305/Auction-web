import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@generated/prisma/client';
import { LoggerService } from '@common/services/logger.service';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import {
  QueryEvent,
  LogEvent,
} from '@generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: LoggerService) {
    const mySQLAdapter = new PrismaMariaDb({
      host: process.env.MYSQL_DB_HOST,
      port: Number(process.env.MYSQL_DB_PORT),
      user: process.env.MYSQL_DB_USERNAME,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_DATABASE_NAME,
      connectionLimit: 10,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      idleTimeout: 60000,
    });

    super({
      adapter: mySQLAdapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
    });

    this.logger.log('PrismaClient initialized successfully');

    // QUERY LOG
    // @ts-ignore
    this.$on('query', (e: QueryEvent) => {
      if (e.duration > 200) {
        this.logger.warn(`SLOW QUERY (${e.duration}ms): ${e.query}`);
      } else {
        this.logger.log(`QUERY (${e.duration}ms): ${e.query}`);
      }
    });

    // INFO LOG
    // @ts-ignore
    this.$on('info', (e: LogEvent) => {
      this.logger.log(`[PRISMA INFO] ${e.message}`);
    });

    // WARN LOG
    // @ts-ignore
    this.$on('warn', (e: LogEvent) => {
      this.logger.warn(`[PRISMA WARN] ${e.message}`);
    });

    // ERROR LOG
    // @ts-ignore
    this.$on('error', (e: LogEvent) => {
      this.logger.error(`[PRISMA ERROR] ${e.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected successfully');
  }
}
