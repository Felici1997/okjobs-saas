import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
  fullName: z.string().min(1, 'Nom requis'),
});

export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
