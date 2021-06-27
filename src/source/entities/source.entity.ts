import {
    PreventSoftDeleteIfModelExists,
    RenameBeforeRestore,
    RenameBeforeDelete,
} from '../../common/hooks';
import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
    Column,
    DataType,
    Default,
    HasMany,
    Model,
    NotEmpty,
    PrimaryKey,
    Table,
    Unique,
} from 'sequelize-typescript';
import { Optional } from 'sequelize/types';
import { ITimestamps } from '../../common/interfaces/timestamps.interface';
import {
    Question,
    IQuestionAttributes,
} from '../../question/entities/question.entity';

export interface ISourceAttributes extends ITimestamps {
    id: string;
    name: string;
    Questions?: IQuestionAttributes[];
}

export interface ISourceCreationAttributes
    extends Optional<ISourceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Source extends Model<
    ISourceAttributes,
    ISourceCreationAttributes
> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    name: string;

    @HasMany(() => Question)
    Questions: Question[];

    @BeforeDestroy({})
    static preventSoftDeleteIfModelExists =
        PreventSoftDeleteIfModelExists(Question);

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
