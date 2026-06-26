import {
    AllowNull,
    Column,
    DataType,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { CalculatorAxis } from './calculator-axis.entity';
import { CalculatorParty } from './calculator-party.entity';
import { CalculatorQuestion } from './calculator-question.entity';

export interface ICalculatorAttributes {
    slug: string;
    name: string;
    description?: string;
    answerScaleMin: number;
    answerScaleMax: number;
}

@Table({ schema: 'public', tableName: 'Calculators' })
export class Calculator extends Model<ICalculatorAttributes> {
    @PrimaryKey
    @Column(DataType.STRING)
    declare slug: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare name: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description?: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare answerScaleMin: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare answerScaleMax: number;

    @HasMany(() => CalculatorAxis)
    declare axes: CalculatorAxis[];

    @HasMany(() => CalculatorParty)
    declare parties: CalculatorParty[];

    @HasMany(() => CalculatorQuestion)
    declare questions: CalculatorQuestion[];
}
