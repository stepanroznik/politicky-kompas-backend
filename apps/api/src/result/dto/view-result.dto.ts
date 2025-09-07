import { ApiProperty } from '@nestjs/swagger';
import { IResultAnswer } from '../interfaces/result-answer.interface';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { genders } from '../entities/result.entity';

export class ViewResultDto extends TimestampsDto {
    @ApiProperty({ type: String })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: "All user's answers in JSON format",
        type: () => Object,
        isArray: true,
    })
    answers: IResultAnswer[];

    @ApiProperty({
        description: 'The ZIP code of the user',
        type: Number,
    })
    @IsString()
    @IsOptional()
    zipCode: number;

    @ApiProperty({
        description: 'The gender of the user',
        type: String,
    })
    @IsIn(genders)
    @IsOptional()
    gender: 'male' | 'female' | 'other';

    @ApiProperty({
        description: 'The birth year of the user',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    birthYear: number;

    @ApiProperty({
        description: "User's age calculated based on the birth year",
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    age: number;

    constructor(data: Partial<ViewResultDto>) {
        super();
        Object.assign(this, data);

        if (this.birthYear) {
            const currentYear = new Date().getFullYear();
            this.age = currentYear - this.birthYear;
        }
    }
}
