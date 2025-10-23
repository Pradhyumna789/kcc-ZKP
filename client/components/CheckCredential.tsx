'use client'

import { useContract, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'

export default function CheckCredential() {
  const address = useAddress()

  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: credential, isLoading } = useContractRead(contract, 'farmerCredentials', [address])

  if (!address) {
    return (
      <div className="p-4 bg-gray-50 border rounded-lg">
        <p className="text-gray-600">Connect wallet to check credential status</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border rounded-lg">
        <p className="text-gray-600">Loading credential status...</p>
      </div>
    )
  }

  return (
    <div className={`p-4 border rounded-lg ${credential?.isIssued ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className="font-bold mb-2">Credential Status</h3>
      <div className="space-y-1 text-sm">
        <p>
          <strong>Issued:</strong> {credential?.isIssued ? '✅ Yes' : '❌ No'}
        </p>
        {credential?.isIssued && (
          <>
            <p>
              <strong>Revoked:</strong> {credential?.isRevoked ? '⚠️ Yes' : '✅ No'}
            </p>
            <p className="text-xs text-gray-600">Issued at: {new Date(Number(credential.issuedAt) * 1000).toLocaleString()}</p>
          </>
        )}
      </div>

      {!credential?.isIssued && <p className="text-red-600 text-sm mt-2">⚠️ You need a credential to apply for loans. Contact KCC authority.</p>}
    </div>
  )
}
