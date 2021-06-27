//import { IPartyCreationAttributes } from '../entities/party.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePartyDto {
    @ApiProperty({
        description: 'Name of the party',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Abbreviation of the party',
    })
    @IsString()
    abbreviation: string;

    @ApiProperty({
        description:
            'Placeholder for a link to an external API for more information about the party (icon, description, etc.)',
    })
    @IsString()
    externalId: string;
}
