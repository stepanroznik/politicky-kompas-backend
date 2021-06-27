import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { AnswerController } from './answer.controller';
import { AnswerMapper } from './answer.mapper';
import { AnswerService } from './answer.service';

describe('AnswerController', () => {
    let controller: AnswerController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AnswerController],
            providers: [
                {
                    provide: AnswerService,
                    useValue: createMock<AnswerService>(),
                },
                {
                    provide: WhereParserService,
                    useValue: createMock<WhereParserService>(),
                },
                {
                    provide: AnswerMapper,
                    useValue: createMock<AnswerMapper>(),
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        }).compile();

        controller = module.get<AnswerController>(AnswerController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
