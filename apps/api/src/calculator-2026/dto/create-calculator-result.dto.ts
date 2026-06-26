import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

export class CalculatorAnswerDto {
    @ApiProperty({ type: String })
    @IsString()
    questionId!: string;

    @ApiProperty({ type: Number, required: false, nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    value?: number | null;
}

export class CreateCalculatorResultDto {
    @ApiProperty({ type: () => CalculatorAnswerDto, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CalculatorAnswerDto)
    answers!: CalculatorAnswerDto[];

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    fingerprint?: string;
}
