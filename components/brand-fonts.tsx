import type { CSSProperties, ReactNode } from 'react'
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

const fontVars = {
  '--route-font-display': 'var(--font-inter), system-ui, sans-serif',
  '--route-font-body': 'var(--font-roboto), var(--font-inter), system-ui, sans-serif',
} as CSSProperties

export function BrandFonts({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${roboto.variable} font-body`} style={fontVars}>
      {children}
    </div>
  )
}
