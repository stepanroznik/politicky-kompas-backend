import { SetMetadata } from '@nestjs/common';
import { AUTH_SCOPE } from '../auth.constants';

export const AuthScope = (...permissions: string[]) =>
    SetMetadata(AUTH_SCOPE, permissions);
