import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Max, Min } from 'class-validator';

const uuidProperty: ApiPropertyOptions = {
    type: 'string',
    format: 'uuid',
};

export class CreateAnswerDto {
    @ApiProperty({
        description:
            "A number 1-5 describing the party's position to the questions's issue (1 = completely agree, 3 = neutral/no opinion, 5 = completely disagree)",
        type: Number,
    })
    @Min(1)
    @Max(5)
    @IsInt()
    agreeLevel: number;

    @ApiProperty({
        description:
            "Party's statement that they may have provided while answering this question",
        type: String,
    })
    @IsOptional()
    @IsString()
    statement: string;

    @ApiProperty({
        description:
            "Source of information about the party's opinion, preferably containing short text and an external link",
        type: String,
    })
    @IsOptional()
    @IsString()
    source: string;

    @ApiProperty({
        ...uuidProperty,
        description: 'ID of the linked Question',
    })
    @IsUUID()
    QuestionId: string;

    @ApiProperty({
        ...uuidProperty,
        description: 'ID of the linked Party',
    })
    @IsUUID()
    PartyId: string;
}
