import { z } from 'zod';

export const interviewTypeEnum = z.enum(['technique', 'comportemental', 'motivationnel']);
export const difficultyEnum = z.enum(['debutant', 'intermediaire', 'avance']);

function estMotValide(word: string): boolean {
  if (word.length < 2) return false;
  if (!/[aeiouyAEIOUYàâäéèêëïîôöùûü]/.test(word)) return false;
  if (/(.)\1{3,}/.test(word)) return false;
  return true;
}

function estTexteValide(value: string, minWords: number): boolean {
  const words = value.trim().split(/\s+/);
  if (words.length < minWords) return false;
  return words.every(estMotValide);
}

export const interviewConfigSchema = z.object({
  cvId: z.string().uuid().optional().or(z.literal('')),
  jobTitle: z
    .string()
    .min(3, 'Intitulé du poste trop court (minimum 3 caractères)')
    .refine((v) => estTexteValide(v, 2), {
      message: 'Intitulé du poste invalide. Exemple : "Développeur Full Stack"',
    }),
  sector: z
    .string()
    .min(2, 'Secteur trop court')
    .refine((v) => estTexteValide(v, 1), {
      message: 'Secteur invalide. Exemple : "Tech", "Finance", "Santé"',
    }),
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
