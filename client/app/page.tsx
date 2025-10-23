import WalletConnect from '@/components/WalletConnect'
import CheckCredential from '@/components/CheckCredential'
import MyLoans from '@/components/MyLoans'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">KCC Loan System</h1>
          <WalletConnect />
        </div>

        {/* Credential Status */}
        <CheckCredential />

        {/* Add more components below */}
        <MyLoans />
      </div>
    </main>
  )
}
