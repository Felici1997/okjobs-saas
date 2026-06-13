import { describe, it, expect } from 'vitest';
import { jsonResponse, errorResponse } from '@/lib/api/response';

describe('jsonResponse', () => {
  it('returns successful JSON response', () => {
    const res = jsonResponse({ hello: 'world' });
    expect(res.status).toBe(200);
  });

  it('returns JSON with custom status', () => {
    const res = jsonResponse({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it('returns parseable JSON body', async () => {
    const res = jsonResponse({ data: [1, 2, 3] });
    const body = await res.json();
    expect(body).toEqual({ data: [1, 2, 3] });
  });
});

describe('errorResponse', () => {
  it('returns error JSON with given status', () => {
    const res = errorResponse('Not found', 404);
    expect(res.status).toBe(404);
  });

  it('returns error message in body', async () => {
    const res = errorResponse('Clé API invalide', 401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Clé API invalide' });
  });

  it('returns 400 for validation errors', async () => {
    const res = errorResponse('Données invalides', 400);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Données invalides');
  });

  it('returns 500 for server errors', async () => {
    const res = errorResponse('Erreur serveur', 500);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Erreur serveur');
  });
});
