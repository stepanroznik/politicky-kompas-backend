/* eslint-disable @typescript-eslint/no-empty-function */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerModule } from '../common/logger/logger.module';
import {
    IPartyCreationAttributes,
    Party,
} from './entities/party.entity';
import { PartyMapper } from './party.mapper';
import { PartyService } from './party.service';

const mockPartyMapper: {
    fromDto?: (x) => any;
    toDto?: (x) => any;
} = {
    fromDto: (x) => JSON.parse(JSON.stringify(x)),
    toDto: (x) => JSON.parse(JSON.stringify(x)),
};

const mockPartyRepository: {
    bulkCreate?: (x) => Promise<any>;
    findAll?: (x) => Promise<any>;
    findByPk?: (x) => Promise<any>;
    update?: (x, y) => Promise<any>;
    destroy?: (x) => Promise<any>;
} = {};

describe('PartyService', () => {
    let service: PartyService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                PartyService,
                {
                    provide: PartyMapper,
                    useValue: mockPartyMapper,
                },
                {
                    provide: getModelToken(Party),
                    useValue: mockPartyRepository,
                },
            ],
        }).compile();
        service = module.get<PartyService>(PartyService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates partys from a valid data array', async () => {
            const partysToCreate: IPartyCreationAttributes[] = [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockPartyRepository.bulkCreate = jest.fn(async (x) => x);
            const partys = await service.create(partysToCreate);
            expect(Array.isArray(partys)).toBe(true);
            expect(partys).toEqual(partysToCreate);
        });

        it('throws an error with invalid data', async () => {
            const partysToCreate = [
                {
                    name: null,
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockPartyRepository.bulkCreate = jest.fn(async () => {
                throw new Error('name cannot be null');
            });
            try {
                await service.create(partysToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockPartyRepository.findAll = jest.fn(async () => {
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
            const partys = await service.findAll();
            expect(Array.isArray(partys)).toBe(true);
        });
        it('contains all properties', async () => {
            const partys = await service.findAll();
            expect(partys[0]).toHaveProperty('name');
            expect(partys[0]).toHaveProperty('position');
            expect(partys[0]).toHaveProperty('tagExtractionScript');
            expect(partys[0]).toHaveProperty('tagBubbleMapping');
            expect(partys[0]).toHaveProperty('SourceId');
            expect(partys[0].name).toEqual('test');
            expect(partys[0].position).toEqual('test');
            expect(partys[0].tagExtractionScript).toEqual('test');
            expect(partys[0].tagBubbleMapping).toEqual({ test: 'tost' });
            expect(partys[0].SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });
    });

    describe('findOne', () => {
        it('contains all properties', async () => {
            mockPartyRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                };
            });
            const party = await service.findOne('');
            expect(party).toHaveProperty('name');
            expect(party).toHaveProperty('position');
            expect(party).toHaveProperty('tagExtractionScript');
            expect(party).toHaveProperty('tagBubbleMapping');
            expect(party).toHaveProperty('SourceId');
            expect(party.name).toEqual('test');
            expect(party.position).toEqual('test');
            expect(party.tagExtractionScript).toEqual('test');
            expect(party.tagBubbleMapping).toEqual({ test: 'tost' });
            expect(party.SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });

        it('throws an error when it does not exist', async () => {
            mockPartyRepository.findByPk = jest.fn(async () => {
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
        it('updates a party from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockPartyRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    async update(payload) {
                        mockUpdate(payload);
                        this.name = payload.name;
                    },
                };
            });
            const party = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(party).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockPartyRepository.findByPk = jest.fn(async () => {
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
        it('deletes a party', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockPartyRepository.findByPk = jest.fn(async () => ({
                destroy: mockDestroy,
            }));
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockPartyRepository.findByPk = jest.fn(async () => {
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
