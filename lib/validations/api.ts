import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
});

export const webhookRegisterSchema = z.object({
  url: z.string().url('URL valide requise'),
  events: z.array(z.enum(['interview.completed'])).min(1),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type WebhookRegisterInput = z.infer<typeof webhookRegisterSchema>;
