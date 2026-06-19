import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

type SendMessageParams = {
  phone: string;
  message: string;
  affiliateCodeId?: string;
  userId?: string;
};

async function logMessage(params: {
  affiliateCodeId?: string;
  userId?: string;
  direction: string;
  messageType: string;
  content: string;
  twilioSid?: string;
  status?: string;
}) {
  await supabase.from('whatsapp_logs').insert({
    affiliate_code_id: params.affiliateCodeId || null,
    user_id: params.userId || null,
    direction: params.direction,
    message_type: params.messageType,
    content: params.content,
    twilio_sid: params.twilioSid || null,
    status: params.status || 'sent',
  });
}

export async function sendWhatsApp(params: SendMessageParams): Promise<boolean> {
  try {
    if (process.env.TWILIO_ACCOUNT_SID) {
      return await sendViaTwilio(params);
    }
    return await sendViaMake(params);
  } catch (err) {
    console.error('WhatsApp send failed:', err);
    await logMessage({
      affiliateCodeId: params.affiliateCodeId,
      userId: params.userId,
      direction: 'outbound',
      messageType: 'error',
      content: params.message,
      status: 'failed',
    });
    return false;
  }
}

async function sendViaTwilio(params: SendMessageParams): Promise<boolean> {
  const twilio = await import('twilio');
  const client = twilio.default(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  const msg = await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM!}`,
    to: `whatsapp:${params.phone}`,
    body: params.message,
  });
  await logMessage({
    affiliateCodeId: params.affiliateCodeId,
    userId: params.userId,
    direction: 'outbound',
    messageType: 'twilio',
    content: params.message,
    twilioSid: msg.sid,
    status: msg.status,
  });
  return true;
}

async function sendViaMake(params: SendMessageParams): Promise<boolean> {
  const webhookUrl = process.env.MAKE_WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('No WhatsApp provider configured (TWILIO_ACCOUNT_SID nor MAKE_WHATSAPP_WEBHOOK_URL)');
    return false;
  }
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: params.phone,
      message: params.message,
      affiliateCodeId: params.affiliateCodeId,
      userId: params.userId,
    }),
  });
  const ok = res.ok;
  await logMessage({
    affiliateCodeId: params.affiliateCodeId,
    userId: params.userId,
    direction: 'outbound',
    messageType: 'make_webhook',
    content: params.message,
    status: ok ? 'sent' : 'failed',
  });
  return ok;
}

export async function sendAffiliateCodeWhatsApp(params: {
  phone: string;
  code: string;
  centerName: string;
  programTitle: string;
  affiliateCodeId: string;
  userId: string;
}): Promise<boolean> {
  const message = `*Okjobs* 🇨🇬\n\n` +
    `Vous êtes intéressé(e) par la formation *${params.programTitle}* chez *${params.centerName}*.\n\n` +
    `Présentez ce code à l'accueil :\n` +
    `*${params.code}*\n\n` +
    `Il vous garantit une inscription prioritaire. Valable 90 jours.`;
  return sendWhatsApp({
    phone: params.phone,
    message,
    affiliateCodeId: params.affiliateCodeId,
    userId: params.userId,
  });
}

export async function sendRelanceJ14(params: {
  phone: string;
  centerName: string;
  affiliateCodeId: string;
  userId: string;
}): Promise<boolean> {
  const message = `*Okjobs* 🇨🇬 — Nous avons une question pour vous !\n\n` +
    `Il y a 2 semaines, vous avez reçu un code pour la formation chez *${params.centerName}*.\n\n` +
    `Avez-vous finalement rejoint cette formation ?\n` +
    `Répondez *OUI* ou *NON* par message.`;
  return sendWhatsApp({
    phone: params.message,
    message,
    affiliateCodeId: params.affiliateCodeId,
    userId: params.userId,
  });
}

export function parseUserResponse(text: string): 'yes' | 'no' | null {
  const normalized = text.trim().toUpperCase();
  if (normalized === 'OUI' || normalized === 'YES' || normalized === 'O') return 'yes';
  if (normalized === 'NON' || normalized === 'NO' || normalized === 'N') return 'no';
  return null;
}
