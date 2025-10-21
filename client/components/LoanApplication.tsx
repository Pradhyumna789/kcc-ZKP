'use client'

import { useState } from 'react'
import { useContract, useContractWrite } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import { generateProof } from '@/lib/zkproof'

export default function LoanApplication() {
  const [formData, setFormData] = useState({
    aadhaarHash: '',
    landOwnershipAcres: '',
    annualIncome: '',
    requestedAmount: '',
    loanCategory: 'Agriculture',
  })
  const [loading, setLoading] = useState(false)

  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { mutateAsync: applyForLoan } = useContractWrite(contract, 'applyForLoan')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate ZK proof
      const { a, b, c, input } = await generateProof({
        aadhaarHash: formData.aadhaarHash,
        landOwnershipAcres: formData.landOwnershipAcres,
        annualIncome: formData.annualIncome,
        minLandRequired: '3',
        maxIncomeLimit: '300000',
      })

      // Submit to contract
      const tx = await applyForLoan({
        args: [a, b, c, input, formData.requestedAmount, formData.loanCategory],
      })

      console.log('Transaction:', tx)
      alert('Loan application submitted successfully!')
    } catch (error) {
      console.error(error)
      alert('Error submitting loan application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Apply for KCC Loan</h2>

      <input type="text" placeholder="Aadhaar Hash" value={formData.aadhaarHash} onChange={(e) => setFormData({ ...formData, aadhaarHash: e.target.value })} className="w-full p-2 border rounded" />

      <input
        type="number"
        placeholder="Land Ownership (acres)"
        value={formData.landOwnershipAcres}
        onChange={(e) => setFormData({ ...formData, landOwnershipAcres: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Annual Income (₹)"
        value={formData.annualIncome}
        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Requested Amount (₹)"
        value={formData.requestedAmount}
        onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? 'Generating Proof & Submitting...' : 'Apply for Loan'}
      </button>
    </form>
  )
}
