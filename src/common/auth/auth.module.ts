import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import appConfig from '../../config/app.config';
import authConfig from './auth.config';
import { AuthService } from './auth.service';

@Module({
    imports: [
        ConfigModule.forFeature(authConfig),
        ConfigModule.forFeature(appConfig),
        JwtModule.register({}),
        HttpModule,
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
