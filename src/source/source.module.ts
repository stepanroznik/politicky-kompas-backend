import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Source } from './entities/source.entity';
import { SourceMapper } from './source.mapper';
import { QuestionModule } from '../question/question.module';
import { Question } from '../question/entities/question.entity';
import { WhereParserModule } from '../common/where-parser/where-parser.module';
import { AuthModule } from '../common/auth/auth.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Source, Question]),
        QuestionModule,
        WhereParserModule,
        AuthModule,
    ],
    controllers: [SourceController],
    providers: [SourceService, SourceMapper],
})
export class SourceModule {}
