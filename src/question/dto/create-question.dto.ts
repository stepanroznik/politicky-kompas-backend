//import { IQuestionCreationAttributes } from '../entities/question.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({
        description: 'Title of the question',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Subtitle/body of the question',
    })
    @IsString()
    subtitle: string;

    @ApiProperty({
        description:
            'The political compass position of the question (in case of a positive answer)',
        enum: [
            'top-left',
            'top',
            'top-right',
            'left',
            'right',
            'bottom-left',
            'bottom',
            'bottom-right',
        ],
    })
    @IsString()
    regexSequence: string;

    @ApiProperty({
        description:
            'Whether or not does the question belong to the first approx. 24 questions of the quiz',
    })
    @IsBoolean()
    isPrimary: boolean;
}
