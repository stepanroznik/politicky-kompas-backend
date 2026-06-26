import {
    AllowNull,
    Column,
    DataType,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize/types';
import { Calculator } from './calculator.entity';

export interface ICalculatorSubmissionAttributes {
    id: string;
    calculatorSlug: string;
    answers: Array<{ questionId: string; value: number | null }>;
    result: Record<string, unknown>;
    fingerprint?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}

export interface ICalculatorSubmissionCreationAttributes
    extends Optional<ICalculatorSubmissionAttributes, 'id'> {}

@Table({ schema: 'public', tableName: 'CalculatorSubmissions' })
export class CalculatorSubmission extends Model<
    ICalculatorSubmissionAttributes,
    ICalculatorSubmissionCreationAttributes
> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Calculator)
    @AllowNull(false)
    @Column(DataType.STRING)
    declare calculatorSlug: string;

    @AllowNull(false)
    @Column(DataType.JSONB)
    declare answers: Array<{ questionId: string; value: number | null }>;

    @AllowNull(false)
    @Column(DataType.JSONB)
    declare result: Record<string, unknown>;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare fingerprint?: string | null;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare ipAddress?: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare userAgent?: string | null;
}
