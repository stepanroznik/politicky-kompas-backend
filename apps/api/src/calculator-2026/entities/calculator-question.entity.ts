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
import { CalculatorAxis } from './calculator-axis.entity';
import { CalculatorPartyRating } from './calculator-party-rating.entity';

export interface ICalculatorQuestionAttributes {
    id: string;
    calculatorSlug: string;
    axisCode: string;
    order: number;
    dimensionOrder: number;
    facet: string;
    originalText: string;
    text: string;
    reversed: boolean;
    reviewStatus: string;
    reviewNote?: string;
}

@Table({ schema: 'public', tableName: 'CalculatorQuestions' })
export class CalculatorQuestion extends Model<ICalculatorQuestionAttributes> {
    @PrimaryKey
    @Column(DataType.STRING)
    declare id: string;

    @ForeignKey(() => Calculator)
    @AllowNull(false)
    @Column(DataType.STRING)
    declare calculatorSlug: string;

    @ForeignKey(() => CalculatorAxis)
    @AllowNull(false)
    @Column(DataType.STRING)
    declare axisCode: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare order: number;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    declare dimensionOrder: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare facet: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare originalText: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare text: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    declare reversed: boolean;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare reviewStatus: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare reviewNote?: string;

    @BelongsTo(() => Calculator)
    declare calculator: Calculator;

    @BelongsTo(() => CalculatorAxis)
    declare axis: CalculatorAxis;

    @HasMany(() => CalculatorPartyRating)
    declare ratings: CalculatorPartyRating[];
}
