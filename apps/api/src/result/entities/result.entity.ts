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
    userAgent?: string;
    geoCountry?: string;
    geoRegion?: string;
    geoCity?: string;
    geoLatitude?: number;
    geoLongitude?: number;
    geoTimezone?: string;
    zipCode?: number;
    gender: (typeof genders)[number];
    birthYear?: number;
    isDumped: boolean;
    dumpReason?: string;
}

export interface IResultCreationAttributes
    extends Optional<
        IResultAttributes,
        'id' | 'createdAt' | 'updatedAt' | 'isDumped'
    > {}

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
    declare id: string;

    @AllowNull(false)
    @Column(DataType.JSONB)
    declare answers: IResultAnswer[];

    @AllowNull(true)
    @Column(DataType.INTEGER)
    declare birthYear?: number;

    @AllowNull(false)
    @IsIn([Array.from(genders)])
    @Column(DataType.STRING)
    declare gender: (typeof genders)[number];

    @AllowNull(true)
    @Column(DataType.INTEGER)
    declare zipCode?: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    declare ipAddress: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare fingerprint: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare userAgent?: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare geoCountry?: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare geoRegion?: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare geoCity?: string;

    @AllowNull(true)
    @Column(DataType.FLOAT)
    declare geoLatitude?: number;

    @AllowNull(true)
    @Column(DataType.FLOAT)
    declare geoLongitude?: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare geoTimezone?: string;

    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    declare isDumped: boolean;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare dumpReason?: string;

    @BeforeDestroy({})
    static renameBeforeDestroy = RenameBeforeDelete();

    @BeforeRestore({})
    static renameBeforeRestore = RenameBeforeRestore();
}
