'use client'

import { ConnectWallet } from '@thirdweb-dev/react'

export default function WalletConnect() {
  return (
    <div className="flex justify-end p-4">
      <ConnectWallet theme="dark" btnTitle="Connect Wallet" />
    </div>
  )
}
