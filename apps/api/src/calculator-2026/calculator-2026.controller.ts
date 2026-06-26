import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Calculator2026Service } from './calculator-2026.service';
import { CreateCalculatorResultDto } from './dto/create-calculator-result.dto';

@ApiTags('Calculators')
@Controller('calculators')
export class Calculator2026Controller {
    constructor(private readonly calculatorService: Calculator2026Service) {}

    @Get(':slug')
    @ApiParam({ name: 'slug', type: String })
    @ApiOperation({ summary: 'Finds a calculator definition' })
    async getCalculator(@Param('slug') slug: string) {
        return this.calculatorService.getCalculator(slug);
    }

    @Get(':slug/questions')
    @ApiParam({ name: 'slug', type: String })
    @ApiOperation({ summary: 'Finds all questions for a calculator' })
    async getQuestions(@Param('slug') slug: string) {
        return this.calculatorService.getQuestions(slug);
    }

    @Get(':slug/party-answers')
    @ApiParam({ name: 'slug', type: String })
    @ApiOperation({ summary: 'Finds party answers for a calculator' })
    async getPartyAnswers(@Param('slug') slug: string) {
        return this.calculatorService.getPartyAnswers(slug);
    }

    @Post(':slug/results')
    @ApiParam({ name: 'slug', type: String })
    @ApiOperation({ summary: 'Creates a calculator result' })
    async createResult(
        @Param('slug') slug: string,
        @Body() dto: CreateCalculatorResultDto,
        @Req() request?: Request,
    ) {
        return this.calculatorService.createResult(
            slug,
            dto.answers,
            dto.fingerprint,
            request,
        );
    }
}
