const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0'

type SendResult = { ok: boolean; status?: number; error?: string }

async function postMessage(
  recipientRaw: string,
  message: Record<string, unknown>,
  payloadPhoneNumberId?: string,
): Promise<SendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  if (!accessToken) {
    console.error('[whatsapp] WHATSAPP_ACCESS_TOKEN is not configured')
    return { ok: false, error: 'missing_token' }
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || payloadPhoneNumberId
  if (!phoneNumberId) {
    console.error('[whatsapp] WHATSAPP_PHONE_NUMBER_ID is not configured')
    return { ok: false, error: 'missing_phone_number_id' }
  }

  // Cloud API delivers to the full international number (e.g. 5215654338979), never the 10-digit ID.
  const recipient = recipientRaw.replace(/\D/g, '')
  if (!recipient) return { ok: false, error: 'missing_recipient' }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          ...message,
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text()
      console.error(`[whatsapp] Cloud API send failed - status: ${res.status} - body: ${body}`)
      return { ok: false, status: res.status, error: body }
    }
    return { ok: true, status: res.status }
  } catch (error) {
    console.error('[whatsapp] Cloud API request error:', error)
    return { ok: false, error: String(error) }
  }
}

/** Free-form text. Only delivered inside the 24-hour customer service window. */
export function sendWhatsAppText(recipient: string, text: string, payloadPhoneNumberId?: string) {
  return postMessage(
    recipient,
    { type: 'text', text: { preview_url: false, body: text.slice(0, 4096) } },
    payloadPhoneNumberId,
  )
}

/** Approved template. Required for business-initiated messages outside the 24-hour window. */
export function sendWhatsAppTemplate(
  recipient: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[],
) {
  return postMessage(recipient, {
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: bodyParams.map((text) => ({ type: 'text', text: text.slice(0, 1024) })),
        },
      ],
    },
  })
}
