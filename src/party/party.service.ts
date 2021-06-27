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
export class PartyService {
    constructor(
        @InjectModel(Party)
        private readonly partyRepository: typeof Party,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(PartyService.name);
    }

    async create(partysToCreate: IPartyCreationAttributes[]) {
        this.logger.debug('Creating a party!!', partysToCreate);
        try {
            return await this.partyRepository.bulkCreate(partysToCreate);
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
        const partys = await this.partyRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
        });
        return partys;
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
