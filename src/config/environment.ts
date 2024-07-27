import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().optional(),

  HERE_GEOCODING_URL: z.string().url(),
  HERE_LOOKUP_URL: z.string().url(),
  HERE_API_KEY: z.string().min(1),
});

export const environment = environmentSchema.parse(process.env);
