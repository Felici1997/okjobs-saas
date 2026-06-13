import { jsonResponse } from '@/lib/api/response';

export async function GET() {
  return jsonResponse({
    status: 'ok',
    version: '1.0.0',
    name: 'Okjobs API',
    docs: '/api-docs',
  });
}
