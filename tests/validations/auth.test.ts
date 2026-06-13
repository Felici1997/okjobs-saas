import { describe, it, expect } from 'vitest';
import { signUpSchema, signInSchema, resetPasswordSchema } from '@/lib/validations/auth';

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Jean Dupont',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      fullName: 'Jean Dupont',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
      fullName: 'Jean Dupont',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('8 caractères minimum');
    }
  });

  it('rejects empty fullName', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      fullName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = signUpSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts valid input', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'any',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = signInSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'bad',
      password: 'any',
    });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});
