import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
    ValidateNested,
    ArrayMinSize,
    ArrayMaxSize,
} from 'class-validator';
import { IResultAnswer } from '../interfaces/result-answer.interface';
import { Type } from 'class-transformer';
import { CreateResultAnswerDto } from './create-result-answer.dto.';

export class CreateResultDto {
    @ApiProperty({
        description: "All user's answers in JSON format",
        type: () => CreateResultAnswerDto,
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(30)
    @ArrayMaxSize(42)
    @Type(() => CreateResultAnswerDto)
    answers: IResultAnswer[];

    @ApiProperty({
        description: 'The IP address of the user',
        type: String,
    })
    @IsString()
    ipAddress: string;

    @ApiProperty({
        description: "The fingerprint of the user's browser or device",
        type: String,
    })
    @IsString()
    fingerprint: string;

    @ApiProperty({
        description: 'The ZIP code of the user (PSČ)',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    zipCode?: number;

    @ApiProperty({
        description: 'The gender of the user',
        type: String,
    })
    @IsOptional()
    @IsIn(['male', 'female', 'other'])
    gender: 'male' | 'female' | 'other';

    @ApiProperty({
        description: 'The birth year of the user',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    birthYear?: number;
}
