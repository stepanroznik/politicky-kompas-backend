import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IResultAttributes,
    IResultCreationAttributes,
    Result,
} from './entities/result.entity';
import { LoggerService } from '../common/logger/logger.service';
import { PartyService } from '../party/party.service';
import { getPartyAgreePercentage } from '../common/utils/calculations';

interface IServiceFindAllOptions {
    where?: Record<string, any>;
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
        private readonly logger: LoggerService,
        private partyService: PartyService,
    ) {
        this.logger.setContext(ResultService.name);
    }

    async create(resultsToCreate: IResultCreationAttributes, noSave = false) {
        this.logger.debug('Calculating results:', resultsToCreate);
        try {
            const parties = await this.partyService.findAll({
                includeAnswers: true,
            });
            const agreePercentages = parties.map((party) => {
                const percentage = getPartyAgreePercentage(
                    party.Answers,
                    resultsToCreate.answers,
                );
                return { party: party.id, percentage };
            });
            this.logger.debug('Creating results:', resultsToCreate);
            if (!noSave) await this.resultRepository.create(resultsToCreate);
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
        if (opts.where) this.logger.debug('where:', opts.where);
        const results = await this.resultRepository.findAll({
            where: opts.where,
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
}
