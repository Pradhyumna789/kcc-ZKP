'use client'

import { useContract, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'

export default function MyLoans() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: loanIds } = useContractRead(contract, 'getFarmerLoans', [address])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Loans</h2>
      {loanIds?.map((loanId: number) => (
        <LoanCard key={loanId} loanId={loanId} />
      ))}
    </div>
  )
}

function LoanCard({ loanId }: { loanId: number }) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan } = useContractRead(contract, 'loanApplications', [loanId])

  const statusMap = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']

  return (
    <div className="border rounded p-4 mb-4">
      <p>
        <strong>Loan ID:</strong> {loanId}
      </p>
      <p>
        <strong>Amount:</strong> ₹{loan?.requestedAmount.toString()}
      </p>
      <p>
        <strong>Category:</strong> {loan?.loanCategory}
      </p>
      <p>
        <strong>Status:</strong> {statusMap[loan?.status]}
      </p>
      <p>
        <strong>Sanctioned:</strong> ₹{loan?.sanctionedAmount.toString()}
      </p>
      <p>
        <strong>Disbursed:</strong> ₹{loan?.disbursedAmount.toString()}
      </p>
    </div>
  )
}
