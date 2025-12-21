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
import { Answer } from '../../answer/entities/answer.entity';
import { RenameBeforeDelete, RenameBeforeRestore } from '../../common/hooks';
import { ITimestamps } from '../../common/interfaces/timestamps.interface';

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
    declare id: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    declare name: string;

    @AllowNull(false)
    @Unique(true)
    @NotEmpty
    @Column(DataType.STRING)
    declare abbreviation: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare externalId?: string;

    @HasMany(() => Answer)
    declare Answers: Array<Answer>;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
