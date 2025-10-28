
import * as Joi from 'joi';


export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.required(),//localhost:27017/nest-pokemon,
    MONGODB_NAME: Joi.required(),
    PORT: Joi.number().default(3005),
    DEFAULT_LIMIT: Joi.number().default(6),
})