import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { QuestionMapper } from '../question/question.mapper';
import { UpdateQuestionDto } from '../question/dto/update-question.dto';
import { CreateSourceDto } from './dto/create-source.dto';
import { ViewSourceDto } from './dto/view-source.dto';
import {
    ISourceAttributes,
    ISourceCreationAttributes,
    Source,
} from './entities/source.entity';

@Injectable()
export class SourceMapper extends BaseMapper<
    CreateSourceDto,
    UpdateQuestionDto,
    ViewSourceDto,
    ISourceCreationAttributes,
    ISourceAttributes,
    Source
> {
    constructor(private questionMapper: QuestionMapper) {
        super();
    }

    fromDto(dto: CreateSourceDto): ISourceCreationAttributes;
    fromDto(dto: UpdateQuestionDto): Partial<ISourceAttributes>;
    fromDto(dto: CreateSourceDto | UpdateQuestionDto) {
        const ret = {
            ...dto,
        };
        return ret;
    }
    toDto(inst: Source): ViewSourceDto {
        const ret: any = {
            ...(inst.toJSON() as ISourceAttributes),
        };
        if (inst.Questions) {
            ret.questions = inst.Questions.map((c) =>
                this.questionMapper.toDto(c),
            );
        }
        delete ret.Questions;
        return ret as ViewSourceDto;
    }
}
