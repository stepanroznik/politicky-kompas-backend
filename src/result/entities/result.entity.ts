import {
    AllowNull,
    BeforeDestroy,
    BeforeRestore,
    Column,
    DataType,
    IsIn,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize/types';
import { RenameBeforeDelete, RenameBeforeRestore } from '../../common/hooks';
import { ITimestamps } from '../../common/interfaces/timestamps.interface';
import { IResultAnswer } from '../interfaces/result-answer.interface';

export const genders = ['male', 'female', 'other'] as const;

export interface IResultAttributes extends ITimestamps {
    id: string;
    answers: IResultAnswer[];
    ipAddress: string;
    fingerprint: string;
    zipCode: number;
    gender: (typeof genders)[number];
    birthYear: number;
}

export interface IResultCreationAttributes
    extends Optional<IResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({ schema: 'public' })
export class Result extends Model<
    IResultAttributes,
    IResultCreationAttributes
> {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @AllowNull(false)
    @Column(DataType.JSONB)
    answers: IResultAnswer[];

    @AllowNull(true)
    @Column(DataType.NUMBER)
    birthYear?: number;

    @AllowNull(false)
    @IsIn([genders as any])
    @Column(DataType.STRING)
    gender?: (typeof genders)[number];

    @AllowNull(true)
    @Column(DataType.NUMBER)
    zipCode?: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    ipAddress: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    fingerprint: string;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
