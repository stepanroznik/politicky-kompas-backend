import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    app: {
        port: Number(process.env.PORT ?? 3000),
    },
    database: {
        url: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true',
    },
}));
