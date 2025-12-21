import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Optional,
    Param,
    ParseBoolPipe,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiKeyGuard } from '../common/api-key.guard';
import { LoggerService } from '../common/logger/logger.service';
import { idParam } from '../common/openapi/params.openapi';
import {
    FORCE_QUERY,
    forceQuery,
    INCLUDE_DELETED_ARRAY_QUERY,
    INCLUDE_DELETED_QUERY,
    includeDeletedArrayQuery,
    includeDeletedQuery,
    RESTORE_QUERY,
    restoreQuery,
    WHERE_QUERY,
    whereQuery,
} from '../common/openapi/query.openapi';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ViewPercentagesDto } from './dto/view-percentages.dto';
import { ResultMapper } from './result.mapper';
import { ResultService } from './result.service';
@ApiTags('Results')
@Controller('results')
export class ResultController {
    constructor(
        private readonly resultService: ResultService,
        private readonly resultMapper: ResultMapper,
        private readonly whereParser: WhereParserService,
        @Optional() private logger?: LoggerService,
    ) {
        this.logger?.setContext(ResultController.name);
    }

    @Post()
    @ApiBody({ type: () => CreateResultDto })
    @ApiOperation({
        summary: 'Creates results',
    })
    @ApiResponse({ type: () => ViewPercentagesDto, isArray: true })
    async create(
        @Body() createResultDto: CreateResultDto,
        @Query('no-save', new ParseBoolPipe({ optional: true }))
        noSave?: boolean,
        @Req() request?: Request,
    ) {
        const result = await this.resultService.create(
            this.resultMapper.fromDto(createResultDto),
            noSave,
            request,
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
