import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';
import { AUTH_SCOPE } from './auth.constants';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authService: AuthService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(AuthGuard.name);
    }

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const requiredScope = this.reflector.getAllAndMerge<string[]>(
            AUTH_SCOPE,
            [context.getHandler(), context.getClass()],
        );
        const authHeader = request.headers.authorization;

        if (!authHeader && !this.authService.disabled) {
            throw new UnauthorizedException('No authorization header provided');
        } else {
        }
        const token = authHeader?.replace('Bearer ', '');

        try {
            this.authService.verifyJWT(token, requiredScope);
        } catch (e) {
            this.logger.debug(`Access denied because: ${e.message}`);
            throw e;
        }
        return true;
    }
}
