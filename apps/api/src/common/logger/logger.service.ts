import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

function formatMessage(message: string, meta: unknown[]) {
    if (!meta || meta.length === 0) return message;
    try {
        const serialized = meta.length === 1 ? meta[0] : meta;
        return `${message} ${typeof serialized === 'string' ? serialized : JSON.stringify(serialized)}`;
    } catch {
        return message;
    }
}

@Injectable()
export class Logger {
    private logger: ConsoleLogger;

    constructor() {
        this.logger = new ConsoleLogger();
    }

    getLogger() {
        return this.logger;
    }

    silence() {
        // ConsoleLogger doesn't support silencing out of the box.
        // Keep method for compatibility; it's a no-op.
        return this;
    }
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
    private logger: ConsoleLogger;

    constructor(logger?: Logger) {
        // If the Logger provider isn't available, fall back to a plain ConsoleLogger
        this.logger = logger ? logger.getLogger() : new ConsoleLogger();
    }

    silence() {
        // no-op for compatibility
        return this;
    }

    setContext(context: string) {
        this.logger = new ConsoleLogger(context);
        return this;
    }

    silly(message: string, ...meta: unknown[]) {
        this.logger?.debug(formatMessage(message, meta));
    }

    debug(message: string, ...meta: unknown[]) {
        this.logger?.debug(formatMessage(message, meta));
    }

    log(message: string, ...meta: unknown[]) {
        this.logger?.log(formatMessage(message, meta));
    }

    info(message: string, ...meta: unknown[]) {
        this.logger?.log(formatMessage(message, meta));
    }

    warn(message: string, ...meta: unknown[]) {
        this.logger?.warn(formatMessage(message, meta));
    }

    error(message: string, ...meta: unknown[]) {
        // ConsoleLogger.error supports an optional stack trace second arg
        const formatted = formatMessage(message, meta);
        const trace =
            meta && meta.length
                ? typeof meta[0] === 'string'
                    ? (meta[0] as string)
                    : undefined
                : undefined;
        this.logger?.error(formatted, trace);
    }
}
