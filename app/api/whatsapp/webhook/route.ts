import { NextResponse } from 'next/server';

// 1. Validación que exige Meta por método GET
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Toma cualquiera de las variables de entorno que configuramos en Vercel
  const VERIFY_TOKEN = 
    process.env.WHATSAPP_VERIFY_TOKEN || 
    process.env.VERIFY_TOKEN || 
    process.env.WEBHOOK_VERIFY_TOKEN || 
    'ppgrillo_token_secreto_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Meta exige estrictamente responder con el challenge en texto plano y status 200
    return new Response(challenge, { status: 200 });
  }

  return new Response('Token mismatch', { status: 403 });
}

// 2. Recepción de mensajes entrantes de WhatsApp por método POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
