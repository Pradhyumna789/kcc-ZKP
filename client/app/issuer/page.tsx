'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

export default function IssuerDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  // Contract write functions
  const { mutateAsync: issueCredential } = useContractWrite(contract, 'issueCredential')
  const { mutateAsync: revokeCredential } = useContractWrite(contract, 'revokeCredential')
  const { mutateAsync: setBankOfficer } = useContractWrite(contract, 'setBankOfficer')
  const { mutateAsync: setAuditor } = useContractWrite(contract, 'setAuditor')

  // Read current roles
  const { data: currentIssuer } = useContractRead(contract, 'issuer')
  const { data: currentBankOfficer } = useContractRead(contract, 'bankOfficer')
  const { data: currentAuditor } = useContractRead(contract, 'auditor')

  // State for forms
  const [farmerAddress, setFarmerAddress] = useState('')
  const [checkAddress, setCheckAddress] = useState('')
  const [bankOfficerAddress, setBankOfficerAddress] = useState('')
  const [auditorAddress, setAuditorAddress] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // Read credential status for checking
  const { data: credentialData, refetch: refetchCredential } = useContractRead(contract, 'farmerCredentials', [checkAddress])

  const handleIssueCredential = async () => {
    if (!farmerAddress) {
      alert('Please enter farmer address')
      return
    }

    setLoading('issue')
    try {
      await issueCredential({ args: [farmerAddress] })
      alert('Credential issued successfully!')
      setFarmerAddress('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleRevokeCredential = async () => {
    if (!farmerAddress) {
      alert('Please enter farmer address')
      return
    }

    setLoading('revoke')
    try {
      await revokeCredential({ args: [farmerAddress] })
      alert('Credential revoked successfully!')
      setFarmerAddress('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleSetBankOfficer = async () => {
    if (!bankOfficerAddress) {
      alert('Please enter bank officer address')
      return
    }

    setLoading('bank')
    try {
      await setBankOfficer({ args: [bankOfficerAddress] })
      alert('Bank officer set successfully!')
      setBankOfficerAddress('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleSetAuditor = async () => {
    if (!auditorAddress) {
      alert('Please enter auditor address')
      return
    }

    setLoading('auditor')
    try {
      await setAuditor({ args: [auditorAddress] })
      alert('Auditor set successfully!')
      setAuditorAddress('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleCheckCredential = () => {
    if (!checkAddress) {
      alert('Please enter address to check')
      return
    }
    refetchCredential()
  }

  // Check if connected wallet is the issuer
  const isIssuer = address && currentIssuer && address.toLowerCase() === currentIssuer.toLowerCase()

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-black">Issuer Dashboard</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isIssuer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md border border-red-200">
          <div className="text-4xl mb-4 text-black">⚠</div>
          <h2 className="text-2xl font-bold mb-2 text-red-800">Access Denied</h2>
          <p className="text-gray-700 mb-4">You are not authorized as an issuer. Only the issuer wallet can access this dashboard.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issuer Dashboard</h1>
              <p className="text-sm text-gray-600">Manage credentials and system roles</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Current Roles Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Current System Roles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Issuer</p>
              <p className="text-xs font-mono break-all text-black">{currentIssuer || 'Not set'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Bank Officer</p>
              <p className="text-xs font-mono break-all text-black">{currentBankOfficer || 'Not set'}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Auditor</p>
              <p className="text-xs font-mono break-all text-black">{currentAuditor || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Credential Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Credential Management</h2>
          <p className="text-sm text-gray-600 mb-4">Issue or revoke farmer credentials to control loan application access</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Farmer Wallet Address</label>
              <input type="text" placeholder="0x..." value={farmerAddress} onChange={(e) => setFarmerAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={handleIssueCredential} disabled={loading === 'issue'} className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
                {loading === 'issue' ? 'Processing...' : 'Issue Credential'}
              </button>

              <button onClick={handleRevokeCredential} disabled={loading === 'revoke'} className="bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold">
                {loading === 'revoke' ? 'Processing...' : 'Revoke Credential'}
              </button>
            </div>
          </div>
        </div>

        {/* Check Credential Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Check Credential Status</h2>
          <p className="text-sm text-gray-600 mb-4">Verify if a farmer has an active credential</p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter farmer address to check"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                className="flex-1 p-3 border rounded-lg text-black"
              />
              <button onClick={handleCheckCredential} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Check
              </button>
            </div>

            {credentialData && (
              <div className={`p-4 rounded-lg border ${credentialData.isIssued && !credentialData.isRevoked ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="space-y-2 text-sm">
                  <p className="text-black">
                    <strong>Status:</strong> {credentialData.isIssued ? (credentialData.isRevoked ? 'Revoked' : 'Active') : 'Not Issued'}
                  </p>
                  {credentialData.isIssued && (
                    <>
                      <p className="text-black">
                        <strong>Issued At:</strong> {new Date(Number(credentialData.issuedAt) * 1000).toLocaleString()}
                      </p>
                      <p className="text-black">
                        <strong>Issuer:</strong> <span className="font-mono text-xs">{credentialData.issuer}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Set Bank Officer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Set Bank Officer</h2>
          <p className="text-sm text-gray-600 mb-4">Assign a wallet address as the bank officer who can review and sanction loans</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Bank Officer Address</label>
              <input type="text" placeholder="0x..." value={bankOfficerAddress} onChange={(e) => setBankOfficerAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <button onClick={handleSetBankOfficer} disabled={loading === 'bank'} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold">
              {loading === 'bank' ? 'Processing...' : 'Set Bank Officer'}
            </button>
          </div>
        </div>

        {/* Set Auditor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Set Auditor</h2>
          <p className="text-sm text-gray-600 mb-4">Assign a wallet address as the auditor who can disburse funds based on bills</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Auditor Address</label>
              <input type="text" placeholder="0x..." value={auditorAddress} onChange={(e) => setAuditorAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <button onClick={handleSetAuditor} disabled={loading === 'auditor'} className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold">
              {loading === 'auditor' ? 'Processing...' : 'Set Auditor'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Issuer Responsibilities</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Verify farmer documents before issuing credentials</li>
            <li>Issue credentials only to eligible farmers</li>
            <li>Revoke credentials if farmer violates terms</li>
            <li>Set bank officer and auditor addresses for system operation</li>
            <li>Only the issuer wallet can perform these actions</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
