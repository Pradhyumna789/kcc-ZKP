'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']
const STATUS_COLORS = {
  0: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-red-100 text-red-800 border-red-200',
}

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
}

export default function BankDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  // Read current bank officer
  const { data: currentBankOfficer } = useContractRead(contract, 'bankOfficer')
  const { data: loanCounter } = useContractRead(contract, 'loanCounter')

  // Contract write functions
  const { mutateAsync: reviewLoan } = useContractWrite(contract, 'reviewLoan')
  const { mutateAsync: sanctionLoan } = useContractWrite(contract, 'sanctionLoan')
  const { mutateAsync: rejectLoan } = useContractWrite(contract, 'rejectLoan')

  // State
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [sanctionAmount, setSanctionAmount] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)

  // Check if connected wallet is the bank officer
  const isBankOfficer = address && currentBankOfficer && address.toLowerCase() === currentBankOfficer.toLowerCase()

  const handleReviewLoan = async (loanId: number) => {
    setLoading(`review-${loanId}`)
    try {
      await reviewLoan({ args: [loanId] })
      alert(`Loan #${loanId} moved to UNDER_REVIEW`)
      setSelectedLoanId(null)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleSanctionLoan = async (loanId: number) => {
    if (!sanctionAmount) {
      alert('Please enter sanction amount')
      return
    }

    setLoading(`sanction-${loanId}`)
    try {
      await sanctionLoan({ args: [loanId, sanctionAmount] })
      alert(`Loan #${loanId} sanctioned with amount ₹${sanctionAmount}`)
      setSelectedLoanId(null)
      setSanctionAmount('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleRejectLoan = async (loanId: number) => {
    if (!confirm(`Are you sure you want to reject Loan #${loanId}?`)) {
      return
    }

    setLoading(`reject-${loanId}`)
    try {
      await rejectLoan({ args: [loanId] })
      alert(`Loan #${loanId} rejected`)
      setSelectedLoanId(null)
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
          <h2 className="text-2xl font-bold mb-4 text-black">Bank Officer Dashboard</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isBankOfficer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md border border-red-200">
          <div className="text-4xl mb-4 text-black">⚠</div>
          <h2 className="text-2xl font-bold mb-2 text-red-800">Access Denied</h2>
          <p className="text-gray-700 mb-4">You are not authorized as a bank officer. Only the bank officer wallet can access this dashboard.</p>
          <p className="text-sm text-gray-600 mb-4">
            Current Bank Officer: <br />
            <span className="font-mono text-xs text-black">{currentBankOfficer || 'Not set'}</span>
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const totalLoans = loanCounter ? (typeof loanCounter === 'object' && 'toNumber' in loanCounter && typeof loanCounter.toNumber === 'function' ? loanCounter.toNumber() : Number(loanCounter)) : 0

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
              <h1 className="text-2xl font-bold text-gray-900">Bank Officer Dashboard</h1>
              <p className="text-sm text-gray-600">Review, sanction, or reject loan applications</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Loans</p>
            <p className="text-3xl font-bold text-black">{totalLoans}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md border border-yellow-200">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-yellow-700">--</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
            <p className="text-sm text-gray-600">Under Review</p>
            <p className="text-3xl font-bold text-blue-700">--</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <p className="text-sm text-gray-600">Sanctioned</p>
            <p className="text-3xl font-bold text-green-700">--</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-black">Filter by status:</span>
            <button onClick={() => setFilterStatus(null)} className={`px-3 py-1 rounded text-sm ${filterStatus === null ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
              All
            </button>
            <button onClick={() => setFilterStatus(0)} className={`px-3 py-1 rounded text-sm ${filterStatus === 0 ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
              In Progress
            </button>
            <button onClick={() => setFilterStatus(1)} className={`px-3 py-1 rounded text-sm ${filterStatus === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
              Under Review
            </button>
            <button onClick={() => setFilterStatus(2)} className={`px-3 py-1 rounded text-sm ${filterStatus === 2 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
              Sanctioned
            </button>
            <button onClick={() => setFilterStatus(3)} className={`px-3 py-1 rounded text-sm ${filterStatus === 3 ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}>
              Rejected
            </button>
          </div>
        </div>

        {/* Loan List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Loan Applications</h2>

          {totalLoans === 0 ? (
            <p className="text-gray-600 text-center py-8">No loan applications yet</p>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: totalLoans }, (_, i) => i).map((loanId) => (
                <LoanCard
                  key={loanId}
                  loanId={loanId}
                  filterStatus={filterStatus}
                  selectedLoanId={selectedLoanId}
                  setSelectedLoanId={setSelectedLoanId}
                  sanctionAmount={sanctionAmount}
                  setSanctionAmount={setSanctionAmount}
                  loading={loading}
                  onReview={handleReviewLoan}
                  onSanction={handleSanctionLoan}
                  onReject={handleRejectLoan}
                />
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">Bank Officer Actions</h3>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Review:</strong> Move IN_PROGRESS loans to UNDER_REVIEW
            </li>
            <li>
              <strong>Sanction:</strong> Approve UNDER_REVIEW loans with sanctioned amount
            </li>
            <li>
              <strong>Reject:</strong> Reject any loan at any stage
            </li>
            <li>Farmers cannot apply for loans without credentials</li>
            <li>ZK-Proofs ensure privacy while proving eligibility</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

// Loan Card Component
function LoanCard({
  loanId,
  filterStatus,
  selectedLoanId,
  setSelectedLoanId,
  sanctionAmount,
  setSanctionAmount,
  loading,
  onReview,
  onSanction,
  onReject,
}: {
  loanId: number
  filterStatus: number | null
  selectedLoanId: number | null
  setSelectedLoanId: (id: number | null) => void
  sanctionAmount: string
  setSanctionAmount: (amount: string) => void
  loading: string | null
  onReview: (loanId: number) => void
  onSanction: (loanId: number) => void
  onReject: (loanId: number) => void
}) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])

  if (isLoading) {
    return <div className="p-4 border rounded-lg bg-gray-50 text-black">Loading loan #{loanId}...</div>
  }

  if (!loan) return null

  // Filter check
  if (filterStatus !== null && loan.status !== filterStatus) {
    return null
  }

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
  const status = loan.status !== undefined ? STATUS_MAP[loan.status] : 'UNKNOWN'
  const statusColor = STATUS_COLORS[loan.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'

  const isExpanded = selectedLoanId === loanId

  return (
    <div className={`border rounded-lg ${statusColor}`}>
      {/* Card Header */}
      <div className="p-4 cursor-pointer" onClick={() => setSelectedLoanId(isExpanded ? null : loanId)}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-black">Loan #{loanId}</p>
            <p className="text-sm font-mono text-gray-600">{loan.farmer}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 rounded bg-white text-black">{status}</span>
            <p className="text-sm mt-1 text-black">₹{requestedAmount}</p>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-black">{loan.loanCategory}</span>
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
                <strong>Disbursed:</strong> ₹{disbursedAmount}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-black">
                <strong>Category:</strong> {loan.loanCategory}
              </p>
              <p className="text-black">
                <strong>Status:</strong> {status}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Review Button (for IN_PROGRESS loans) */}
            {loan.status === 0 && (
              <button
                onClick={() => onReview(loanId)}
                disabled={loading === `review-${loanId}`}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                {loading === `review-${loanId}` ? 'Processing...' : 'Move to Under Review'}
              </button>
            )}

            {/* Sanction Button (for UNDER_REVIEW loans) */}
            {loan.status === 1 && (
              <>
                <input
                  type="text"
                  placeholder="Enter sanctioned amount (₹)"
                  value={sanctionAmount}
                  onChange={(e) => setSanctionAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full p-2 border rounded text-black"
                />
                <button
                  onClick={() => onSanction(loanId)}
                  disabled={loading === `sanction-${loanId}`}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading === `sanction-${loanId}` ? 'Processing...' : 'Sanction Loan'}
                </button>
              </>
            )}

            {/* Reject Button (always available except REJECTED) */}
            {loan.status !== 3 && (
              <button
                onClick={() => onReject(loanId)}
                disabled={loading === `reject-${loanId}`}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 font-semibold"
              >
                {loading === `reject-${loanId}` ? 'Processing...' : 'Reject Loan'}
              </button>
            )}

            {/* Already actioned loans */}
            {(loan.status === 2 || loan.status === 3) && <div className="text-center text-sm text-gray-600 py-2">No actions available for {status} loans</div>}
          </div>
        </div>
      )}
    </div>
  )
}
