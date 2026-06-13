const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const FALLBACK_MODELS = [
  'google/gemma-4-31b-it:free',
  'openrouter/free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

const MAX_RETRIES = 3;

export type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export async function generateChatCompletion(
  messages: OpenRouterMessage[],
  temperature = 0.7,
  maxTokens = 2048
): Promise<string> {
  let lastErr: { message: string; status?: number } | null = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          lastErr = { message: errBody, status: response.status };
          console.error('[OpenRouter Error]', { model, status: response.status, body: errBody });

          if (response.status === 401) throw new Error('OPENROUTER_AUTH_FAILED');

          if (response.status === 429) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }

          if (response.status === 404 || response.status === 400) continue;

          if (response.status >= 500) break;

          throw new Error('OPENROUTER_FAILED');
        }

        const data: OpenRouterResponse = await response.json();
        let text = data.choices[0]?.message?.content || '';
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        return text;
      } catch (err) {
        if (err instanceof TypeError) {
          lastErr = { message: `Réseau indisponible pour ${model}` };
          console.error('[OpenRouter Error]', { model, error: 'Network failure' });
          continue;
        }
        if (err instanceof Error && (err.message === 'OPENROUTER_FAILED' || err.message === 'OPENROUTER_AUTH_FAILED')) {
          throw new Error("L'assistant est momentanément indisponible. Réessaie dans quelques instants.");
        }
        throw err;
      }
    }
  }

  console.error('[OpenRouter Error]', lastErr);
  throw new Error("L'assistant est momentanément indisponible. Réessaie dans quelques instants.");
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const content = await generateChatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    0.3,
    4096
  );

  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/{[\s\S]*}/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;

  return JSON.parse(jsonStr.trim()) as T;
}
