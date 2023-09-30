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
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ArrayValidationPipe } from '../common/pipes/array-validation.pipe';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { ResultMapper } from './result.mapper';
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
@ApiTags('Results')
@Controller('results')
export class ResultController {
    constructor(
        private readonly resultService: ResultService,
        private readonly resultMapper: ResultMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(ResultController.name);
    }

    @Post()
    @UseGuards(ApiKeyGuard)
    @ApiBody({ type: [CreateResultDto] })
    @ApiOperation({
        summary: 'Creates results',
    })
    async create(
        @Body(ArrayValidationPipe(CreateResultDto))
        createResultDtos: CreateResultDto[],
    ) {
        const result = await this.resultService.create(
            this.resultMapper.fromDtoArray(createResultDtos),
        );
        return this.resultMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all results',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: any,
        @Query(
            INCLUDE_DELETED_ARRAY_QUERY,
            new ParseBoolPipe({ optional: true }),
        )
        includeDeleted: boolean,
    ) {
        const results = await this.resultService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
        });
        return this.resultMapper.toDtoArray(results);
    }

    @Get(':QuestionId/:PartyId')
    @ApiOperation({
        summary: 'Finds a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('QuestionId', new ParseUUIDPipe()) QuestionId: string,
        @Param('PartyId', new ParseUUIDPipe()) PartyId: string,
        @Query(INCLUDE_DELETED_QUERY, new ParseBoolPipe({ optional: true }))
        includeDeleted: boolean,
    ) {
        const result = await this.resultService.findOne(QuestionId, PartyId, {
            includeDeleted,
        });
        return this.resultMapper.toDto(result);
    }

    @Put(':QuestionId/:PartyId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Updates a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('QuestionId', new ParseUUIDPipe()) QuestionId: string,
        @Param('PartyId', new ParseUUIDPipe()) PartyId: string,
        @Query(RESTORE_QUERY, new ParseBoolPipe({ optional: true }))
        restore: boolean,
        @Body() updateResultDto: UpdateResultDto,
    ) {
        const result = await this.resultService.update(
            QuestionId,
            PartyId,
            this.resultMapper.fromDto(updateResultDto),
            {
                restore,
            },
        );
        return this.resultMapper.toDto(result);
    }

    @Delete(':QuestionId/:PartyId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Deletes a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('QuestionId', new ParseUUIDPipe()) QuestionId: string,
        @Param('PartyId', new ParseUUIDPipe()) PartyId: string,
        @Query(FORCE_QUERY, new ParseBoolPipe({ optional: true }))
        force: boolean,
    ) {
        try {
            return await this.resultService.remove(QuestionId, PartyId, {
                force,
            });
        } catch (e) {
            if (e instanceof NotFoundException) {
                return;
            }
            throw e;
        }
    }
}
