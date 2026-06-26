import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Calculator } from './calculator.entity';
import { CalculatorQuestion } from './calculator-question.entity';

export interface ICalculatorAxisAttributes {
    code: string;
    calculatorSlug: string;
    name: string;
    negativeLabel: string;
    positiveLabel: string;
    order: number;
}

@Table({ schema: 'public', tableName: 'CalculatorAxes' })
export class CalculatorAxis extends Model<ICalculatorAxisAttributes> {
    @PrimaryKey
    @Column(DataType.STRING)
    declare code: string;

    @ForeignKey(() => Calculator)
    @AllowNull(false)
    @Column(DataType.STRING)
    declare calculatorSlug: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare negativeLabel: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare positiveLabel: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare order: number;

    @BelongsTo(() => Calculator)
    declare calculator: Calculator;

    @HasMany(() => CalculatorQuestion)
    declare questions: CalculatorQuestion[];
}
