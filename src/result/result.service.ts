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
    ) {
        this.logger.setContext(ResultService.name);
    }

    async create(resultsToCreate: IResultCreationAttributes[]) {
        this.logger.debug('Creating a result!!', resultsToCreate);
        try {
            return await this.resultRepository.bulkCreate(resultsToCreate);
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
        QuestionId,
        PartyId,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const result = await this.resultRepository.findOne({
            where: { PartyId, QuestionId },
            paranoid: !opts.includeDeleted,
        });
        if (!result)
            throw new NotFoundException(
                `Result with PartyId ${PartyId} and QuestionId ${QuestionId} not found.`,
            );
        return result;
    }

    async update(
        QuestionId: string,
        PartyId: string,
        resultToUpdate: Partial<IResultAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const result = await this.resultRepository.findOne({
            where: { PartyId, QuestionId },
            paranoid: !opts.restore,
        });
        if (!result)
            throw new NotFoundException(
                `Result with PartyId ${PartyId} and QuestionId ${QuestionId} not found.`,
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
        QuestionId,
        PartyId,
        opts: IServiceRemoveOptions = { force: false },
    ) {
        const result = await this.resultRepository.findOne({
            where: { PartyId, QuestionId },
            paranoid: !opts.force,
        });
        if (!result) {
            throw new NotFoundException(
                `Result with PartyId ${PartyId} and QuestionId ${QuestionId} not found.`,
            );
        }
        await result.destroy({ force: opts.force });
    }
}
