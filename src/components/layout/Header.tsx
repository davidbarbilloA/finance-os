'use client'

import { useAuthContext } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { useMobileNav } from '@/components/layout/PrivateShell'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/movimientos': 'Movimientos',
    '/estadisticas': 'Estadísticas',
}

export function Header() {
    const { user } = useAuthContext()
    const pathname = usePathname()
    const { openMobileNav } = useMobileNav()
    const title = pageTitles[pathname] ?? 'FinanceOS'

    return (
        <header className="h-14 border-b border-gray-800 bg-gray-900 px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    aria-label="Abrir menú"
                    onClick={openMobileNav}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden shrink-0"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <button
                    type="button"
                    aria-label="Notificaciones"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                    <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-400">
                            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">
                        {user?.email}
                    </span>
                </div>
            </div>
        </header>
    )
}
