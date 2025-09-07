import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { uuidProperty } from '../../common/openapi/properties.openapi';

export class ViewQuestionDto extends TimestampsDto {
    @ApiProperty(uuidProperty)
    @IsUUID()
    id: string;

    @ApiProperty({ type: String, description: 'Title of the question' })
    @IsString()
    title: string;

    @ApiProperty({
        type: String,
        description: 'Subtitle/body of the question',
        required: false,
    })
    @IsString()
    subtitle: string;

    @ApiProperty({
        type: String,
        description: 'Position of the question on the compass',
    })
    @IsString()
    position: string;

    @ApiProperty({
        type: Boolean,
        description: 'Whether the question is primary',
    })
    @IsBoolean()
    isPrimary: boolean;
}
