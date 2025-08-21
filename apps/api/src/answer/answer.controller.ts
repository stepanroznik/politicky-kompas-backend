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
import { ApiKeyGuard } from '../common/api-key.guard';
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
    @UseGuards(ApiKeyGuard)
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
        @Query(WHERE_QUERY) where: Record<string, any>,
        @Query(
            INCLUDE_DELETED_ARRAY_QUERY,
            new ParseBoolPipe({ optional: true }),
        )
        includeDeleted: boolean,
    ) {
        const answers = await this.answerService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
        });
        return this.answerMapper.toDtoArray(answers);
    }

    @Get(':QuestionId/:PartyId')
    @ApiOperation({
        summary: 'Finds a single answer by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('QuestionId', new ParseUUIDPipe()) QuestionId: string,
        @Param('PartyId', new ParseUUIDPipe()) PartyId: string,
        @Query(INCLUDE_DELETED_QUERY, new ParseBoolPipe({ optional: true }))
        includeDeleted: boolean,
    ) {
        const answer = await this.answerService.findOne(QuestionId, PartyId, {
            includeDeleted,
        });
        return this.answerMapper.toDto(answer);
    }

    @Put(':QuestionId/:PartyId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Updates a single answer by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('QuestionId', new ParseUUIDPipe()) QuestionId: string,
        @Param('PartyId', new ParseUUIDPipe()) PartyId: string,
        @Query(RESTORE_QUERY, new ParseBoolPipe({ optional: true }))
        restore: boolean,
        @Body() updateAnswerDto: UpdateAnswerDto,
    ) {
        const answer = await this.answerService.update(
            QuestionId,
            PartyId,
            this.answerMapper.fromDto(updateAnswerDto),
            {
                restore,
            },
        );
        return this.answerMapper.toDto(answer);
    }

    @Delete(':QuestionId/:PartyId')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Deletes a single answer by id',
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
            return await this.answerService.remove(QuestionId, PartyId, {
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
