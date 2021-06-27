import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../common/auth/auth.guard';
import { LoggerService } from '../common/logger/logger.service';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { SourceController } from './source.controller';
import { SourceMapper } from './source.mapper';
import { SourceService } from './source.service';

describe('SourceController', () => {
    let controller: SourceController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SourceController],
            providers: [
                {
                    provide: SourceService,
                    useValue: createMock<SourceService>(),
                },
                {
                    provide: WhereParserService,
                    useValue: createMock<WhereParserService>(),
                },
                {
                    provide: SourceMapper,
                    useValue: createMock<SourceMapper>(),
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<SourceController>(SourceController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
