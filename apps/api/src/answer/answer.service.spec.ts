/* eslint-disable @typescript-eslint/no-empty-function */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerModule } from '../common/logger/logger.module';
import {
    IAnswerCreationAttributes,
    Answer,
} from './entities/answer.entity';
import { AnswerMapper } from './answer.mapper';
import { AnswerService } from './answer.service';

const mockAnswerMapper: {
    fromDto?: (x) => any;
    toDto?: (x) => any;
} = {
    fromDto: (x) => JSON.parse(JSON.stringify(x)),
    toDto: (x) => JSON.parse(JSON.stringify(x)),
};

const mockAnswerRepository: {
    bulkCreate?: (x) => Promise<any>;
    findAll?: (x) => Promise<any>;
    findByPk?: (x) => Promise<any>;
    update?: (x, y) => Promise<any>;
    destroy?: (x) => Promise<any>;
} = {};

describe('AnswerService', () => {
    let service: AnswerService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                AnswerService,
                {
                    provide: AnswerMapper,
                    useValue: mockAnswerMapper,
                },
                {
                    provide: getModelToken(Answer),
                    useValue: mockAnswerRepository,
                },
            ],
        }).compile();
        service = module.get<AnswerService>(AnswerService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates answers from a valid data array', async () => {
            const answersToCreate: IAnswerCreationAttributes[] = [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockAnswerRepository.bulkCreate = jest.fn(async (x) => x);
            const answers = await service.create(answersToCreate);
            expect(Array.isArray(answers)).toBe(true);
            expect(answers).toEqual(answersToCreate);
        });

        it('throws an error with invalid data', async () => {
            const answersToCreate = [
                {
                    name: null,
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockAnswerRepository.bulkCreate = jest.fn(async () => {
                throw new Error('name cannot be null');
            });
            try {
                await service.create(answersToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockAnswerRepository.findAll = jest.fn(async () => {
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
            const answers = await service.findAll();
            expect(Array.isArray(answers)).toBe(true);
        });
        it('contains all properties', async () => {
            const answers = await service.findAll();
            expect(answers[0]).toHaveProperty('name');
            expect(answers[0]).toHaveProperty('position');
            expect(answers[0]).toHaveProperty('tagExtractionScript');
            expect(answers[0]).toHaveProperty('tagBubbleMapping');
            expect(answers[0]).toHaveProperty('SourceId');
            expect(answers[0].name).toEqual('test');
            expect(answers[0].position).toEqual('test');
            expect(answers[0].tagExtractionScript).toEqual('test');
            expect(answers[0].tagBubbleMapping).toEqual({ test: 'tost' });
            expect(answers[0].SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });
    });

    describe('findOne', () => {
        it('contains all properties', async () => {
            mockAnswerRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                };
            });
            const answer = await service.findOne('');
            expect(answer).toHaveProperty('name');
            expect(answer).toHaveProperty('position');
            expect(answer).toHaveProperty('tagExtractionScript');
            expect(answer).toHaveProperty('tagBubbleMapping');
            expect(answer).toHaveProperty('SourceId');
            expect(answer.name).toEqual('test');
            expect(answer.position).toEqual('test');
            expect(answer.tagExtractionScript).toEqual('test');
            expect(answer.tagBubbleMapping).toEqual({ test: 'tost' });
            expect(answer.SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });

        it('throws an error when it does not exist', async () => {
            mockAnswerRepository.findByPk = jest.fn(async () => {
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
        it('updates a answer from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockAnswerRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    async update(payload) {
                        mockUpdate(payload);
                        this.name = payload.name;
                    },
                };
            });
            const answer = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(answer).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockAnswerRepository.findByPk = jest.fn(async () => {
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
        it('deletes a answer', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockAnswerRepository.findByPk = jest.fn(async () => ({
                destroy: mockDestroy,
            }));
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockAnswerRepository.findByPk = jest.fn(async () => {
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
