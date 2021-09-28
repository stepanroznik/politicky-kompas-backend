import Joi from 'joi';

export default Joi.object({
    // APP
    PORT: Joi.number().min(0).max(65536),
    APP_ID: Joi.string().uuid(),

    // DB
    DATABASE_URL: Joi.string().required(),
    DATABASE_SSL: Joi.boolean(),

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
