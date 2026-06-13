const POSTHOG_HOST = 'https://us.i.posthog.com';

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>
) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          $lib: 'okjobs-server',
        },
      }),
    });
  } catch {
    console.warn('[PostHog] Server capture failed');
  }
}
