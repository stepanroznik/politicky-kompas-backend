//import { IAnswerCreationAttributes } from '../entities/answer.entity';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsString, IsUUID, Max, Min } from 'class-validator';

const uuidProperty: ApiPropertyOptions = {
    type: 'string',
    format: 'uuid',
};

export class CreateAnswerDto {
    @ApiProperty({
        description:
            "A number 1-5 describing the party's position to the questions's issue (1 = completely agree, 3 = neutral/no opinion, 5 = completely disagree)",
    })
    @Min(1)
    @Max(5)
    @IsString()
    agreeLevel: number;

    @ApiProperty({
        description:
            "Source of information about the party's opinion, preferabily containing short text and an external link",
    })
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
