'use client';

import posthog from 'posthog-js';

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  try {
    posthog.capture(event, properties);
  } catch {
    console.warn('PostHog not initialized');
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  try {
    posthog.identify(userId, traits);
  } catch {
    console.warn('PostHog not initialized');
  }
}

export function resetUser() {
  try {
    posthog.reset();
  } catch {
    console.warn('PostHog not initialized');
  }
}
