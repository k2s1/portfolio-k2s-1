import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
title: 'K2S - Portfolio',
description:
  'K2S builds communities. drives engagement. helping web3 projects grow through community management, moderation, partnerships, and strategic execution. worked with Seismic and Zama.',
generator: 'K2S',
  icons: {
    icon: '/k2s.png',
    shortcut: '/k2s.png',
    apple: '/k2s.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ background: '#000' }}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
