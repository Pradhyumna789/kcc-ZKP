'use client'

import { useContract, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'

export default function CheckCredential() {
  const address = useAddress() // Connected wallet address

  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: credential, isLoading } = useContractRead(contract, 'farmerCredentials', [address])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">Your Credential Status</h3>
      <p>Issued: {credential?.isIssued ? '✅ Yes' : '❌ No'}</p>
      <p>Revoked: {credential?.isRevoked ? 'Yes' : 'No'}</p>
    </div>
  )
}
