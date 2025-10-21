import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">KCC Loan System</h1>
          <WalletConnect />
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Zero-Knowledge Proof Based Loan Management</h2>
          <p className="text-lg opacity-90">Apply for loans while keeping your sensitive information private.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-lg mb-2">🔐 Privacy First</h3>
            <p className="text-gray-600">Prove eligibility without revealing personal data</p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-lg mb-2">⚡ Fast Processing</h3>
            <p className="text-gray-600">Automated verification and instant approval</p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-lg mb-2">🔗 Blockchain Secured</h3>
            <p className="text-gray-600">Transparent and immutable loan records</p>
          </div>
        </div>
      </div>
    </main>
  )
}
