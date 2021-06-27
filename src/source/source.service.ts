import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    ISourceAttributes,
    ISourceCreationAttributes,
    Source,
} from './entities/source.entity';
import { Question } from '../question/entities/question.entity';
import { LoggerService } from '../common/logger/logger.service';

interface IServiceFindAllOptions {
    where?: Record<string, any>;
    includeDeleted?: boolean;
    withQuestions?: boolean;
}

interface IServiceFindOneOptions {
    includeDeleted?: boolean;
    withQuestions?: boolean;
}

interface IServiceUpdateOptions {
    restore: boolean;
}

interface IServiceRemoveOptions {
    force: boolean;
}
@Injectable()
export class SourceService {
    constructor(
        @InjectModel(Source)
        private readonly sourceRepository: typeof Source,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(SourceService.name);
    }

    async create(sourcesToCreate: ISourceCreationAttributes[]) {
        this.logger.debug('Creating a source!!', sourcesToCreate);
        try {
            return await this.sourceRepository.bulkCreate(sourcesToCreate);
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async findAll(
        opts: IServiceFindAllOptions = {
            includeDeleted: false,
            withQuestions: false,
            where: null,
        },
    ) {
        if (opts.where) this.logger.debug('where:', opts.where);
        const sources = await this.sourceRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
            include: opts.withQuestions
                ? [
                      {
                          model: Question,
                          attributes: { exclude: ['tagExtractionScript'] },
                      },
                  ]
                : null,
        });
        return sources;
    }

    async findOne(
        id: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
            withQuestions: false,
        },
    ) {
        const source = await this.sourceRepository.findByPk(id, {
            paranoid: !opts.includeDeleted,
            include: opts.withQuestions
                ? [
                      {
                          model: Question,
                          attributes: { exclude: ['tagExtractionScript'] },
                      },
                  ]
                : null,
        });
        if (!source)
            throw new NotFoundException(`Source with id ${id} not found.`);
        return source;
    }

    async update(
        id: string,
        sourceToUpdate: Partial<ISourceAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const source = await this.sourceRepository.findByPk(id, {
            paranoid: !opts.restore,
        });
        if (!source)
            throw new NotFoundException(`Source with id ${id} not found.`);
        try {
            await source.update(sourceToUpdate);
            if (opts.restore) await source.restore();
            return source;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(id: string, opts: IServiceRemoveOptions = { force: false }) {
        const source = await this.sourceRepository.findByPk(id, {
            paranoid: !opts.force,
        });
        if (!source)
            throw new NotFoundException(`Source with id ${id} not found.`);
        await source.destroy({ force: opts.force });
        return {};
    }
}
