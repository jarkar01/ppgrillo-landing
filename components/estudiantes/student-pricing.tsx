'use client'

import { Pricing } from '@/components/pricing'
import { useOpenSignup } from './signup-modal'

export function StudentPricing() {
  const openSignup = useOpenSignup()
  return <Pricing onStartTrial={openSignup} />
}
