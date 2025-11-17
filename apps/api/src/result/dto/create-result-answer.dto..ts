import { IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';
import { IResultAnswer } from '../interfaces/result-answer.interface';

export class CreateResultAnswerDto implements IResultAnswer {
    @IsString()
    @IsUUID()
    QuestionId: string;

    @IsNumber()
    @Min(0)
    @Max(5)
    agreeLevel: number;
}
