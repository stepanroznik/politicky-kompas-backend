import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { ViewPartyDto } from './dto/view-party.dto';
import {
    Party,
    IPartyAttributes,
    IPartyCreationAttributes,
} from './entities/party.entity';

@Injectable()
export class PartyMapper extends BaseMapper<
    CreatePartyDto,
    UpdatePartyDto,
    ViewPartyDto,
    IPartyCreationAttributes,
    IPartyAttributes,
    Party
> {
    fromDto(dto: CreatePartyDto): IPartyCreationAttributes;
    fromDto(dto: UpdatePartyDto): Partial<IPartyAttributes>;
    fromDto(dto: CreatePartyDto | UpdatePartyDto) {
        return dto;
    }
    toDto(inst: Party): ViewPartyDto {
        const ret = {
            ...(inst.toJSON() as IPartyAttributes),
        };
        return ret;
    }
}
