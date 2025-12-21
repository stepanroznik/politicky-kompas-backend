import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { uuidProperty } from '../../common/openapi/properties.openapi';

export class ViewAnswerDto extends TimestampsDto {
    @ApiProperty(uuidProperty)
    @IsUUID()
    id!: string;

    @ApiProperty({ type: Number })
    agreeLevel!: number;

    @IsString()
    statement?: string;

    @IsString()
    source?: string;

    @ApiProperty(uuidProperty)
    @IsUUID()
    QuestionId!: string;

    @ApiProperty(uuidProperty)
    @IsUUID()
    PartyId!: string;
}
