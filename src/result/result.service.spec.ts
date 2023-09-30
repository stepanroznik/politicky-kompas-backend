/* eslint-disable @typescript-eslint/no-empty-function */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerModule } from '../common/logger/logger.module';
import { IResultCreationAttributes, Result } from './entities/result.entity';
import { ResultMapper } from './result.mapper';
import { ResultService } from './result.service';

const mockResultMapper: {
    fromDto?: (x) => any;
    toDto?: (x) => any;
} = {
    fromDto: (x) => JSON.parse(JSON.stringify(x)),
    toDto: (x) => JSON.parse(JSON.stringify(x)),
};

const mockResultRepository: {
    bulkCreate?: (x) => Promise<any>;
    findAll?: (x) => Promise<any>;
    findByPk?: (x) => Promise<any>;
    update?: (x, y) => Promise<any>;
    destroy?: (x) => Promise<any>;
} = {};

describe('ResultService', () => {
    let service: ResultService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                ResultService,
                {
                    provide: ResultMapper,
                    useValue: mockResultMapper,
                },
                {
                    provide: getModelToken(Result),
                    useValue: mockResultRepository,
                },
            ],
        }).compile();
        service = module.get<ResultService>(ResultService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates results from a valid data array', async () => {
            const resultsToCreate: IResultCreationAttributes[] = [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockResultRepository.bulkCreate = jest.fn(async (x) => x);
            const results = await service.create(resultsToCreate);
            expect(Array.isArray(results)).toBe(true);
            expect(results).toEqual(resultsToCreate);
        });

        it('throws an error with invalid data', async () => {
            const resultsToCreate = [
                {
                    name: null,
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockResultRepository.bulkCreate = jest.fn(async () => {
                throw new Error('name cannot be null');
            });
            try {
                await service.create(resultsToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockResultRepository.findAll = jest.fn(async () => {
            return [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
        });
        it('returns an array', async () => {
            const results = await service.findAll();
            expect(Array.isArray(results)).toBe(true);
        });
        it('contains all properties', async () => {
            const results = await service.findAll();
            expect(results[0]).toHaveProperty('name');
            expect(results[0]).toHaveProperty('position');
            expect(results[0]).toHaveProperty('tagExtractionScript');
            expect(results[0]).toHaveProperty('tagBubbleMapping');
            expect(results[0]).toHaveProperty('SourceId');
            expect(results[0].name).toEqual('test');
            expect(results[0].position).toEqual('test');
            expect(results[0].tagExtractionScript).toEqual('test');
            expect(results[0].tagBubbleMapping).toEqual({ test: 'tost' });
            expect(results[0].SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });
    });

    describe('findOne', () => {
        it('contains all properties', async () => {
            mockResultRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                };
            });
            const result = await service.findOne('');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('position');
            expect(result).toHaveProperty('tagExtractionScript');
            expect(result).toHaveProperty('tagBubbleMapping');
            expect(result).toHaveProperty('SourceId');
            expect(result.name).toEqual('test');
            expect(result.position).toEqual('test');
            expect(result.tagExtractionScript).toEqual('test');
            expect(result.tagBubbleMapping).toEqual({ test: 'tost' });
            expect(result.SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });

        it('throws an error when it does not exist', async () => {
            mockResultRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.findOne('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('update', () => {
        it('updates a result from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockResultRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    async update(payload) {
                        mockUpdate(payload);
                        this.name = payload.name;
                    },
                };
            });
            const result = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(result).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockResultRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.update('', { name: 'test' });
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('remove', () => {
        it('deletes a result', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockResultRepository.findByPk = jest.fn(async () => ({
                destroy: mockDestroy,
            }));
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockResultRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.remove('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });
});
