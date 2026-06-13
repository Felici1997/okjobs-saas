import { describe, it, expect } from 'vitest';
import { buildInterviewPrompt, buildFeedbackPrompt } from '@/lib/openrouter/prompts';

describe('buildInterviewPrompt', () => {
  it('returns system and context for technique type', () => {
    const result = buildInterviewPrompt('technique', 'CV details', 'Dev', 'Tech', 'intermediaire');
    expect(result.system).toContain('recruteur technique');
    expect(result.context).toContain('Dev');
    expect(result.context).toContain('Tech');
    expect(result.context).toContain('8');
  });

  it('returns system and context for comportemental type', () => {
    const result = buildInterviewPrompt('comportemental', 'CV details', 'Manager', 'Finance', 'debutant');
    expect(result.system).toContain('responsable RH');
    expect(result.context).toContain('Manager');
    expect(result.context).toContain('Finance');
    expect(result.context).toContain('5');
  });

  it('returns system and context for motivationnel type', () => {
    const result = buildInterviewPrompt('motivationnel', 'CV details', 'Dev', 'Santé', 'avance');
    expect(result.system).toContain('entretien de motivation');
    expect(result.context).toContain('Dev');
    expect(result.context).toContain('Santé');
    expect(result.context).toContain('12');
  });

  it('falls back to motivationnel for unknown type', () => {
    const result = buildInterviewPrompt('inconnu', '', 'Dev', 'Tech', 'debutant');
    expect(result.system).toContain('entretien de motivation');
  });

  it('handles empty CV context', () => {
    const result = buildInterviewPrompt('technique', '', 'Dev', 'Tech', 'debutant');
    expect(result.context).toContain("n'a pas fourni de CV");
  });

  it('includes nbQuestions based on difficulty', () => {
    const debutant = buildInterviewPrompt('technique', '', 'Dev', 'Tech', 'debutant');
    expect(debutant.context).toContain('5');

    const intermediaire = buildInterviewPrompt('technique', '', 'Dev', 'Tech', 'intermediaire');
    expect(intermediaire.context).toContain('8');

    const avance = buildInterviewPrompt('technique', '', 'Dev', 'Tech', 'avance');
    expect(avance.context).toContain('12');
  });
});

describe('buildFeedbackPrompt', () => {
  it('returns system and user prompts', () => {
    const result = buildFeedbackPrompt('Assistant: Bonjour\nCandidat: Bonjour');
    expect(result.system).toContain('coach en recrutement');
    expect(result.system).toContain('JSON');
    expect(result.user).toContain('transcript');
    expect(result.user).toContain('Assistant: Bonjour');
    expect(result.user).toContain('Candidat: Bonjour');
  });

  it('includes history in user prompt', () => {
    const history = 'Q1\nR1\nQ2\nR2';
    const result = buildFeedbackPrompt(history);
    expect(result.user).toContain(history);
  });
});
