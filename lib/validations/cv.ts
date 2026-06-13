import { z } from 'zod';

export const personalDetailsSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().email('Email invalide').or(z.literal('')).default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  photoUrl: z.string().optional(),
  description: z.string().default(''),
  postSeeking: z.string().default(''),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  jobTitle: z.string().min(1, 'Intitulé requis'),
  companyName: z.string().min(1, 'Entreprise requise'),
  startDate: z.string().min(1, 'Date début requise'),
  endDate: z.string().min(1, 'Date fin requise'),
  description: z.string().default(''),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(1, 'École requise'),
  degree: z.string().min(1, 'Diplôme requis'),
  description: z.string().default(''),
  startDate: z.string().min(1, 'Date début requise'),
  endDate: z.string().min(1, 'Date fin requise'),
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Compétence requise'),
});

export const languageSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, 'Langue requise'),
  proficiency: z.string().min(1, 'Niveau requis'),
});

export const hobbySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Loisir requis'),
});

export const cvDocumentSchema = z.object({
  title: z.string().min(1, 'Titre requis').default('Mon CV'),
  personalDetails: personalDetailsSchema,
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  languages: z.array(languageSchema).default([]),
  hobbies: z.array(hobbySchema).default([]),
});

export type CVDocumentInput = z.infer<typeof cvDocumentSchema>;
