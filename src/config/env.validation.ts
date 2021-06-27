import Joi from 'joi';

export default Joi.object({
    // APP
    APP_PORT: Joi.number().min(0).max(65536),
    APP_ID: Joi.string().uuid(),

    // DB
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().integer().default(5421),
    DB_USERNAME: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_DATABASE_TEST: Joi.string(),

    // LOGGER
    LOGGER_CONSOLE_LEVEL: Joi.string()
        .valid('silly', 'debug', 'info', 'warn', 'error')
        .default('info'),

    // AUTH
    AUTH_URL: Joi.string().uri({
        allowRelative: false,
        scheme: /https?/,
    }),
    AUTH_PUBKEY_FETCH_INTERVAL_MINUTES: Joi.number().integer().default(30),
    AUTH_DISABLE: Joi.boolean(),
});
