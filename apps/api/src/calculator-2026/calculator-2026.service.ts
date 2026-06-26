import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { Calculator } from './entities/calculator.entity';
import { CalculatorAxis } from './entities/calculator-axis.entity';
import { CalculatorParty } from './entities/calculator-party.entity';
import { CalculatorPartyRating } from './entities/calculator-party-rating.entity';
import { CalculatorQuestion } from './entities/calculator-question.entity';
import { CalculatorSubmission } from './entities/calculator-submission.entity';
import {
    CalculatorScoreResult,
    scoreCalculatorResult,
} from './calculator-2026.scoring';
import { CalculatorAnswerDto } from './dto/create-calculator-result.dto';

const MAX_USER_AGENT_LENGTH = 512;

@Injectable()
export class Calculator2026Service {
    constructor(
        @InjectModel(Calculator)
        private readonly calculatorRepository: typeof Calculator,
        @InjectModel(CalculatorAxis)
        private readonly axisRepository: typeof CalculatorAxis,
        @InjectModel(CalculatorParty)
        private readonly partyRepository: typeof CalculatorParty,
        @InjectModel(CalculatorQuestion)
        private readonly questionRepository: typeof CalculatorQuestion,
        @InjectModel(CalculatorSubmission)
        private readonly submissionRepository: typeof CalculatorSubmission,
    ) {}

    async getCalculator(slug: string) {
        const calculator = await this.calculatorRepository.findByPk(slug);
        if (!calculator) {
            throw new NotFoundException(`Calculator ${slug} not found.`);
        }

        const [axes, parties] = await Promise.all([
            this.axisRepository.findAll({
                where: { calculatorSlug: slug },
                order: [['order', 'ASC']],
            }),
            this.partyRepository.findAll({
                where: { calculatorSlug: slug },
                order: [['code', 'ASC']],
            }),
        ]);

        return {
            ...calculator.toJSON(),
            axes: axes.map((axis) => axis.toJSON()),
            parties: parties.map((party) => party.toJSON()),
        };
    }

    async getQuestions(slug: string) {
        await this.ensureCalculator(slug);
        const questions = await this.questionRepository.findAll({
            where: { calculatorSlug: slug },
            order: [['order', 'ASC']],
        });
        return questions.map((question) => question.toJSON());
    }

    async createResult(
        slug: string,
        answers: CalculatorAnswerDto[],
        fingerprint?: string,
        request?: Request,
    ) {
        await this.ensureCalculator(slug);
        const [questions, parties] = await Promise.all([
            this.questionRepository.findAll({
                where: { calculatorSlug: slug },
                order: [['order', 'ASC']],
            }),
            this.partyRepository.findAll({
                where: { calculatorSlug: slug },
                include: {
                    model: CalculatorPartyRating,
                    required: false,
                },
                order: [['code', 'ASC']],
            }),
        ]);

        const result = scoreCalculatorResult(
            questions.map((question) => ({
                id: question.id,
                axisCode: question.axisCode,
                reversed: question.reversed,
            })),
            parties.map((party) => ({
                code: party.code,
                name: party.name,
                ratings: (party.ratings ?? []).map((rating) => ({
                    questionId: rating.questionId,
                    rating: rating.rating,
                })),
            })),
            answers,
        );

        await this.submissionRepository.create({
            calculatorSlug: slug,
            answers: answers.map((answer) => ({
                questionId: answer.questionId,
                value: answer.value ?? null,
            })),
            result: result as unknown as Record<string, unknown>,
            fingerprint,
            ...this.collectRequestMetadata(request),
        });

        return result;
    }

    private async ensureCalculator(slug: string) {
        const calculator = await this.calculatorRepository.findByPk(slug);
        if (!calculator) {
            throw new NotFoundException(`Calculator ${slug} not found.`);
        }
    }

    private collectRequestMetadata(request?: Request) {
        if (!request) return {};

        const ipAddress = this.normalizeIp(
            (request.headers['x-forwarded-for'] as string | string[] | undefined) ??
                request.ip ??
                request.socket?.remoteAddress,
        );
        const userAgent = this.normalizeUserAgent(request.headers['user-agent']);
        return {
            ...(ipAddress ? { ipAddress } : {}),
            ...(userAgent ? { userAgent } : {}),
        };
    }

    private normalizeIp(raw?: string | string[]) {
        if (!raw) return undefined;
        const value = Array.isArray(raw) ? raw[0] : raw;
        return value.split(',')[0]?.trim().replace('::ffff:', '') || undefined;
    }

    private normalizeUserAgent(raw?: string | string[]) {
        const userAgent = Array.isArray(raw) ? raw[0] : raw;
        if (!userAgent) return undefined;
        return userAgent.length > MAX_USER_AGENT_LENGTH
            ? userAgent.slice(0, MAX_USER_AGENT_LENGTH)
            : userAgent;
    }
}

export type { CalculatorScoreResult };
