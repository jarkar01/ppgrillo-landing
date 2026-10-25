import { GoogleAuth } from 'google-auth-library'

let googleAuth: GoogleAuth | null = null

export function getGoogleAuth(): GoogleAuth | null {
  if (googleAuth) return googleAuth
  const rawKey = process.env.GCP_SERVICE_ACCOUNT_KEY
  if (!rawKey) {
    console.error('[google-auth] GCP_SERVICE_ACCOUNT_KEY is not configured')
    return null
  }
  try {
    googleAuth = new GoogleAuth({
      credentials: JSON.parse(rawKey),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    return googleAuth
  } catch (error) {
    console.error('[google-auth] GCP_SERVICE_ACCOUNT_KEY is not valid JSON:', error)
    return null
  }
}
