import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  DATABASE_POOL_MAX: Joi.number().default(10),
  DATABASE_POOL_IDLE_TIMEOUT_MS: Joi.number().default(30000),
  DATABASE_POOL_CONNECTION_TIMEOUT_MS: Joi.number().default(5000),
});
