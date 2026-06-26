import {
    ConflictException,
    Injectable,
    NotFoundException,
    Optional,
} from '@nestjs/common';
import { Request } from 'express';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IResultAttributes,
    IResultCreationAttributes,
    Result,
} from './entities/result.entity';
import { LoggerService } from '../common/logger/logger.service';
import { PartyService } from '../party/party.service';
import { getPartyAgreePercentage } from 'calculations';
import * as geoip from 'geoip-lite';
import { IResultAnswer } from './interfaces/result-answer.interface';

const { Op } = Sequelize;

const DUPLICATE_LOOKBACK_MINUTES = 60;
const IP_RATE_LIMIT_WINDOW_MINUTES = 15;
const IP_RATE_LIMIT_THRESHOLD = 5;
const MAX_USER_AGENT_LENGTH = 512;

interface IServiceFindAllOptions {
    where?: Record<string, any> | null;
    includeDeleted?: boolean;
}

interface IServiceFindOneOptions {
    includeDeleted?: boolean;
}

interface IServiceUpdateOptions {
    restore: boolean;
}

interface IServiceRemoveOptions {
    force: boolean;
}
@Injectable()
export class ResultService {
    constructor(
        @InjectModel(Result)
        private readonly resultRepository: typeof Result,
        private partyService: PartyService,
        @Optional() private readonly logger: LoggerService,
    ) {
        this.logger?.setContext(ResultService.name);
    }

