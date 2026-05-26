'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, ArrowLeftRight, BarChart3,
    LogOut, DollarSign
} from 'lucide-react'
import { AuthService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/movimientos', icon: ArrowLeftRight, label: 'Movimientos' },
    { href: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await AuthService.logout()
            router.replace('/login')
        } catch {
            window.location.assign('/login')
        }
    }

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-white">FinanceOS</h1>
                        <p className="text-xs text-gray-500">Gestión personal</p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}