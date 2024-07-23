import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  HERE_GEOCODING_URL: z.string().url(),
  HERE_LOOKUP_URL: z.string().url(),
  HERE_API_KEY: z.string(),
});

export const environment = environmentSchema.parse(process.env);
