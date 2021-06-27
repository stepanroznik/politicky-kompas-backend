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
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ArrayValidationPipe } from '../common/pipes/array-validation.pipe';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { AnswerMapper } from './answer.mapper';
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
@ApiTags('Answers')
@Controller('answers')
export class AnswerController {
    constructor(
        private readonly answerService: AnswerService,
        private readonly answerMapper: AnswerMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(AnswerController.name);
    }

    @Post()
    @ApiBody({ type: [CreateAnswerDto] })
    @ApiOperation({
        summary: 'Creates answers',
    })
    async create(
        @Body(ArrayValidationPipe(CreateAnswerDto))
        createAnswerDtos: CreateAnswerDto[],
    ) {
        const result = await this.answerService.create(
            this.answerMapper.fromDtoArray(createAnswerDtos),
        );
        return this.answerMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all answers',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: any,
        @Query(INCLUDE_DELETED_ARRAY_QUERY, ParseBoolPipe)
        includeDeleted: boolean,
    ) {
        const answers = await this.answerService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
        });
        return this.answerMapper.toDtoArray(answers);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single answer by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(INCLUDE_DELETED_QUERY, ParseBoolPipe) includeDeleted: boolean,
    ) {
        const answer = await this.answerService.findOne(id, {
            includeDeleted,
        });
        return this.answerMapper.toDto(answer);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a single answer by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, ParseBoolPipe) restore: boolean,
        @Body() updateAnswerDto: UpdateAnswerDto,
    ) {
        const answer = await this.answerService.update(
            id,
            this.answerMapper.fromDto(updateAnswerDto),
            {
                restore,
            },
        );
        return this.answerMapper.toDto(answer);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Deletes a single answer by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, ParseBoolPipe) force: boolean,
    ) {
        try {
            return await this.answerService.remove(id, { force });
        } catch (e) {
            if (e instanceof NotFoundException) {
                return;
            }
            throw e;
        }
    }
}
