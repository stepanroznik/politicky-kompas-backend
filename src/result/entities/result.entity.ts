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

export interface IResultAttributes extends ITimestamps {
    id: string;
    agreeLevel: number;
    statement: string;
    source: string;
    QuestionId: string;
    PartyId: string;
}

export interface IResultCreationAttributes
    extends Optional<IResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Result extends Model<
    IResultAttributes,
    IResultCreationAttributes
> {
    @AllowNull(false)
    @Min(1)
    @Max(5)
    @Column(DataType.INTEGER)
    agreeLevel: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    source: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    statement: string;

    @PrimaryKey
    @ForeignKey(() => Question)
    @Column({ type: DataType.UUID, allowNull: false })
    QuestionId: string;

    @PrimaryKey
    @ForeignKey(() => Party)
    @Column({ type: DataType.UUID, allowNull: false })
    PartyId: string;

    @BelongsTo(() => Party)
    Party: Party;

    @BelongsTo(() => Question)
    Question: Question;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
