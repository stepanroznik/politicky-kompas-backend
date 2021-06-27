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
    UseGuards,
} from '@nestjs/common';
import { SourceService } from './source.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ArrayValidationPipe } from '../common/pipes/array-validation.pipe';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiQueryOptions,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { SourceMapper } from './source.mapper';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { AuthScope } from '../common/auth/decorators/scope.decorator';
import { AuthGuard } from '../common/auth/auth.guard';
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

const WITH_QUESTIONS_QUERY = 'with-questions';
const withQuestionsQuery: ApiQueryOptions = {
    name: WITH_QUESTIONS_QUERY,
    type: Boolean,
    required: false,
    description:
        'If true, the retrieved source(s) will include all associated questions',
};

@ApiTags('Sources')
@UseGuards(AuthGuard)
@AuthScope('sources')
@Controller('sources')
export class SourceController {
    constructor(
        private readonly sourceService: SourceService,
        private readonly sourceMapper: SourceMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(SourceController.name);
    }

    @Post()
    @AuthScope('sources.create')
    @ApiBody({ type: [CreateSourceDto] })
    @ApiOperation({
        summary: 'Creates sources',
    })
    async create(
        @Body(ArrayValidationPipe(CreateSourceDto))
        createSourceDtos: CreateSourceDto[],
    ) {
        const result = await this.sourceService.create(
            this.sourceMapper.fromDtoArray(createSourceDtos),
        );
        return this.sourceMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all sources',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(withQuestionsQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: Record<string, string>,
        @Query(WITH_QUESTIONS_QUERY, ParseBoolPipe) withQuestions: boolean,
        @Query(INCLUDE_DELETED_ARRAY_QUERY, ParseBoolPipe)
        includeDeleted: boolean,
    ) {
        this.logger.debug('this is where:', where);
        const sources = await this.sourceService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            withQuestions,
            includeDeleted,
        });
        return this.sourceMapper.toDtoArray(sources);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single source by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    @ApiQuery(withQuestionsQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(WITH_QUESTIONS_QUERY, ParseBoolPipe) withQuestions: boolean,
        @Query(INCLUDE_DELETED_QUERY, ParseBoolPipe) includeDeleted: boolean,
    ) {
        const source = await this.sourceService.findOne(id, {
            withQuestions,
            includeDeleted,
        });
        return this.sourceMapper.toDto(source);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a single source by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, ParseBoolPipe) restore: boolean,
        @Body() updateSourceDto: UpdateSourceDto,
    ) {
        const source = await this.sourceService.update(
            id,
            this.sourceMapper.fromDto(updateSourceDto),
            {
                restore,
            },
        );
        return this.sourceMapper.toDto(source);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Deletes a single source by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, ParseBoolPipe) force: boolean,
    ) {
        return this.sourceService.remove(id, { force });
    }
}
