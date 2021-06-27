import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    disable: process.env.AUTH_DISABLE?.toLocaleLowerCase() === 'true',
    endpoint: process.env.AUTH_URL,
    fetchInterval: +process.env.AUTH_PUBKEY_FETCH_INTERVAL_MINUTES,
}));
