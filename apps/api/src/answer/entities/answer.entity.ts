import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
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
import { Optional } from 'sequelize/types';
import { RenameBeforeDelete, RenameBeforeRestore } from '../../common/hooks';
import { ITimestamps } from '../../common/interfaces/timestamps.interface';
import { Party } from '../../party/entities/party.entity';
import { Question } from '../../question/entities/question.entity';

export interface IAnswerAttributes extends ITimestamps {
    id: string;
    agreeLevel: number;
    statement: string;
    source: string;
    QuestionId: string;
    PartyId: string;
}

export interface IAnswerCreationAttributes
    extends Optional<IAnswerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Answer extends Model<
    IAnswerAttributes,
    IAnswerCreationAttributes
> {
    @AllowNull(false)
    @Min(1)
    @Max(5)
    @Column(DataType.INTEGER)
    declare agreeLevel: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare source?: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare statement?: string;

    @PrimaryKey
    @ForeignKey(() => Question)
    @Column({ type: DataType.UUID, allowNull: false })
    declare QuestionId: string;

    @PrimaryKey
    @ForeignKey(() => Party)
    @Column({ type: DataType.UUID, allowNull: false })
    declare PartyId: string;

    @BelongsTo(() => Party)
    declare Party: Party;

    @BelongsTo(() => Question)
    declare Question: Question;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
