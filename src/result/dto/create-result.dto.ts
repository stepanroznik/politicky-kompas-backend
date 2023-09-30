import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Max, Min } from 'class-validator';

const uuidProperty: ApiPropertyOptions = {
    type: 'string',
    format: 'uuid',
};

export class CreateResultDto {
    @ApiProperty({
        description:
            "A number 1-5 describing the party's position to the questions's issue (1 = completely agree, 3 = neutral/no opinion, 5 = completely disagree)",
    })
    @Min(1)
    @Max(5)
    @IsInt()
    agreeLevel: number;

    @ApiProperty({
        description:
            "Party's statement that they may have provided while resulting this question",
    })
    @IsOptional()
    @IsString()
    statement: string;

    @ApiProperty({
        description:
            "Source of information about the party's opinion, preferabily containing short text and an external link",
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
