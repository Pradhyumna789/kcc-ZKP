import WalletConnect from '@/components/WalletConnect'
import CheckCredential from '@/components/CheckCredential'
import LoanApplication from '@/components/LoanApplication'
import MyLoans from '@/components/MyLoans'
import Link from 'next/link'

export default function Home() {
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
              <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
              <p className="text-sm text-gray-600">Apply for loans and track your applications</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Credential Status */}
        <CheckCredential />

        {/* Loan Application */}
        <LoanApplication />

        {/* My Loans */}
        <MyLoans />

        {/* Help Section */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">Farmer Guidelines</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>You must have a valid credential issued by the authority</li>
            <li>Loan eligibility is verified using Zero-Knowledge Proofs</li>
            <li>Your sensitive information remains private during application</li>
            <li>Track your loan status in real-time</li>
            <li>Submit bills for fund disbursement after loan sanction</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
