import { z } from 'zod';

export const interviewTypeEnum = z.enum(['technique', 'comportemental', 'motivationnel']);
export const difficultyEnum = z.enum(['debutant', 'intermediaire', 'avance']);

export const interviewConfigSchema = z.object({
  cvId: z.string().uuid().optional(),
  jobTitle: z.string().min(1, 'Intitulé du poste requis'),
  sector: z.string().min(1, 'Secteur requis'),
  interviewType: interviewTypeEnum,
  difficulty: difficultyEnum,
  nbQuestions: z.number().int().min(1).max(20).default(5),
  timerMinutes: z.number().int().min(0).max(120).default(0),
});

export const interviewRespondSchema = z.object({
  message: z.string().min(1, 'Message requis'),
});

export type InterviewConfigInput = z.infer<typeof interviewConfigSchema>;
export type InterviewRespondInput = z.infer<typeof interviewRespondSchema>;
