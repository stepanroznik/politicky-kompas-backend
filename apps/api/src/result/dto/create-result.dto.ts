import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
    ValidateNested,
    IsBoolean,
} from 'class-validator';
import { IResultAnswer } from '../interfaces/result-answer.interface';
import { Type } from 'class-transformer';
import { CreateResultAnswerDto } from './create-result-answer.dto';

export class CreateResultDto {
    @ApiProperty({
        description: "All user's answers in JSON format",
        type: () => CreateResultAnswerDto,
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateResultAnswerDto)
    answers!: IResultAnswer[];

    @ApiProperty({
        description: 'The IP address of the user',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    ipAddress?: string;

    @ApiProperty({
        description: "The fingerprint of the user's browser or device",
        type: String,
    })
    @IsString()
    fingerprint!: string;

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
    gender?: 'male' | 'female' | 'other';

    @ApiProperty({
        description: 'The birth year of the user',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    birthYear?: number;

    @ApiProperty({
        description: 'User agent captured from the request headers',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    userAgent?: string;

    @ApiProperty({
        description: 'Country resolved from the request IP address',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    geoCountry?: string;

    @ApiProperty({
        description: 'Region/state resolved from the request IP address',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    geoRegion?: string;

    @ApiProperty({
        description: 'City resolved from the request IP address',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    geoCity?: string;

    @ApiProperty({
        description: 'Latitude resolved from the request IP address',
        required: false,
        type: Number,
        readOnly: true,
    })
    @IsOptional()
    @IsNumber()
    geoLatitude?: number;

    @ApiProperty({
        description: 'Longitude resolved from the request IP address',
        required: false,
        type: Number,
        readOnly: true,
    })
    @IsOptional()
    @IsNumber()
    geoLongitude?: number;

    @ApiProperty({
        description: 'Timezone resolved from the request IP address',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    geoTimezone?: string;

    @ApiProperty({
        description:
            'Indicates whether the result has been dumped as duplicate or fake',
        required: false,
        type: Boolean,
        default: false,
        readOnly: true,
    })
    @IsOptional()
    @IsBoolean()
    isDumped?: boolean;

    @ApiProperty({
        description: 'Reason for dumping the result if it has been flagged',
        required: false,
        type: String,
        readOnly: true,
    })
    @IsOptional()
    @IsString()
    dumpReason?: string;
}
