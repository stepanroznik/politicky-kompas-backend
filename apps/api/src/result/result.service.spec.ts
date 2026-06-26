import { ConflictException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import Sequelize from 'sequelize';
import { IResultCreationAttributes, Result } from './entities/result.entity';
import { ResultService } from './result.service';

const QUESTION_A_ID = '00000000-0000-4000-8000-000000000001';
const QUESTION_B_ID = '00000000-0000-4000-8000-000000000002';
const PARTY_A_ID = '10000000-0000-4000-8000-000000000001';
const PARTY_B_ID = '10000000-0000-4000-8000-000000000002';

function createPayload(
    overrides: Partial<IResultCreationAttributes> = {},
): IResultCreationAttributes {
    return {
        answers: [
            { QuestionId: QUESTION_A_ID, agreeLevel: 5 },
            { QuestionId: QUESTION_B_ID, agreeLevel: 1 },
        ],
        fingerprint: 'fingerprint-1',
        gender: 'other',
        ...overrides,
    };
}

function createRequest(overrides: Partial<Request> = {}) {
    return {
        headers: {
            'x-forwarded-for': '8.8.8.8, 10.0.0.1',
            'user-agent': 'Mozilla/5.0',
        },
        ip: '127.0.0.1',
        socket: {
            remoteAddress: '127.0.0.1',
        },
        ...overrides,
    } as Request;
}

function createService({
    duplicateResult,
    recentIpCount = 0,
    createImpl,
}: {
    duplicateResult?: Partial<Result> | null;
    recentIpCount?: number;
    createImpl?: jest.Mock;
} = {}) {
    const resultRepository = {
        create: createImpl ?? jest.fn(async (payload) => payload),
        findAll: jest.fn(async () => []),
        findOne: jest.fn(async (query) => {
            if (query?.where?.fingerprint) return duplicateResult ?? null;
            return null;
        }),
        count: jest.fn(async () => recentIpCount),
    };
    const partyService = {
        findAll: jest.fn(async () => [
            {
                id: PARTY_A_ID,
                Answers: [
                    { QuestionId: QUESTION_A_ID, agreeLevel: 5 },
                    { QuestionId: QUESTION_B_ID, agreeLevel: 1 },
                ],
            },
            {
                id: PARTY_B_ID,
                Answers: [
                    { QuestionId: QUESTION_A_ID, agreeLevel: 1 },
                    { QuestionId: QUESTION_B_ID, agreeLevel: 5 },
                ],
            },
        ]),
    };
    const logger = {
        setContext: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    };

    const service = new ResultService(
        resultRepository as unknown as typeof Result,
        partyService as any,
        logger as any,
    );

    return { service, resultRepository, partyService, logger };
}

describe('ResultService', () => {
    describe('create', () => {
        it('stores a submission and returns backend-calculated party percentages', async () => {
            const { service, resultRepository } = createService();

            const result = await service.create(
                createPayload(),
                false,
                createRequest(),
            );

            expect(result).toEqual([
                { partyId: PARTY_A_ID, percentage: 100 },
                { partyId: PARTY_B_ID, percentage: 0 },
            ]);
            expect(resultRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    fingerprint: 'fingerprint-1',
                    ipAddress: '8.8.8.8',
                    userAgent: 'Mozilla/5.0',
                    gender: 'other',
                    isDumped: false,
                }),
            );
        });

        it('does not save when noSave is enabled', async () => {
            const { service, resultRepository } = createService();

            await service.create(createPayload(), true, createRequest());

            expect(resultRepository.create).not.toHaveBeenCalled();
        });

        it('marks duplicate fingerprint and answers as dumped', async () => {
            const { service, resultRepository, logger } = createService({
                duplicateResult: {
                    answers: [
                        { QuestionId: QUESTION_B_ID, agreeLevel: 1 },
                        { QuestionId: QUESTION_A_ID, agreeLevel: 5 },
                    ],
                },
            });

            await service.create(createPayload(), false, createRequest());

            expect(resultRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDumped: true,
                    dumpReason: 'duplicate_fingerprint_answers',
                }),
            );
            expect(logger.warn).toHaveBeenCalled();
        });

        it('marks repeated IP submissions as dumped', async () => {
            const { service, resultRepository } = createService({
                recentIpCount: 5,
            });

            await service.create(createPayload(), false, createRequest());

            expect(resultRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDumped: true,
                    dumpReason: 'ip_rate_limit',
                }),
            );
        });

        it('turns sequelize unique constraint errors into conflict exceptions', async () => {
            const { service } = createService({
                createImpl: jest.fn(async () => {
                    throw new Sequelize.UniqueConstraintError({});
                }),
            });

            await expect(
                service.create(createPayload(), false, createRequest()),
            ).rejects.toBeInstanceOf(ConflictException);
        });
    });

    describe('findOne', () => {
        it('throws when the result does not exist', async () => {
            const { service } = createService();

            await expect(service.findOne(PARTY_A_ID)).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });
    });
});
