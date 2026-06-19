import { z } from 'zod';

export const startTestSchema = z.object({
  category: z.enum(['logique', 'math', 'verbal', 'spatial', 'mixte']),
  difficulty: z.enum(['debutant', 'intermediaire', 'avance']).default('intermediaire'),
  questionCount: z.number().int().min(5).max(20).default(10),
  timeLimitMinutes: z.number().int().min(5).max(60).default(15),
});

export const answerQuestionSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerIndex: z.number().int().min(0).max(3),
});

export const submitTestSchema = z.object({
  sessionId: z.string().uuid(),
});

export const startBilanSchema = z.object({});

export const submitBilanSchema = z.object({
  assessmentId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
  })),
});

export const generateBilanReportSchema = z.object({
  assessmentId: z.string().uuid(),
});
