import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class ViewPercentagesDto {
    @ApiProperty({ type: String, format: 'uuid' })
    @IsUUID()
    partyId!: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    percentage!: number;
}
