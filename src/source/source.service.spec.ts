import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerService } from '../common/logger/logger.service';
import { ISourceCreationAttributes, Source } from './entities/source.entity';
import { SourceService } from './source.service';

const mockSourceRepository = createMock<typeof Source>();

describe('SourceService', () => {
    let service: SourceService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SourceService,
                {
                    provide: getModelToken(Source),
                    useValue: mockSourceRepository,
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        }).compile();
        service = module.get<SourceService>(SourceService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates sources from a valid data array', async () => {
            const sourcesToCreate: ISourceCreationAttributes[] = [
                {
                    name: 'test',
                },
            ];
            mockSourceRepository.bulkCreate.mockImplementation(
                async (x) => x as any,
            );
            const sources = await service.create(sourcesToCreate);
            expect(Array.isArray(sources)).toBe(true);
            expect(sources).toEqual(sourcesToCreate);
        });

        it('throws an error with invalid data', async () => {
            const sourcesToCreate = [
                {
                    name: null,
                },
            ];
            mockSourceRepository.bulkCreate.mockRejectedValue(
                new Error('name cannot be null'),
            );
            try {
                await service.create(sourcesToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockSourceRepository.findAll.mockResolvedValue([
            { name: 'test' },
        ] as any);
        it('returns an array', async () => {
            const sources = await service.findAll();
            expect(Array.isArray(sources)).toBe(true);
        });
        it('contains a name', async () => {
            const sources = await service.findAll();
            expect(sources[0]).toHaveProperty('name');
            expect(sources[0].name).toEqual('test');
        });
    });

    describe('findOne', () => {
        it('contains a name', async () => {
            mockSourceRepository.findByPk.mockResolvedValue({
                name: 'test',
            } as any);
            const source = await service.findOne('');
            expect(source).toHaveProperty('name');
            expect(source.name).toEqual('test');
        });

        it('throws an error when it does not exist', async () => {
            mockSourceRepository.findByPk.mockResolvedValue(null);
            try {
                await service.findOne('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('update', () => {
        it('updates a source from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockSourceRepository.findByPk.mockResolvedValue({
                name: 'test',
                async update(payload) {
                    mockUpdate(payload);
                    this.name = payload.name;
                },
            } as any);
            const source = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(source).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockSourceRepository.findByPk.mockResolvedValue(null);
            try {
                await service.update('', { name: 'test' });
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('remove', () => {
        it('deletes a source', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockSourceRepository.findByPk.mockResolvedValue({
                destroy: mockDestroy,
            } as any);
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockSourceRepository.findByPk.mockResolvedValue(null);
            try {
                await service.remove('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });
});
