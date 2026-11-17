'use client'

import type { ComponentProps } from 'react'
import { trackMetaEvent } from '@/lib/meta-pixel'

type TrackedCheckoutLinkProps = ComponentProps<'a'> & {
  plan: 'standard' | 'family'
  planName: string
  value: number
}

export function TrackedCheckoutLink({ plan, planName, value, onClick, ...props }: TrackedCheckoutLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackMetaEvent('InitiateCheckout', { content_name: planName, content_ids: [plan], value, currency: 'MXN' })
        onClick?.(event)
      }}
    />
  )
}
