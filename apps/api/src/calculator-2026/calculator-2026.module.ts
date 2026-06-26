import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Calculator2026Controller } from './calculator-2026.controller';
import { Calculator2026Service } from './calculator-2026.service';
import { Calculator } from './entities/calculator.entity';
import { CalculatorAxis } from './entities/calculator-axis.entity';
import { CalculatorParty } from './entities/calculator-party.entity';
import { CalculatorPartyRating } from './entities/calculator-party-rating.entity';
import { CalculatorQuestion } from './entities/calculator-question.entity';
import { CalculatorSubmission } from './entities/calculator-submission.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Calculator,
            CalculatorAxis,
            CalculatorParty,
            CalculatorQuestion,
            CalculatorPartyRating,
            CalculatorSubmission,
        ]),
    ],
    controllers: [Calculator2026Controller],
    providers: [Calculator2026Service],
    exports: [Calculator2026Service],
})
export class Calculator2026Module {}
