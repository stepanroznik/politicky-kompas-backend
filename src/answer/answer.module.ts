import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Answer } from './entities/answer.entity';
import { AnswerMapper } from './answer.mapper';
import { WhereParserModule } from '../common/where-parser/where-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([Answer]), WhereParserModule],
    exports: [AnswerMapper],
    controllers: [AnswerController],
    providers: [AnswerService, AnswerMapper],
})
export class AnswerModule {}
