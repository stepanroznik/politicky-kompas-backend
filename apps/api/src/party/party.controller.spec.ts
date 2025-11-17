import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { PartyController } from './party.controller';
import { PartyMapper } from './party.mapper';
import { PartyService } from './party.service';

describe('PartyController', () => {
    let controller: PartyController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PartyController],
            providers: [
                {
                    provide: PartyService,
                    useValue: createMock<PartyService>(),
                },
                {
                    provide: WhereParserService,
                    useValue: createMock<WhereParserService>(),
                },
                {
                    provide: PartyMapper,
                    useValue: createMock<PartyMapper>(),
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        }).compile();

        controller = module.get<PartyController>(PartyController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
