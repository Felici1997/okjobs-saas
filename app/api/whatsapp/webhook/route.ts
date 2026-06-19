import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseUserResponse } from '@/lib/whatsapp';
import { markUserConfirmation } from '@/lib/affiliate';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData) as Record<string, string>;
    const from = body.From?.replace('whatsapp:', '') || '';
    const messageBody = body.Body || '';

    const response = parseUserResponse(messageBody);

    if (response) {
      const supabase = createAdminClient();
      const { data: codes } = await supabase
        .from('affiliate_codes')
        .select('id, code')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (codes && codes.length > 0) {
        await markUserConfirmation(codes[0].id, response);
      }
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${response ? '<Message>Merci pour votre réponse !</Message>' : '<Message>Répondez OUI ou NON s\'il vous plaît.</Message>'}
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 });
  }
}
