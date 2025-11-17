import { Global, Module } from '@nestjs/common';
import { Logger, LoggerService } from './logger.service';

@Global()
@Module({
    providers: [Logger, LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {}
