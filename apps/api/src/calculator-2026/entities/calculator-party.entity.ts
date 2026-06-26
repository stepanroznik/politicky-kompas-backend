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
import { CalculatorPartyRating } from './calculator-party-rating.entity';

export interface ICalculatorPartyAttributes {
    code: string;
    calculatorSlug: string;
    name: string;
    sourceColumn: string;
    color?: string;
}

@Table({ schema: 'public', tableName: 'CalculatorParties' })
export class CalculatorParty extends Model<ICalculatorPartyAttributes> {
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
    declare sourceColumn: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare color?: string;

    @BelongsTo(() => Calculator)
    declare calculator: Calculator;

    @HasMany(() => CalculatorPartyRating)
    declare ratings: CalculatorPartyRating[];
}
