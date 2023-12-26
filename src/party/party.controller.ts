import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    ParseBoolPipe,
    NotFoundException,
    UseGuards,
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
import { ApiKeyGuard } from '../common/api-key.guard';
@ApiTags('Parties')
@Controller('parties')
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
    @UseGuards(ApiKeyGuard)
    @ApiBody({ type: [CreatePartyDto] })
    @ApiOperation({
        summary: 'Creates parties',
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
        summary: 'Finds all parties',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: Record<string, any>,
        @Query(
            INCLUDE_DELETED_ARRAY_QUERY,
            new ParseBoolPipe({ optional: true }),
        )
        includeDeleted: boolean,
        @Query('include-answers', new ParseBoolPipe({ optional: true }))
        includeAnswers: boolean,
    ) {
        const parties = await this.partyService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
            includeAnswers,
        });
        return this.partyMapper.toDtoArray(parties);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(INCLUDE_DELETED_QUERY, new ParseBoolPipe({ optional: true }))
        includeDeleted: boolean,
    ) {
        const party = await this.partyService.findOne(id, {
            includeDeleted,
        });
        return this.partyMapper.toDto(party);
    }

    @Put(':id')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Updates a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, new ParseBoolPipe({ optional: true }))
        restore: boolean,
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
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Deletes a single party by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, new ParseBoolPipe({ optional: true }))
        force: boolean,
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
