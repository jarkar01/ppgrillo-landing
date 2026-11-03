import { createHash, timingSafeEqual } from 'node:crypto'
import { firestoreContext } from '@/lib/web-users'

export const dynamic = 'force-dynamic'

// Temporary diagnostic endpoint. Only the SHA-256 of the one-time token is stored here.
const TOKEN_SHA256 = 'f39906687f827bdb2abefc837d54bf04311da3485c39841daaa95c3354006150'
const TIMEOUT_MS = 8_000

function isAuthorized(request: Request): boolean {
  const token = request.headers.get('x-diagnostic-token') ?? ''
  const actual = createHash('sha256').update(token).digest()
  return timingSafeEqual(actual, Buffer.from(TOKEN_SHA256, 'hex'))
}

function serviceAccountEmail(): string | null {
  try {
    return JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY ?? '').client_email ?? null
  } catch {
    return null
  }
}

async function step(name: string, run: () => Promise<Response>) {
  try {
    const res = await run()
    const body = await res.text()
    const result = { step: name, ok: res.ok, status: res.status, body: body.slice(0, 1500) }
    console.log('[v0] firestore-diag', JSON.stringify(result))
    return result
  } catch (error) {
    const result = { step: name, ok: false, status: 0, body: String(error) }
    console.log('[v0] firestore-diag', JSON.stringify(result))
    return result
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const env = {
    hasKey: Boolean(process.env.GCP_SERVICE_ACCOUNT_KEY),
    serviceAccount: serviceAccountEmail(),
    configuredProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
  }
  console.log('[v0] firestore-diag env', JSON.stringify(env))

  const ctx = await firestoreContext()
  if (!ctx) {
    console.log('[v0] firestore-diag context', 'could not obtain Firestore credentials')
    return Response.json({ env, error: 'could not obtain Firestore credentials' }, { status: 500 })
  }

  const targetProject = ctx.base.split('/')[6]
  const docId = `diagnostic-test-${Date.now()}`
  const path = `${ctx.base}/users/${docId}`
  console.log('[v0] firestore-diag target', targetProject, `users/${docId}`)

  const write = await step('create', () =>
    fetch(`${ctx.base}/users?documentId=${docId}`, {
      method: 'POST',
      headers: ctx.headers,
      body: JSON.stringify({
        fields: {
          diagnostic: { stringValue: 'temporary write test' },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
  )
  const read = write.ok
    ? await step('read', () => fetch(path, { headers: ctx.headers, signal: AbortSignal.timeout(TIMEOUT_MS) }))
    : null
  const cleanup = write.ok
    ? await step('delete', () =>
        fetch(path, { method: 'DELETE', headers: ctx.headers, signal: AbortSignal.timeout(TIMEOUT_MS) }),
      )
    : null

  return Response.json({ env, targetProject, document: `users/${docId}`, write, read, cleanup })
}
