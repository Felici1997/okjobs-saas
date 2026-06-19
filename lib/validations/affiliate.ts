import { z } from 'zod';

export const generateCodeSchema = z.object({
  programId: z.string().uuid('Programme invalide'),
  centerId: z.string().uuid('Centre invalide'),
});

export const declareConversionSchema = z.object({
  code: z.string().regex(/^OKJ-\d{4}-[A-Z0-9]{4}$/, 'Format de code invalide'),
});

export const userResponseSchema = z.object({
  code: z.string(),
  response: z.enum(['yes', 'no']),
});

export const createCenterSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  commissionPct: z.number().int().min(0).max(100).default(10),
  registrationFeePaid: z.boolean().default(false),
});

export const createProgramSchema = z.object({
  centerId: z.string().uuid('Centre invalide'),
  title: z.string().min(1, 'Titre requis'),
  category: z.enum(['bureautique', 'comptabilite', 'dev', 'langues']),
  price: z.number().int().min(0, 'Prix invalide'),
  duration: z.string().optional(),
});

export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;
export type DeclareConversionInput = z.infer<typeof declareConversionSchema>;
export type UserResponseInput = z.infer<typeof userResponseSchema>;
export type CreateCenterInput = z.infer<typeof createCenterSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
