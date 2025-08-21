import { ApiProperty } from '@nestjs/swagger';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { IsNumber } from 'class-validator';
import { ViewPartyDto } from '../../party/dto/view-party.dto';

export class ViewPercentagesDto extends TimestampsDto {
    @ApiProperty()
    party: ViewPartyDto[];

    @ApiProperty()
    @IsNumber()
    percentage: string;
}
