import { describe, it, expect } from 'vitest';
import { interviewConfigSchema, interviewRespondSchema } from '@/lib/validations/interview';

describe('interviewConfigSchema', () => {
  it('accepts valid config', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Développeur Full Stack',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'intermediaire',
      nbQuestions: 5,
      timerMinutes: 30,
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal config (defaults)', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Développeur',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'debutant',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nbQuestions).toBe(5);
      expect(result.data.timerMinutes).toBe(0);
    }
  });

  it('rejects missing jobTitle', () => {
    const result = interviewConfigSchema.safeParse({
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'intermediaire',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid interviewType', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'invalid',
      difficulty: 'intermediaire',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid difficulty', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'expert',
    });
    expect(result.success).toBe(false);
  });

  it('rejects nbQuestions out of range (< 1)', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'debutant',
      nbQuestions: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects nbQuestions out of range (> 20)', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'debutant',
      nbQuestions: 21,
    });
    expect(result.success).toBe(false);
  });

  it('rejects timerMinutes out of range (< 0)', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'debutant',
      timerMinutes: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects timerMinutes out of range (> 120)', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'technique',
      difficulty: 'debutant',
      timerMinutes: 121,
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional cvId as valid UUID', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'comportemental',
      difficulty: 'avance',
      cvId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid cvId', () => {
    const result = interviewConfigSchema.safeParse({
      jobTitle: 'Dev',
      sector: 'Tech',
      interviewType: 'comportemental',
      difficulty: 'avance',
      cvId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('interviewRespondSchema', () => {
  it('accepts a valid message', () => {
    const result = interviewRespondSchema.safeParse({ message: 'Bonjour' });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = interviewRespondSchema.safeParse({ message: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing message', () => {
    const result = interviewRespondSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
