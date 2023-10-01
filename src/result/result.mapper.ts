import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ViewResultDto } from './dto/view-result.dto';
import {
    Result,
    IResultAttributes,
    IResultCreationAttributes,
} from './entities/result.entity';

@Injectable()
export class ResultMapper extends BaseMapper<
    CreateResultDto,
    UpdateResultDto,
    ViewResultDto,
    IResultCreationAttributes,
    IResultAttributes,
    Result
> {
    fromDto(dto: CreateResultDto): IResultCreationAttributes;
    fromDto(dto: UpdateResultDto): Partial<IResultAttributes>;
    fromDto(dto: CreateResultDto | UpdateResultDto) {
        return dto;
    }
    toDto(inst: Result): ViewResultDto {
        const rawResult = inst.toJSON() as IResultAttributes;
        return new ViewResultDto(rawResult);
    }
}
