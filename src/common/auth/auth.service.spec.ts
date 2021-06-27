import { HttpService, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, TokenPayload } from './auth.service';
import { createMock } from '@golevelup/ts-jest';
import authConfig from './auth.config';
import appConfig from '../../config/app.config';
import { LoggerModule } from '../logger/logger.module';
import { JwtService } from '@nestjs/jwt';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

const mockHttpService = createMock<HttpService>();
const mockJwtService = createMock<JwtService>();

const getMockPubkeyResponse = (data = 'data') =>
    ({
        toPromise: () => Promise.resolve({ data }),
    } as Observable<AxiosResponse<string>>);

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                AuthService,
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: authConfig.KEY,
                    useValue: { endpoint: 'endpoint' },
                },
                {
                    provide: appConfig.KEY,
                    useValue: { app: { id: '1234' } },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('initialisation', () => {
        beforeEach(() => {
            mockHttpService.get.mockClear();
        });

        describe('httpGet', () => {
            it('returns correct data', async () => {
                mockHttpService.get.mockReturnValue(getMockPubkeyResponse());
                const response = await service.httpGet('endpoint');
                expect(mockHttpService.get).toHaveBeenLastCalledWith(
                    'endpoint',
                );
                expect(response.data).toEqual('data');
            });

            it('throws error if data cannot be retrieved', async () => {
                mockHttpService.get.mockImplementation(() => {
                    throw new Error();
                });
                await expect(
                    service.httpGet('wrong-endpoint'),
                ).rejects.toThrowError(Error);
                expect(mockHttpService.get).toHaveBeenLastCalledWith(
                    'wrong-endpoint',
                );
            });
        });

        describe('onModuleInit', () => {
            it('retrieves the public key from auth server on init', async () => {
                mockHttpService.get.mockReturnValue(
                    getMockPubkeyResponse('pubkey'),
                );
                await service.onModuleInit();
                expect(mockHttpService.get).toHaveBeenLastCalledWith(
                    'endpoint/oauth/pubkey',
                );
                expect(service.getPublicKey()).toEqual('pubkey');
            });

            it('throws error if the public key cannot be retrieved on init', async () => {
                mockHttpService.get.mockImplementation(() => {
                    throw new Error();
                });
                await expect(service.onModuleInit()).rejects.toThrowError(
                    Error,
                );
            });
        });
    });

    describe('JWT payload checks', () => {
        const tokenPayload = {
            scope: ['a', 'b'],
        } as TokenPayload;

        describe('checkScope', () => {
            it('throws UnauthorizedException if token scope does not include specified permission', () => {
                expect(() =>
                    service.checkScope(tokenPayload, ['b', 'c']),
                ).toThrowError(
                    new UnauthorizedException('Token has no access to c'),
                );
            });

            it('passes when token has appropriate scope (all required)', () => {
                expect(() =>
                    service.checkScope(tokenPayload, ['a', 'b']),
                ).not.toThrow();
            });

            it('passes when token has appropriate scope (some required)', () => {
                expect(() =>
                    service.checkScope(tokenPayload, ['a']),
                ).not.toThrow();
            });

            it('passes when no scope is provided', () => {
                expect(() => service.checkScope(tokenPayload)).not.toThrow();
            });
        });

        describe('checkTenant', () => {
            const tokenPayload = {
                tenant: '1',
            } as TokenPayload;

            it('throws UnauthorizedException if tenantId does not match', () => {
                expect(() =>
                    service.checkTenant(tokenPayload, '2'),
                ).toThrowError(
                    new UnauthorizedException(
                        'Token has no access to tenant id 2',
                    ),
                );
            });

            it('passes when tenantId matches', () => {
                expect(() =>
                    service.checkTenant(tokenPayload, '1'),
                ).not.toThrow();
            });

            it('passes when tenantId does not match, but scope includes "system"', () => {
                expect(() =>
                    service.checkTenant(
                        { ...tokenPayload, scope: ['system'] },
                        '2',
                    ),
                ).not.toThrow();
            });
        });
    });

    describe('JWT verification', () => {
        const tokenPayload = {
            tenant: '1',
            scope: ['a', 'b'],
        } as TokenPayload;

        beforeEach(() => {
            mockHttpService.get.mockClear();
            mockHttpService.get.mockReturnValue(
                getMockPubkeyResponse('pubkey'),
            );
            service.onModuleInit();
        });

        describe('verifyJWT', () => {
            it('calls jwt.verify and returns correct values', () => {
                mockJwtService.verify.mockReturnValue(tokenPayload);
                const payload = service.verifyJWT('token123');
                expect(payload).toEqual(tokenPayload);
                expect(mockJwtService.verify).toHaveBeenLastCalledWith(
                    'token123',
                    {
                        publicKey: 'pubkey',
                    },
                );
            });

            it('calls jwt.verify and returns correct values when correct scope is provided', () => {
                mockJwtService.verify.mockReturnValue(tokenPayload);
                const spyScope = jest.spyOn(service, 'checkScope');
                const payload = service.verifyJWT('token123', ['a', 'b']);
                expect(payload).toEqual(tokenPayload);
                expect(mockJwtService.verify).toHaveBeenLastCalledWith(
                    'token123',
                    {
                        publicKey: 'pubkey',
                    },
                );
                expect(spyScope).toHaveBeenCalledWith(payload, ['a', 'b']);
            });

            it('calls jwt.decode and returns correct values if auth is disabled', () => {
                mockJwtService.decode.mockReturnValue(tokenPayload);
                service.disabled = true;
                const payload = service.verifyJWT('token123');
                expect(payload).toEqual(tokenPayload);
                expect(mockJwtService.decode).toHaveBeenLastCalledWith(
                    'token123',
                );
            });

            it('throws UnauthorizedException if verification fails', () => {
                mockJwtService.verify.mockImplementation(() => {
                    throw new Error('failed');
                });
                expect(() => service.verifyJWT('token123')).toThrowError(
                    new UnauthorizedException('failed'),
                );
            });

            it('throws UnauthorizedException if auth is disabled and decoding fails', () => {
                mockJwtService.verify.mockImplementation(() => {
                    throw new Error('failed');
                });
                expect(() => service.verifyJWT('token123')).toThrowError(
                    new UnauthorizedException('failed'),
                );
            });

            it('throws UnauthorizedException if verification passes but scope does not match', () => {
                mockJwtService.verify.mockReturnValue(tokenPayload);
                expect(() =>
                    service.verifyJWT('token123', ['b', 'c']),
                ).toThrowError(
                    new UnauthorizedException('Token has no access to c'),
                );
                expect(mockJwtService.verify).toHaveBeenLastCalledWith(
                    'token123',
                    {
                        publicKey: 'pubkey',
                    },
                );
            });
        });
    });
});
