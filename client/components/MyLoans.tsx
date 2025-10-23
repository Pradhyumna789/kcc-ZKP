'use client'

import { useContract, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
  _hex?: string
  _isBigNumber?: boolean
}

export default function MyLoans() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: loanIds, isLoading } = useContractRead(contract, 'getFarmerLoans', [address])

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">Connect your wallet to view loans</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!loanIds || loanIds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">No loans found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-black">My Loans ({loanIds.length})</h2>
      <div className="space-y-4">
        {(loanIds as BigNumberish[]).map((loanId: BigNumberish, index: number) => {
          const id = typeof loanId === 'object' && loanId.toNumber ? loanId.toNumber() : Number(loanId)
          return <LoanCard key={index} loanId={id} />
        })}
      </div>
    </div>
  )
}

function LoanCard({ loanId }: { loanId: number }) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])

  if (isLoading) {
    return (
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <p className="text-black">Loading loan #{loanId}...</p>
      </div>
    )
  }

  if (!loan) return null

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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-lg font-bold text-black">Loan #{loanId}</p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            status === 'SANCTIONED'
              ? 'bg-green-100 text-green-800'
              : status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : status === 'UNDER_REVIEW'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-black">
          <strong>Category:</strong> {loan.loanCategory}
        </p>
        <p className="text-black">
          <strong>Requested Amount:</strong> ₹{requestedAmount}
        </p>
        <p className="text-black">
          <strong>Sanctioned Amount:</strong> ₹{sanctionedAmount}
        </p>
        <p className="text-black">
          <strong>Disbursed Amount:</strong> ₹{disbursedAmount}
        </p>
      </div>
    </div>
  )
}
