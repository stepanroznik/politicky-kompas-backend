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
    ApiResponse,
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
import { ViewPercentagesDto } from './dto/view-percentages.dto';
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
    @ApiResponse({ type: ViewPercentagesDto, isArray: true })
    async create(
        @Body(ArrayValidationPipe(CreateResultDto))
        createResultDto: CreateResultDto,
        @Query('no-save', new ParseBoolPipe({ optional: true }))
        noSave?: boolean,
    ) {
        const result = await this.resultService.create(
            this.resultMapper.fromDto(createResultDto),
            noSave,
        );
        return result;
    }

    @Get()
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Finds all results',
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
    ) {
        const results = await this.resultService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
        });
        return this.resultMapper.toDtoArray(results);
    }

    @Get(':ResultId')
    @ApiOperation({
        summary: 'Finds a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('ResultId', new ParseUUIDPipe()) ResultId: string,
        @Query(INCLUDE_DELETED_QUERY, new ParseBoolPipe({ optional: true }))
        includeDeleted: boolean,
    ) {
        const result = await this.resultService.findOne(ResultId, {
            includeDeleted,
        });
        return this.resultMapper.toDto(result);
    }

    @Put(':ResultId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Updates a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('ResultId', new ParseUUIDPipe()) ResultId: string,
        @Query(RESTORE_QUERY, new ParseBoolPipe({ optional: true }))
        restore: boolean,
        @Body() updateResultDto: UpdateResultDto,
    ) {
        const result = await this.resultService.update(
            ResultId,
            this.resultMapper.fromDto(updateResultDto),
            {
                restore,
            },
        );
        return this.resultMapper.toDto(result);
    }

    @Delete(':ResultId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Deletes a single result by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('ResultId', new ParseUUIDPipe()) ResultId: string,
        @Query(FORCE_QUERY, new ParseBoolPipe({ optional: true }))
        force: boolean,
    ) {
        try {
            return await this.resultService.remove(ResultId, {
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
