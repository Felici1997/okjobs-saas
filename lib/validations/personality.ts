import { z } from 'zod';

export const startPersonalityTestSchema = z.object({});

export const submitPersonalityTestSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
  })).min(30).max(30),
});
