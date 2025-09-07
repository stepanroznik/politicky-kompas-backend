import Winston from 'winston';
import Transport from 'winston-transport';
import path from 'path';
import fs from 'fs';
import { Sequelize, DataTypes } from 'sequelize';
import chalk from 'chalk';
import util from 'util';
import rTracer from 'cls-rtracer';

function stripColor(str: string) {
    return str ? str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') : str;
}
export interface LoggerOptionConsole {
    level?: string;
}
export interface LoggerOptionFile {
    level?: string;
    folder?: string;
    filePrefix?: string;
}
export interface LoggerOptionDatabase {
    level?: string;
    tableName?: string;
    connectionString?: string;
    transportIntervalMs?: number;
}

interface DatabaseLogEntry extends Record<string, unknown> {
    timestamp: Date;
    level: string;
    rid: string;
    namespace?: string;
    message: string;
    meta?: Record<string, unknown>;
}

interface DatabaseTransportOptions {
    level?: string;
    tableName?: string;
    connectionString: string;
    transportIntervalMs?: number;
}
export interface LoggerOptions {
    silent?: boolean;
    console?: LoggerOptionConsole;
    file?: LoggerOptionFile;
    database?: LoggerOptionDatabase;
}

const consoleTransportFormat = Winston.format.combine(
    Winston.format.timestamp({ format: 'HH:mm:ss' }),
    Winston.format.colorize(),
    Winston.format.printf((info) => {
        info.rid = rTracer.id();
        let { message } = info;
        if (typeof message !== 'string') {
            message = JSON.stringify(message, null, 2);
        }
        if (info.level.match(/error/) && info.meta instanceof Error) {
            info.meta = {
                message: info.meta.message,
                stack: info.meta.stack,
            };
        }
        const infoMeta = info.meta as
            | Record<string, string>
            | Record<string, string>[];

        return (
            info.timestamp +
            ' ' +
            `${info.level} ` +
            (info.level.match(/info|warn/) ? ' ' : '') +
            (info.rid ? chalk.gray(info.rid + ' ') : '') +
            (info.namespace ? chalk.yellow(`[${info.namespace}] `) : '') +
            message +
            (infoMeta && Array.isArray(infoMeta)
                ? '\n' +
                  infoMeta
                      .map((m) =>
                          util.formatWithOptions({ colors: true }, '%o', m),
                      )
                      .join('\n')
                : '')
        );
    }),
);

const fileTransportFormat = Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.printf((info) => {
        info.rid = rTracer.id() ?? '-';
        let { message } = info;
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }
        return [
            info.timestamp,
            info.level.toUpperCase(),
            info.rid,
            info.namespace,
            stripColor(message as string),
            info.meta ? JSON.stringify(info.meta) : '-',
        ].join(';');
    }),
);

class CustomPostgresTrasport extends Transport {
    public ready: boolean;
    public sequelize: Sequelize;
    public Log: ReturnType<Sequelize['define']>;
    public logBatch: DatabaseLogEntry[];

    constructor(opts: DatabaseTransportOptions) {
        super(opts);
        this.sequelize = new Sequelize(opts.connectionString, {
            logging: false,
            define: {
                timestamps: false,
                freezeTableName: true,
            },
        });
        this.Log = this.sequelize.define(
            opts.tableName ?? 'log',
            {
                timestamp: { type: DataTypes.DATE },
                level: { type: DataTypes.STRING },
                rid: { type: DataTypes.STRING },
                namespace: { type: DataTypes.STRING },
                message: { type: DataTypes.TEXT },
                meta: { type: DataTypes.JSONB },
            },
            {
                updatedAt: false,
            },
        );
        this.ready = false;
        (async () => {
            await this.sequelize.sync();
            this.ready = true;
            this.transportLogBatch();
            setInterval(
                () => this.transportLogBatch(),
                opts.transportIntervalMs ?? 2000,
            );
        })();
        this.logBatch = [];
    }

    async transportLogBatch() {
        if (!this.ready || this.logBatch.length === 0) return;
        const logsToTransport = this.logBatch;
        this.logBatch = [];
        this.ready = false;
        await this.Log.bulkCreate(logsToTransport as Record<string, unknown>[]);
        this.ready = true;
    }

    log(info: Winston.LogEntry, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        info.timestamp = new Date();
        info.rid = rTracer.id() ?? '';
        if (typeof info.message !== 'string') {
            info.message = JSON.stringify(info.message);
        }
        info.message = stripColor(info.message);
        this.logBatch.push(info as DatabaseLogEntry);
        callback();
    }
}

const transports: Array<Transport> = [];

export function initLogger(opts: LoggerOptions): Winston.Logger {
    if (opts.console) {
        transports.push(
            new Winston.transports.Console({
                level: opts.console?.level ?? 'info',
                format: consoleTransportFormat,
            }),
        );
    }
    if (opts.file) {
        const logsFolder = path.resolve(
            opts.file.folder ?? (process.cwd(), 'logs'),
        );
        if (!fs.existsSync(logsFolder)) {
            fs.mkdirSync(logsFolder);
        }
        const nowString = new Date().toISOString().replace(/[:.TZ]/g, '-');
        transports.push(
            new Winston.transports.File({
                level: opts.file.level ?? 'info',
                filename: path.join(
                    logsFolder,
                    `${(opts.file.filePrefix ?? 'Log_') + nowString}.log`,
                ),
                format: fileTransportFormat,
            }),
        );
    }
    if (opts.database) {
        transports.push(
            new CustomPostgresTrasport({
                level: opts.database.level ?? 'info',
                tableName: opts.database.tableName,
                connectionString: opts.database.connectionString,
                transportIntervalMs: opts.database.transportIntervalMs,
            }),
        );
    }

    return Winston.createLogger({
        silent: opts.silent ?? process.env.NODE_ENV === 'test',
        level: 'silly',
        transports,
    });
}
