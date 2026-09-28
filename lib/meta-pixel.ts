export const META_PIXEL_ID = '1351496760150497'

type Fbq = (command: 'track' | 'init' | 'trackCustom', event: string, params?: Record<string, unknown>) => void

export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (typeof fbq === 'function') fbq('track', event, params)
}
