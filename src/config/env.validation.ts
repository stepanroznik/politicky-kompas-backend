import Joi from 'joi';

export default Joi.object({
    // APP
    PORT: Joi.number().min(0).max(65536),
    API_KEY: Joi.string(),

    // DB
    DATABASE_URL: Joi.string().required(),
    DATABASE_SSL: Joi.boolean(),

    // LOGGER
    LOGGER_CONSOLE_LEVEL: Joi.string()
        .valid('silly', 'debug', 'info', 'warn', 'error')
        .default('info'),
});
