'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
}

export default function AuditorDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  // Read current auditor
  const { data: currentAuditor } = useContractRead(contract, 'auditor')
  const { data: loanCounter } = useContractRead(contract, 'loanCounter')

  // Contract write function
  const { mutateAsync: disburseFunds } = useContractWrite(contract, 'disburseFunds')

  // State
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [disburseAmount, setDisburseAmount] = useState('')
  const [billHash, setBillHash] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // Check if connected wallet is the auditor
  const isAuditor = address && currentAuditor && address.toLowerCase() === currentAuditor.toLowerCase()

  const handleDisburseFunds = async (loanId: number) => {
    if (!disburseAmount || !billHash) {
      alert('Please enter disbursement amount and bill hash')
      return
    }

    setLoading(`disburse-${loanId}`)
    try {
      await disburseFunds({ args: [loanId, disburseAmount, billHash] })
      alert(`₹${disburseAmount} disbursed for Loan #${loanId}`)
      setSelectedLoanId(null)
      setDisburseAmount('')
      setBillHash('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-black">Auditor Dashboard</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isAuditor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md border border-red-200">
          <div className="text-4xl mb-4 text-black">⚠</div>
          <h2 className="text-2xl font-bold mb-2 text-red-800">Access Denied</h2>
          <p className="text-gray-700 mb-4">You are not authorized as an auditor. Only the auditor wallet can access this dashboard.</p>
          <p className="text-sm text-gray-600 mb-4">
            Current Auditor: <br />
            <span className="font-mono text-xs text-black">{currentAuditor || 'Not set'}</span>
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const totalLoans = loanCounter ? (typeof loanCounter === 'object' && 'toNumber' in loanCounter ? loanCounter.toNumber?.() ?? 0 : Number(loanCounter)) : 0

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
              <h1 className="text-2xl font-bold text-gray-900">Auditor Dashboard</h1>
              <p className="text-sm text-gray-600">Verify bills and disburse funds</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Loans</p>
            <p className="text-3xl font-bold text-black">{totalLoans}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <p className="text-sm text-gray-600">Sanctioned Loans</p>
            <p className="text-3xl font-bold text-green-700">--</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
            <p className="text-sm text-gray-600">Total Disbursed</p>
            <p className="text-3xl font-bold text-blue-700">₹--</p>
          </div>
        </div>

        {/* Sanctioned Loans */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Sanctioned Loans (Ready for Disbursement)</h2>
          <p className="text-sm text-gray-600 mb-4">Review bills and disburse funds for approved loans</p>

          {totalLoans === 0 ? (
            <p className="text-gray-600 text-center py-8">No loan applications yet</p>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: totalLoans }, (_, i) => i).map((loanId) => (
                <LoanCard
                  key={loanId}
                  loanId={loanId}
                  selectedLoanId={selectedLoanId}
                  setSelectedLoanId={setSelectedLoanId}
                  disburseAmount={disburseAmount}
                  setDisburseAmount={setDisburseAmount}
                  billHash={billHash}
                  setBillHash={setBillHash}
                  loading={loading}
                  onDisburse={handleDisburseFunds}
                />
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-bold text-orange-900 mb-3">Auditor Responsibilities</h3>
          <ul className="text-sm text-orange-800 space-y-2 list-disc list-inside">
            <li>
              <strong>Verify Bills:</strong> Check authenticity of farmer&apos;s purchase bills/invoices
            </li>
            <li>
              <strong>Disburse Funds:</strong> Release funds only after bill verification
            </li>
            <li>
              <strong>Amount Check:</strong> Ensure disbursement doesn&apos;t exceed sanctioned amount
            </li>
            <li>
              <strong>Partial Disbursement:</strong> You can disburse in multiple installments
            </li>
            <li>
              <strong>Bill Hash:</strong> Use IPFS hash or any permanent storage reference
            </li>
          </ul>
        </div>

        {/* Bill Upload Guide */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-3 text-black">Bill Verification Process</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-2xl text-black">1</span>
              <div>
                <p className="font-semibold text-black">Farmer Submits Bill</p>
                <p className="text-gray-600">Farmer uploads bill/invoice for agricultural purchase</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl text-black">2</span>
              <div>
                <p className="font-semibold text-black">Auditor Verifies</p>
                <p className="text-gray-600">You verify the bill is legitimate and matches loan category</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl text-black">3</span>
              <div>
                <p className="font-semibold text-black">Enter Bill Hash</p>
                <p className="text-gray-600">Store bill on IPFS and enter the hash (e.g., ipfs://Qm...)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl text-black">4</span>
              <div>
                <p className="font-semibold text-black">Disburse Funds</p>
                <p className="text-gray-600">Release funds to farmer&apos;s wallet for verified amount</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Loan Card Component
function LoanCard({
  loanId,
  selectedLoanId,
  setSelectedLoanId,
  disburseAmount,
  setDisburseAmount,
  billHash,
  setBillHash,
  loading,
  onDisburse,
}: {
  loanId: number
  selectedLoanId: number | null
  setSelectedLoanId: (id: number | null) => void
  disburseAmount: string
  setDisburseAmount: (amount: string) => void
  billHash: string
  setBillHash: (hash: string) => void
  loading: string | null
  onDisburse: (loanId: number) => void
}) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])

  if (isLoading) {
    return <div className="p-4 border rounded-lg bg-gray-50 text-black">Loading loan #{loanId}...</div>
  }

  if (!loan) return null

  // Only show SANCTIONED loans
  if (loan.status !== 2) return null

  const toBigNumberString = (value: BigNumberish | undefined): string => {
    if (!value) return '0'
    if (typeof value === 'object' && value.toString) {
      return value.toString()
    }
    return String(value)
  }

  const requestedAmount = toBigNumberString(loan.requestedAmount as BigNumberish)
  const sanctionedAmount = toBigNumberString(loan.sanctionedAmount as BigNumberish)
  const disbursedAmount = toBigNumberString(loan.disbursedAmount as BigNumberish)
  const remainingAmount = Number(sanctionedAmount) - Number(disbursedAmount)
  const status = STATUS_MAP[loan.status]

  const isExpanded = selectedLoanId === loanId
  const isFullyDisbursed = Number(disbursedAmount) >= Number(sanctionedAmount)

  return (
    <div className={`border rounded-lg ${isFullyDisbursed ? 'bg-gray-50 border-gray-300' : 'bg-green-50 border-green-200'}`}>
      {/* Card Header */}
      <div className="p-4 cursor-pointer" onClick={() => setSelectedLoanId(isExpanded ? null : loanId)}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="font-bold text-lg text-black">Loan #{loanId}</p>
            <p className="text-xs font-mono text-gray-600 break-all">{loan.farmer}</p>
            <p className="text-sm mt-1">
              <span className="font-medium text-black">{loan.loanCategory}</span>
            </p>
          </div>
          <div className="text-right ml-4">
            <span className="text-xs font-semibold px-3 py-1 rounded bg-green-600 text-white">{status}</span>
            <p className="text-sm mt-2">{isFullyDisbursed ? <span className="text-green-700 font-semibold">Fully Disbursed</span> : <span className="text-orange-700 font-semibold">Pending</span>}</p>
          </div>
        </div>
      </div>

      {/* Expanded Details & Actions */}
      {isExpanded && (
        <div className="border-t p-4 bg-white">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2 text-sm">
              <p className="text-black">
                <strong>Requested:</strong> ₹{requestedAmount}
              </p>
              <p className="text-black">
                <strong>Sanctioned:</strong> ₹{sanctionedAmount}
              </p>
              <p className="text-black">
                <strong>Already Disbursed:</strong> ₹{disbursedAmount}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-black">
                <strong>Category:</strong> {loan.loanCategory}
              </p>
              <p className="text-black">
                <strong>Remaining:</strong> <span className="text-lg font-bold text-green-700">₹{remainingAmount}</span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Disbursement Progress</span>
              <span>{((Number(disbursedAmount) / Number(sanctionedAmount)) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${(Number(disbursedAmount) / Number(sanctionedAmount)) * 100}%` }} />
            </div>
          </div>

          {/* Disbursement Form */}
          {!isFullyDisbursed && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-sm text-black">Disburse Funds</h4>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Disbursement Amount (₹)</label>
                <input
                  type="text"
                  placeholder={`Max: ₹${remainingAmount}`}
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full p-2 border rounded text-black"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: ₹{remainingAmount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Bill/Invoice Hash</label>
                <input
                  type="text"
                  placeholder="ipfs://Qm... or any storage reference"
                  value={billHash}
                  onChange={(e) => setBillHash(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                />
                <p className="text-xs text-gray-500 mt-1">Permanent reference to the verified bill</p>
              </div>

              <button
                onClick={() => onDisburse(loanId)}
                disabled={loading === `disburse-${loanId}` || !disburseAmount || !billHash || Number(disburseAmount) > remainingAmount}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
              >
                {loading === `disburse-${loanId}` ? 'Processing...' : 'Disburse Funds'}
              </button>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Verify the bill authenticity before disbursing funds. This action is recorded on the blockchain and cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Fully Disbursed Message */}
          {isFullyDisbursed && (
            <div className="bg-green-100 p-4 rounded-lg border border-green-300">
              <p className="text-green-800 font-semibold text-center">This loan has been fully disbursed</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
