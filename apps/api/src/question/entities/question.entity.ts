import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
    Column,
    DataType,
    Default,
    HasMany,
    IsIn,
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

export interface IQuestionAttributes extends ITimestamps {
    id: string;
    title: string;
    subtitle: string;
    position: string;
    isPrimary: boolean;
}

export interface IQuestionCreationAttributes
    extends Optional<IQuestionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Question extends Model<
    IQuestionAttributes,
    IQuestionCreationAttributes
> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    declare title: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare subtitle?: string;

    @AllowNull(false)
    @IsIn([
        [
            'top-left',
            'top',
            'top-right',
            'left',
            'center',
            'right',
            'bottom-left',
            'bottom',
            'bottom-right',
            'east',
            'west',
        ],
    ])
    @Column(DataType.STRING)
    declare position: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    declare isPrimary: boolean;

    @HasMany(() => Answer)
    declare Answers: Array<Answer>;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
