import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Max,
    Min,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { CalculatorParty } from './calculator-party.entity';
import { CalculatorQuestion } from './calculator-question.entity';

export interface ICalculatorPartyRatingAttributes {
    questionId: string;
    partyCode: string;
    rating?: number | null;
    evidenceStatus: string;
    evidenceUrl?: string | null;
    evidenceTitle?: string | null;
    evidenceNote?: string | null;
}

@Table({ schema: 'public', tableName: 'CalculatorPartyRatings' })
export class CalculatorPartyRating extends Model<ICalculatorPartyRatingAttributes> {
    @PrimaryKey
    @ForeignKey(() => CalculatorQuestion)
    @Column(DataType.STRING)
    declare questionId: string;

    @PrimaryKey
    @ForeignKey(() => CalculatorParty)
    @Column(DataType.STRING)
    declare partyCode: string;

    @AllowNull(true)
    @Min(1)
    @Max(4)
    @Column(DataType.INTEGER)
    declare rating?: number | null;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare evidenceStatus: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare evidenceUrl?: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare evidenceTitle?: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare evidenceNote?: string | null;

    @BelongsTo(() => CalculatorQuestion)
    declare question: CalculatorQuestion;

    @BelongsTo(() => CalculatorParty)
    declare party: CalculatorParty;
}
