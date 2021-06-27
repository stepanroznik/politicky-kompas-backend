import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IAnswerAttributes,
    IAnswerCreationAttributes,
    Answer,
} from './entities/answer.entity';
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
export class AnswerService {
    constructor(
        @InjectModel(Answer)
        private readonly answerRepository: typeof Answer,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(AnswerService.name);
    }

    async create(answersToCreate: IAnswerCreationAttributes[]) {
        this.logger.debug('Creating a answer!!', answersToCreate);
        try {
            return await this.answerRepository.bulkCreate(answersToCreate);
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
        const answers = await this.answerRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
        });
        return answers;
    }

    async findOne(
        id: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const answer = await this.answerRepository.findByPk(id, {
            paranoid: !opts.includeDeleted,
        });
        if (!answer)
            throw new NotFoundException(`Answer with id ${id} not found.`);
        return answer;
    }

    async update(
        id: string,
        answerToUpdate: Partial<IAnswerAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const answer = await this.answerRepository.findByPk(id, {
            paranoid: !opts.restore,
        });
        if (!answer)
            throw new NotFoundException(`Answer with id ${id} not found.`);
        try {
            await answer.update(answerToUpdate);
            if (opts.restore) await answer.restore();
            return answer;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(id: string, opts: IServiceRemoveOptions = { force: false }) {
        const answer = await this.answerRepository.findByPk(id, {
            paranoid: !opts.force,
        });
        if (!answer) {
            throw new NotFoundException(`Answer with id ${id} not found.`);
        }
        await answer.destroy({ force: opts.force });
    }
}
