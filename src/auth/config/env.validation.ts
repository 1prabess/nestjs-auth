import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().default('development'),
  MONGO_URI: Joi.string().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),
});
