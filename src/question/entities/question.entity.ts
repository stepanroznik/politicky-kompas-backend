import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
    BelongsToMany,
    Column,
    DataType,
    Default,
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
import { Party } from '../../party/entities/party.entity';

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
    id: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    title: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    subtitle: string;

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
        ],
    ])
    @Column(DataType.STRING)
    position: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    isPrimary: boolean;

    @BelongsToMany(() => Party, () => Answer)
    Answers: Array<Party & { Answer: Answer }>;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
