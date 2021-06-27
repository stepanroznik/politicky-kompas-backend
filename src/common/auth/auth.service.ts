import {
    BadRequestException,
    HttpService,
    Inject,
    Injectable,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import appConfig from '../../config/app.config';
import { LoggerService } from '../logger/logger.service';
import authConfig from './auth.config';

export interface TokenPayload {
    userId: string;
    scope?: string[];
    tenant?: string;
}
@Injectable()
export class AuthService implements OnModuleInit {
    private oauthEndpoint = '';
    getOauthEnpoint() {
        return this.oauthEndpoint;
    }
    private publicKey = '';
    getPublicKey() {
        return this.publicKey;
    }
    private apiKey = '';
    private accessToken = {};
    public disabled: boolean;
    private readonly appId: string;

    constructor(
        private jwt: JwtService,
        private http: HttpService,
        @Inject(authConfig.KEY)
        private authCfg: ConfigType<typeof authConfig>,
        @Inject(appConfig.KEY)
        private appCfg: ConfigType<typeof appConfig>,
        private logger: LoggerService,
    ) {
        this.logger.setContext(AuthService.name);
        this.disabled = authCfg.disable ?? false;
        this.oauthEndpoint = authCfg.endpoint;
        this.appId = this.appCfg.app.id;
    }

    async onModuleInit() {
        if (this.disabled) {
            this.logDisabledWarning();
        } else {
            await this.refreshPubKey();
            if (this.authCfg.fetchInterval)
                setInterval(
                    () => this.refreshPubKey(),
                    this.authCfg.fetchInterval * 60 * 1000,
                );
        }
        this.logger.log('auth service initialised');
    }

    private logDisabledWarning() {
        this.logger.warn(
            'Authentication is disabled! In production set AUTH_DISABLED to false!',
        );
    }

    public async httpGet(url) {
        this.logger.debug(`sending request to ${url}`);
        const response = await this.http.get(url).toPromise();
        return response;
    }

    private async refreshPubKey() {
        try {
            this.publicKey = !this.disabled
                ? (await this.httpGet(this.oauthEndpoint + '/oauth/pubkey'))
                      .data
                : '';
        } catch (e) {
            this.logger.error(
                `Could not retrieve public key from the Auth server: ${e.message}`,
            );
            throw e;
        }
    }

    /**
     * Checks if the scope array in the token payload contains all
     * items supplied in "scope"
     *
     * @param payload
     * @param  scope
     * @throws if the token scope is missing some permission
     */
    checkScope(payload: TokenPayload, scope: string[] = []) {
        for (const permission of scope) {
            if (!payload.scope?.includes(permission)) {
                throw new UnauthorizedException(
                    `Token has no access to ${permission}`,
                );
            }
        }
    }

    /**
     * Check if the supplied tenantId is present in the token,
     * unless the token scope includes "system"
     *
     * @param payload
     * @param tenant
     * @param role
     * @throws if the token scope is missing some permission
     */
    checkTenant(payload: TokenPayload, tennatId: string) {
        if (payload.scope?.find((s) => s === 'system')) return;
        if (payload.tenant !== tennatId)
            throw new UnauthorizedException(
                `Token has no access to tenant id ${tennatId}`,
            );
    }

    verifyJWT(token: string, scope?: string[]) {
        let payload: TokenPayload;
        if (this.disabled) {
            try {
                this.logDisabledWarning();
                return this.jwt.decode(token) as TokenPayload;
            } catch (e) {
                throw new BadRequestException(e);
            }
        }

        try {
            payload = this.jwt.verify(token, { publicKey: this.publicKey });
        } catch (e) {
            throw new UnauthorizedException(e);
        }
        if (scope) this.checkScope(payload, scope);
        return payload;
    }
}
