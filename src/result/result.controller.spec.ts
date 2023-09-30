import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { ResultController } from './result.controller';
import { ResultMapper } from './result.mapper';
import { ResultService } from './result.service';

describe('ResultController', () => {
    let controller: ResultController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ResultController],
            providers: [
                {
                    provide: ResultService,
                    useValue: createMock<ResultService>(),
                },
                {
                    provide: WhereParserService,
                    useValue: createMock<WhereParserService>(),
                },
                {
                    provide: ResultMapper,
                    useValue: createMock<ResultMapper>(),
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        }).compile();

        controller = module.get<ResultController>(ResultController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
