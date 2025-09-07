export class HttpError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
    toString() {
        return `${this.name} - ${this.statusCode}: ${this.message}`;
    }
}

export class HttpServerError extends HttpError {
    name = 'HttpServerError';
    constructor(public statusCode: number, message: string) {
        super(statusCode, message);
    }
}

export class HttpClientError extends HttpError {
    name = 'HttpClientError';
    constructor(public statusCode: number, message: string) {
        super(statusCode, message);
    }
}

export function HttpErrorFactory(
    statusCode: number,
    message: string
): HttpError {
    if (statusCode < 400) throw new RangeError('status code must be >= 400');
    if (statusCode >= 400 && statusCode < 500) {
        return new HttpClientError(statusCode, message);
    } else {
        return new HttpServerError(statusCode, message);
    }
}
