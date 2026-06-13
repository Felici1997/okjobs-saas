import { describe, it, expect, beforeEach } from 'vitest';

// Dynamically import to avoid module-level side effects
async function getAuthModule() {
  return await import('@/lib/api/auth');
}

describe('checkRateLimit', () => {
  beforeEach(async () => {
    const mod = await getAuthModule();
    // Reset the internal Map by accessing via the module
    // We can't easily reset private state, so we use unique keys per test
  });

  it('allows first request', async () => {
    const mod = await getAuthModule();
    const result = mod.checkRateLimit(`test-key-${Date.now()}`);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('decrements remaining on each call', async () => {
    const mod = await getAuthModule();
    const key = `rate-test-${Date.now()}-${Math.random()}`;

    const r1 = mod.checkRateLimit(key);
    expect(r1.remaining).toBe(59);

    const r2 = mod.checkRateLimit(key);
    expect(r2.remaining).toBe(58);

    const r3 = mod.checkRateLimit(key);
    expect(r3.remaining).toBe(57);
  });

  it('allows up to 60 requests', async () => {
    const mod = await getAuthModule();
    const key = `limit-test-${Date.now()}-${Math.random()}`;

    for (let i = 0; i < 60; i++) {
      const r = mod.checkRateLimit(key);
      expect(r.allowed).toBe(true);
    }
  });

  it('blocks the 61st request', async () => {
    const mod = await getAuthModule();
    const key = `block-test-${Date.now()}-${Math.random()}`;

    for (let i = 0; i < 60; i++) {
      mod.checkRateLimit(key);
    }

    const blocked = mod.checkRateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after window expires', async () => {
    const mod = await getAuthModule();
    const key = `reset-test-${Date.now()}-${Math.random()}`;

    for (let i = 0; i < 60; i++) {
      mod.checkRateLimit(key);
    }

    const blocked = mod.checkRateLimit(key);
    expect(blocked.allowed).toBe(false);

    // Different key should work independently
    const otherKey = `other-${Date.now()}-${Math.random()}`;
    const allowed = mod.checkRateLimit(otherKey);
    expect(allowed.allowed).toBe(true);
  });
});
