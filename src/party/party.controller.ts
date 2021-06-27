import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    ParseBoolPipe,
    NotFoundException,
} from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { ArrayValidationPipe } from '../common/pipes/array-validation.pipe';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { PartyMapper } from './party.mapper';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import {
    forceQuery,
    FORCE_QUERY,
    includeDeletedArrayQuery,
    includeDeletedQuery,
    INCLUDE_DELETED_ARRAY_QUERY,
    INCLUDE_DELETED_QUERY,
    restoreQuery,
    RESTORE_QUERY,
    whereQuery,
    WHERE_QUERY,
} from '../common/openapi/query.openapi';
import { idParam } from '../common/openapi/params.openapi';
@ApiTags('Partys')
@Controller('partys')
export class PartyController {
    constructor(
        private readonly partyService: PartyService,
        private readonly partyMapper: PartyMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(PartyController.name);
    }

    @Post()
    @ApiBody({ type: [CreatePartyDto] })
    @ApiOperation({
        summary: 'Creates partys',
    })
    async create(
        @Body(ArrayValidationPipe(CreatePartyDto))
        createPartyDtos: CreatePartyDto[],
    ) {
        const result = await this.partyService.create(
            this.partyMapper.fromDtoArray(createPartyDtos),
        );
        return this.partyMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all partys',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: any,
        @Query(INCLUDE_DELETED_ARRAY_QUERY, ParseBoolPipe)
        includeDeleted: boolean,
    ) {
        const partys = await this.partyService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
        });
        return this.partyMapper.toDtoArray(partys);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(INCLUDE_DELETED_QUERY, ParseBoolPipe) includeDeleted: boolean,
    ) {
        const party = await this.partyService.findOne(id, {
            includeDeleted,
        });
        return this.partyMapper.toDto(party);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, ParseBoolPipe) restore: boolean,
        @Body() updatePartyDto: UpdatePartyDto,
    ) {
        const party = await this.partyService.update(
            id,
            this.partyMapper.fromDto(updatePartyDto),
            {
                restore,
            },
        );
        return this.partyMapper.toDto(party);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Deletes a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, ParseBoolPipe) force: boolean,
    ) {
        try {
            return await this.partyService.remove(id, { force });
        } catch (e) {
            if (e instanceof NotFoundException) {
                return;
            }
            throw e;
        }
    }
}
