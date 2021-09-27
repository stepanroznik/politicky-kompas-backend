import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    app: {
        port: +process.env.PORT,
        id: process.env.APP_ID,
    },
    database: {
        test: 'THIS IS TEST',
        url: process.env.DATABASE_URL,
    },
}));
