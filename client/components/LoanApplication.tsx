'use client'

import { useState } from 'react'
import { useContract, useContractWrite, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import { generateProof } from '@/lib/zkproof'

export default function LoanApplication() {
  const address = useAddress()
  const [formData, setFormData] = useState({
    aadhaarHash: '',
    landOwnershipAcres: '',
    annualIncome: '',
    requestedAmount: '',
    loanCategory: 'Agriculture',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { mutateAsync: applyForLoan } = useContractWrite(contract, 'applyForLoan')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!formData.aadhaarHash || !formData.landOwnershipAcres || !formData.annualIncome || !formData.requestedAmount) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    setStatus('Generating ZK proof...')

    console.log('Form data submitted:', formData)

    try {
      console.log('Step 1: Calling generateProof...')
      const { a, b, c, input } = await generateProof({
        aadhaarHash: formData.aadhaarHash,
        landOwnershipAcres: formData.landOwnershipAcres,
        annualIncome: formData.annualIncome,
        minLandRequired: '3',
        maxIncomeLimit: '300000',
      })

      console.log('Step 2: Proof generated!', { a, b, c, input })
      setStatus('Submitting to blockchain...')

      const tx = await applyForLoan({
        args: [a, b, c, input, formData.requestedAmount, formData.loanCategory],
      })

      console.log('Step 3: Transaction successful!', tx)
      setStatus('Loan application submitted!')

      alert('Loan application submitted successfully!')

      setFormData({
        aadhaarHash: '',
        landOwnershipAcres: '',
        annualIncome: '',
        requestedAmount: '',
        loanCategory: 'Agriculture',
      })

      setTimeout(() => setStatus(''), 3000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error)
        setStatus(`Error: ${error.message}`)
        alert(`Error: ${error.message || 'Failed to submit loan application'}`)
      } else {
        console.error('Unknown error:', error)
        setStatus('Unknown error occurred')
        alert('Unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return (
      <div className="max-w-md mx-auto p-6 border rounded-lg bg-yellow-50">
        <p className="text-yellow-800">Please connect your wallet to apply for a loan</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-black">Apply for KCC Loan</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Aadhaar Hash</label>
          <input
            type="text"
            placeholder="123456789012"
            value={formData.aadhaarHash}
            onChange={(e) => setFormData({ ...formData, aadhaarHash: e.target.value })}
            className="w-full p-2 border rounded text-black"
            required
            minLength={12}
            maxLength={12}
          />
          <p className="text-xs text-gray-500 mt-1">12-digit Aadhaar number</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Land Ownership (acres)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="5"
            value={formData.landOwnershipAcres}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setFormData({ ...formData, landOwnershipAcres: value })
            }}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Annual Income (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="200000"
            value={formData.annualIncome}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setFormData({ ...formData, annualIncome: value })
            }}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Requested Amount (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="50000"
            value={formData.requestedAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setFormData({ ...formData, requestedAmount: value })
            }}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Loan Category</label>
          <select value={formData.loanCategory} onChange={(e) => setFormData({ ...formData, loanCategory: e.target.value })} className="w-full p-2 border rounded text-black">
            <option>Agriculture</option>
            <option>Equipment</option>
            <option>Seeds</option>
            <option>Irrigation</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
          {loading ? 'Processing...' : 'Generate Proof & Apply'}
        </button>

        {status && (
          <div className={`p-3 rounded text-sm ${status.includes('submitted') ? 'bg-green-50 text-green-800' : status.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            {status}
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
          <p className="text-black">Eligibility criteria:</p>
          <ul className="list-disc list-inside ml-2">
            <li>Land ownership ≥ 3 acres</li>
            <li>Annual income ≤ ₹300,000</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
