import { registerAs } from '@nestjs/config';
import { string } from 'joi';

export default registerAs('app', () => ({
    app: {
        port: +process.env.APP_PORT,
        id: process.env.APP_ID,
    },
    database: {
        test: 'THIS IS TEST',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
}));
