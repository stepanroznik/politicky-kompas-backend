import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service';
import colors from 'colors/safe.js';
import { Timer } from '../utils/timer';

const colorFunctions = colors as unknown as Record<
    string,
    (value: string) => string
>;

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private logger: LoggerService) {
        this.logger?.setContext(LoggerMiddleware.name);
    }

    use(req: Request, res: Response, next: NextFunction) {
        const timer = new Timer();
        let color = 'reset';
        switch (req.method) {
            case 'GET':
                color = 'blue';
                break;
            case 'POST':
                color = 'green';
                break;
            case 'PUT':
                color = 'yellow';
                break;
            case 'DELETE':
                color = 'red';
                break;
            default:
                color = 'reset';
        }
        const methodText = colors.bold(req.method);
        const colorizer = colorFunctions[color] ?? colorFunctions.reset;
        this.logger?.info(
            [
                colorizer(methodText),
                req.originalUrl,
                colors.gray(`[${req.ip}]`),
            ].join(' '),
        );
        res.on('finish', () =>
            this.logger?.info(
                [
                    colors.gray(colors.bold(req.method)),
                    colors.gray(req.originalUrl),
                    colors.gray(`(${timer.stop()} ms)`),
                ].join(' '),
            ),
        );
        next();
    }
}
