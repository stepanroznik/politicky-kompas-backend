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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
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
import { QuestionMapper } from './question.mapper';
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

const WITH_TES_QUERY = 'with-tes';
const withTesQuery: ApiQueryOptions = {
    name: WITH_TES_QUERY,
    type: Boolean,
    required: false,
    description:
        'whether to include the field `tagExtractionScript` within the results',
};
@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(
        private readonly questionService: QuestionService,
        private readonly questionMapper: QuestionMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(QuestionController.name);
    }

    @Post()
    @ApiBody({ type: [CreateQuestionDto] })
    @ApiOperation({
        summary: 'Creates questions',
    })
    async create(
        @Body(ArrayValidationPipe(CreateQuestionDto))
        createQuestionDtos: CreateQuestionDto[],
    ) {
        const result = await this.questionService.create(
            this.questionMapper.fromDtoArray(createQuestionDtos),
        );
        return this.questionMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all questions',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(withTesQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: any,
        @Query(WITH_TES_QUERY, ParseBoolPipe) withTes: boolean,
        @Query(INCLUDE_DELETED_ARRAY_QUERY, ParseBoolPipe)
        includeDeleted: boolean,
    ) {
        this.logger.debug('this is where:', where);
        const questions = await this.questionService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            withTes,
            includeDeleted,
        });
        return this.questionMapper.toDtoArray(questions);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single question by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(INCLUDE_DELETED_QUERY, ParseBoolPipe) includeDeleted: boolean,
    ) {
        const question = await this.questionService.findOne(id, {
            includeDeleted,
        });
        return this.questionMapper.toDto(question);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a single question by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, ParseBoolPipe) restore: boolean,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ) {
        const question = await this.questionService.update(
            id,
            this.questionMapper.fromDto(updateQuestionDto),
            {
                restore,
            },
        );
        return this.questionMapper.toDto(question);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Deletes a single question by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, ParseBoolPipe) force: boolean,
    ) {
        try {
            return await this.questionService.remove(id, { force });
        } catch (e) {
            if (e instanceof NotFoundException) {
                return;
            }
            throw e;
        }
    }
}
