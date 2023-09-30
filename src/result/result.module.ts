import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Result } from './entities/result.entity';
import { ResultMapper } from './result.mapper';
import { WhereParserModule } from '../common/where-parser/where-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([Result]), WhereParserModule],
    exports: [ResultMapper],
    controllers: [ResultController],
    providers: [ResultService, ResultMapper],
})
export class ResultModule {}
