import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateSourceDto {
    @ApiProperty({ description: 'Name of the source' })
    @IsString()
    name: string;
}
