import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { uuidProperty } from '../../common/openapi/properties.openapi';
import { ViewQuestionDto } from '../../question/dto/view-question.dto';

export class ViewSourceDto extends TimestampsDto {
    @ApiProperty(uuidProperty)
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @ValidateNested({ each: true })
    questions?: ViewQuestionDto[];
}
