import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
    BelongsToMany,
    Column,
    DataType,
    Default,
    Model,
    NotEmpty,
    PrimaryKey,
    Table,
    Unique,
} from 'sequelize-typescript';
import { Optional } from 'sequelize/types';
import { Answer } from '../../answer/entities/answer.entity';
import { RenameBeforeDelete, RenameBeforeRestore } from '../../common/hooks';
import { ITimestamps } from '../../common/interfaces/timestamps.interface';
import { Question } from '../../question/entities/question.entity';

export interface IPartyAttributes extends ITimestamps {
    id: string;
    name: string;
    abbreviation: string;
    externalId: string;
}

export interface IPartyCreationAttributes
    extends Optional<IPartyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Party extends Model<IPartyAttributes, IPartyCreationAttributes> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    abbreviation: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    externalId: string;

    @BelongsToMany(() => Question, () => Answer)
    Answers: Array<Question & { Answer: Answer }>;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}