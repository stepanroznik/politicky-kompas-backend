import { ApiProperty } from '@nestjs/swagger';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { IsNumber } from 'class-validator';
import { ViewPartyDto } from '../../party/dto/view-party.dto';

export class ViewPercentagesDto extends TimestampsDto {
    @ApiProperty({ type: () => ViewPartyDto, isArray: true })
    party: ViewPartyDto[];

    @ApiProperty({ type: Number })
    @IsNumber()
    percentage: number;
}