    async create(
        resultsToCreate: IResultCreationAttributes,
        noSave = false,
        request?: Request,
    ) {
        this.logger?.debug('Calculating results:', resultsToCreate);
        try {
            const candidatePayload = this.buildResultPayload(
                resultsToCreate,
                request,
            );
            const parties = await this.partyService.findAll({
                includeAnswers: true,
            });
            const agreePercentages = parties.map((party) => {
                const percentage = getPartyAgreePercentage(
                    party.Answers,
                    candidatePayload.answers,
                );
                return { partyId: party.id, percentage };
            });

            const dumpAssessment =
                await this.assessResultForDump(candidatePayload);
            candidatePayload.isDumped = dumpAssessment.isDumped;
            candidatePayload.dumpReason = dumpAssessment.reason;

            if (candidatePayload.isDumped) {
                this.logger?.warn('Result flagged for dumping', {
                    fingerprint: candidatePayload.fingerprint,
                    reason: candidatePayload.dumpReason,
                });
            }

            this.logger?.debug('Creating results:', candidatePayload);
            if (!noSave) await this.resultRepository.create(candidatePayload);
            return agreePercentages;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async findAll(
        opts: IServiceFindAllOptions = {
            includeDeleted: false,
            where: null,
        },
    ) {
        if (opts.where) this.logger?.debug('where:', opts.where);
        const results = await this.resultRepository.findAll({
            where: opts.where ?? undefined,
            paranoid: !opts.includeDeleted,
        });
        return results;
    }

    async findOne(
        ResultId: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const result = await this.resultRepository.findOne({
            where: { id: ResultId },
            paranoid: !opts.includeDeleted,
        });
        if (!result)
            throw new NotFoundException(
                `Result with ResultId ${ResultId} not found.`,
            );
        return result;
    }

    async update(
        ResultId: string,
        resultToUpdate: Partial<IResultAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const result = await this.resultRepository.findOne({
            where: { id: ResultId },
            paranoid: !opts.restore,
        });
        if (!result)
            throw new NotFoundException(
                `Result with ResultId ${ResultId} not found.`,
            );
        try {
            await result.update(resultToUpdate);
            if (opts.restore) await result.restore();
            return result;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(
        ResultId: string,
        opts: IServiceRemoveOptions = { force: false },
    ) {
        const result = await this.resultRepository.findOne({
            where: { id: ResultId },
            paranoid: !opts.force,
        });
        if (!result) {
            throw new NotFoundException(
                `Result with ResultId ${ResultId} not found.`,
            );
        }
        await result.destroy({ force: opts.force });
    }

    private buildResultPayload(
        resultsToCreate: IResultCreationAttributes,
        request?: Request,
    ): IResultCreationAttributes {
        const metadata = this.collectRequestMetadata(
            request,
            resultsToCreate.ipAddress,
        );
        const normalizedIp = this.normalizeIp(
            metadata.ipAddress ?? resultsToCreate.ipAddress,
        );
        const merged: IResultCreationAttributes = {
            ...resultsToCreate,
            ...metadata,
        };

        if (normalizedIp) merged.ipAddress = normalizedIp;
        if (merged.userAgent) {
            merged.userAgent = this.sanitiseUserAgent(merged.userAgent);
        }
        return merged;
    }

    private collectRequestMetadata(
        request: Request | undefined,
        fallbackIp?: string,
    ): Partial<IResultCreationAttributes> {
        if (!request) {
            const ipFromFallback = this.normalizeIp(fallbackIp);
            return ipFromFallback ? { ipAddress: ipFromFallback } : {};
        }

        const metadata: Partial<IResultCreationAttributes> = {};
        const forwardedIp = this.normalizeIp(
            request.headers['x-forwarded-for'] as string | string[] | undefined,
        );
        const requestIp = this.normalizeIp(request.ip);
        const remoteIp = this.normalizeIp(request.socket?.remoteAddress);
        const ipAddress =
            forwardedIp ??
            requestIp ??
            remoteIp ??
            this.normalizeIp(fallbackIp);
        if (ipAddress) metadata.ipAddress = ipAddress;

        const userAgentHeader = request.headers['user-agent'] as
            | string
            | string[]
            | undefined;
        if (typeof userAgentHeader === 'string') {
            metadata.userAgent = userAgentHeader;
        } else if (Array.isArray(userAgentHeader) && userAgentHeader.length) {
            metadata.userAgent = userAgentHeader[0];
        }

        if (metadata.ipAddress) {
            const geo = geoip.lookup(metadata.ipAddress);
            if (geo) {
                metadata.geoCountry = geo.country;
                metadata.geoRegion = geo.region;
                metadata.geoCity = geo.city;
                metadata.geoTimezone = geo.timezone;
                if (Array.isArray(geo.ll)) {
                    metadata.geoLatitude = geo.ll[0];
                    metadata.geoLongitude = geo.ll[1];
                }
            }
        }

        return metadata;
    }

    private sanitiseUserAgent(userAgent?: string) {
        if (!userAgent) return undefined;
        return userAgent.length > MAX_USER_AGENT_LENGTH
            ? userAgent.slice(0, MAX_USER_AGENT_LENGTH)
            : userAgent;
    }

    private normalizeIp(raw?: string | string[]) {
        if (!raw) return undefined;
        const value = Array.isArray(raw) ? raw[0] : raw;
        if (!value) return undefined;
        const normalised = value.split(',')[0]?.trim();
        if (!normalised) return undefined;
        return normalised.replace('::ffff:', '');
    }

    private async assessResultForDump(
        candidatePayload: IResultCreationAttributes,
    ): Promise<{ isDumped: boolean; reason?: string }> {
        const now = Date.now();
        const duplicateCandidate = await this.resultRepository.findOne({
            where: {
                fingerprint: candidatePayload.fingerprint,
                createdAt: {
                    [Op.gte]: new Date(
                        now - DUPLICATE_LOOKBACK_MINUTES * 60 * 1000,
                    ),
                },
            },
            order: [['createdAt', 'DESC']],
        });

        if (
            duplicateCandidate &&
            this.answersEqual(
                duplicateCandidate.answers,
                candidatePayload.answers,
            )
        ) {
            return {
                isDumped: true,
                reason: 'duplicate_fingerprint_answers',
            };
        }

        if (candidatePayload.ipAddress) {
            const recentCount = await this.resultRepository.count({
                where: {
                    ipAddress: candidatePayload.ipAddress,
                    createdAt: {
                        [Op.gte]: new Date(
                            now - IP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
                        ),
                    },
                },
            });

            if (recentCount >= IP_RATE_LIMIT_THRESHOLD) {
                return { isDumped: true, reason: 'ip_rate_limit' };
            }
        }

        return { isDumped: false };
    }

    private answersEqual(
        a: IResultAnswer[] = [],
        b: IResultAnswer[] = [],
    ): boolean {
        if (a.length !== b.length) return false;
        return this.serialiseAnswers(a) === this.serialiseAnswers(b);
    }

    private serialiseAnswers(answers: IResultAnswer[]) {
        return JSON.stringify(
            [...answers].sort((first, second) =>
                first.QuestionId.localeCompare(second.QuestionId),
            ),
        );
    }
}
