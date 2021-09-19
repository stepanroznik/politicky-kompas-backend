import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
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
    agreeLevel: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    source: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    statement: string;

    @PrimaryKey
    @ForeignKey(() => Question)
    @Column
    QuestionId: string;

    @PrimaryKey
    @ForeignKey(() => Party)
    @Column
    PartyId: string;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
