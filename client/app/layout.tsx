'use client'

import { ThirdwebProvider } from '@thirdweb-dev/react'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThirdwebProvider activeChain={process.env.NEXT_PUBLIC_ACTIVE_CHAIN} clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT}>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  )
}
