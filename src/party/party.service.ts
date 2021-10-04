import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IPartyAttributes,
    IPartyCreationAttributes,
    Party,
} from './entities/party.entity';
import { LoggerService } from '../common/logger/logger.service';
import { Question } from '../question/entities/question.entity';
import { Answer } from '../answer/entities/answer.entity';

interface IServiceFindAllOptions {
    where?: Record<string, any>;
    includeDeleted?: boolean;
    includeAnswers?: boolean;
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
export class PartyService {
    constructor(
        @InjectModel(Party)
        private readonly partyRepository: typeof Party,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(PartyService.name);
    }

    async create(partiesToCreate: IPartyCreationAttributes[]) {
        this.logger.debug('Creating a party!!', partiesToCreate);
        try {
            return await this.partyRepository.bulkCreate(partiesToCreate);
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async findAll(
        opts: IServiceFindAllOptions = {
            includeDeleted: false,
            includeAnswers: false,
            where: null,
        },
    ) {
        if (opts.where) this.logger.debug('where:', opts.where);
        const parties = await this.partyRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
            include: opts.includeAnswers
                ? {
                      model: Answer,
                      attributes: ['agreeLevel'],
                      include: {
                          model: Question,
                          attributes: ['id', 'position'],
                          //   where: {
                          //       position: {
                          //           [Sequelize.Op.ne]: 'center',
                          //       },
                          //   },
                      } as any,
                  }
                : undefined,
            order: Sequelize.literal('random()'),
        });
        return parties;
    }

    async findOne(
        id: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const party = await this.partyRepository.findByPk(id, {
            paranoid: !opts.includeDeleted,
        });
        if (!party)
            throw new NotFoundException(`Party with id ${id} not found.`);
        return party;
    }

    async update(
        id: string,
        partyToUpdate: Partial<IPartyAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const party = await this.partyRepository.findByPk(id, {
            paranoid: !opts.restore,
        });
        if (!party)
            throw new NotFoundException(`Party with id ${id} not found.`);
        try {
            await party.update(partyToUpdate);
            if (opts.restore) await party.restore();
            return party;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(id: string, opts: IServiceRemoveOptions = { force: false }) {
        const party = await this.partyRepository.findByPk(id, {
            paranoid: !opts.force,
        });
        if (!party) {
            throw new NotFoundException(`Party with id ${id} not found.`);
        }
        await party.destroy({ force: opts.force });
    }
}
