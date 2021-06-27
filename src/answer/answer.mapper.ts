import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ViewAnswerDto } from './dto/view-answer.dto';
import {
    Answer,
    IAnswerAttributes,
    IAnswerCreationAttributes,
} from './entities/answer.entity';

@Injectable()
export class AnswerMapper extends BaseMapper<
    CreateAnswerDto,
    UpdateAnswerDto,
    ViewAnswerDto,
    IAnswerCreationAttributes,
    IAnswerAttributes,
    Answer
> {
    fromDto(dto: CreateAnswerDto): IAnswerCreationAttributes;
    fromDto(dto: UpdateAnswerDto): Partial<IAnswerAttributes>;
    fromDto(dto: CreateAnswerDto | UpdateAnswerDto) {
        return dto;
    }
    toDto(inst: Answer): ViewAnswerDto {
        const ret = {
            ...(inst.toJSON() as IAnswerAttributes),
        };
        return ret;
    }
}
