'use client'

import { useAuthContext } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/movimientos': 'Movimientos',
    '/estadisticas': 'Estadísticas',
}

export function Header() {
    const { user } = useAuthContext()
    const pathname = usePathname()
    const title = pageTitles[pathname] ?? 'FinanceOS'

    return (
        <header className="h-14 border-b border-gray-800 bg-gray-900 px-6 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <div className="flex items-center gap-3">
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
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