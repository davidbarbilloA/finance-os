import { PrivateShell } from '@/components/layout/PrivateShell'
import { PrivateGuard } from '@/components/layout/PrivateGuard'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateGuard>
      <PrivateShell>{children}</PrivateShell>
    </PrivateGuard>
  )
}
