import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsJSON,
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
} from 'class-validator';
import { IResultAnswer } from '../interfaces/result-answer.interface';
import { TimestampsDto } from '../../common/dto/timestamps.dto';

export class CreateResultDto extends TimestampsDto {
    @ApiProperty({
        description: "All user's answers in JSON format",
    })
    @IsArray()
    @IsJSON()
    answers: IResultAnswer[];

    @ApiProperty({
        description: 'The IP address of the user',
    })
    @IsString()
    ipAddress: string;

    @ApiProperty({
        description: "The fingerprint of the user's browser or device",
    })
    @IsString()
    fingerprint: string;

    @ApiProperty({
        description: 'The ZIP code of the user (PSČ)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    zipCode?: number;

    @ApiProperty({
        description: 'The gender of the user',
    })
    @IsOptional()
    @IsIn(['male', 'female', 'other'])
    gender: 'male' | 'female' | 'other';

    @ApiProperty({
        description: 'The birth year of the user',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    birthYear?: number;
}
