import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'

export default function HomePage() {
  const roles = [
    {
      name: 'Farmer',
      description: 'Apply for KCC loans and track your applications',
      icon: '🌾',
      path: '/farmer',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Issuer',
      description: 'Issue and manage farmer credentials',
      icon: '🏛️',
      path: '/issuer',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Bank Officer',
      description: 'Review and sanction loan applications',
      icon: '🏦',
      path: '/bank',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Auditor',
      description: 'Verify bills and disburse funds',
      icon: '📊',
      path: '/auditor',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KCC Loan System</h1>
            <p className="text-sm text-gray-600">Zero-Knowledge Proof Based Loan Management</p>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to KCC Loan Portal</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Privacy-preserving loan management system powered by Zero-Knowledge Proofs and blockchain technology</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-center mb-6">Select Your Role</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <Link key={role.name} href={role.path} className={`${role.color} text-white rounded-lg p-6 shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{role.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{role.name}</h4>
                  <p className="text-sm opacity-90">{role.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔐</div>
            <h4 className="font-bold text-lg mb-2">Privacy First</h4>
            <p className="text-gray-600 text-sm">Prove eligibility without revealing sensitive personal information</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold text-lg mb-2">Fast Processing</h4>
            <p className="text-gray-600 text-sm">Automated verification and instant approval decisions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔗</div>
            <h4 className="font-bold text-lg mb-2">Blockchain Secured</h4>
            <p className="text-gray-600 text-sm">Transparent and immutable record of all transactions</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 KCC Loan System - Powered by Zero-Knowledge Proofs</p>
        </div>
      </footer>
    </div>
  )
}
