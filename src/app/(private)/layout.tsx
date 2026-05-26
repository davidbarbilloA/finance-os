import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { PrivateGuard } from '@/components/layout/PrivateGuard'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateGuard>
      <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PrivateGuard>
  )
}