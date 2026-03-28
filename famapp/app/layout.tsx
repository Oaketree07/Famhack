import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import BeaconListener from '@/components/BeaconListener'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CompSoc Feedback',
  description: 'Compsoc Feedback App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <BeaconListener />
        </Providers>
      </body>
    </html>
  )
}
