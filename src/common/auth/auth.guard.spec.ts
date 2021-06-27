import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

const mockReflector = createMock<Reflector>();
const mockLogger = createMock<LoggerService>();
const mockContext = createMock<ExecutionContext>();

const mockRequestNoHeader: Request = <any>{
    headers: {},
};
const mockRequest: Request = <any>{
    headers: {
        authorization: 'Bearer 1234',
    },
};
function setupMockContextRequest(request: any) {
    mockContext.switchToHttp.mockReturnValue({
        getRequest: () => request,
    } as any);
}

describe('AuthGuard', () => {
    let guard: AuthGuard;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('is defined', () => {
        expect(
            new AuthGuard(mockReflector, createMock<AuthService>(), mockLogger),
        ).toBeDefined();
    });

    describe('when disabled', () => {
        const mockAuthService = createMock<AuthService>();

        beforeEach(() => {
            guard = new AuthGuard(mockReflector, mockAuthService, mockLogger);
            mockAuthService.disabled = true;
        });

        it('passes when no auth header is provided', () => {
            guard.canActivate(mockContext);
            expect(mockAuthService.verifyJWT).toHaveBeenCalled();
        });

        it('passes and calls AuthService with correct values', () => {
            mockReflector.getAllAndMerge.mockReturnValue(['a', 'b']);
            setupMockContextRequest(mockRequest);
            expect(() => guard.canActivate(mockContext)).not.toThrow();
            expect(mockAuthService.verifyJWT).toHaveBeenCalledWith('1234', [
                'a',
                'b',
            ]);
        });
    });

    describe('when enabled', () => {
        const mockAuthService = createMock<AuthService>();

        beforeEach(() => {
            guard = new AuthGuard(mockReflector, mockAuthService, mockLogger);
            mockAuthService.disabled = false;
        });

        it('throws UnauthorizedException when no auth header is provided', () => {
            setupMockContextRequest(mockRequestNoHeader);
            expect(() => guard.canActivate(mockContext)).toThrowError(
                UnauthorizedException,
            );
        });

        it('passes when auth header is provided and calls AuthService with correct values', () => {
            mockReflector.getAllAndMerge.mockReturnValue(['a', 'b']);
            setupMockContextRequest(mockRequest);
            expect(() => guard.canActivate(mockContext)).not.toThrow();
            expect(mockAuthService.verifyJWT).toHaveBeenCalledWith('1234', [
                'a',
                'b',
            ]);
        });

        it('throws when authService.verifyJWT fails', () => {
            mockReflector.getAllAndMerge.mockReturnValue(['a', 'b']);
            mockAuthService.verifyJWT.mockImplementation(() => {
                throw new Error();
            });
            setupMockContextRequest(mockRequest);
            expect(() => guard.canActivate(mockContext)).toThrow();
        });
    });
});
