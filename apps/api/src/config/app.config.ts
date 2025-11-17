import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    app: {
        port: +process.env.PORT,
    },
    database: {
        url: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true',
    },
}));
