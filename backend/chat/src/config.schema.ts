import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432).required(),
  POSTGRES_USER_CHAT: Joi.string().required(),
  POSTGRES_PASSWORD_CHAT: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
});
