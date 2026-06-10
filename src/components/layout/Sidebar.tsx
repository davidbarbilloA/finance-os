'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
    LayoutDashboard, ArrowLeftRight, BarChart3,
    LogOut, DollarSign
} from 'lucide-react'
import { AuthService } from '@/services/auth.service'
import { useMobileNav } from '@/components/layout/PrivateShell'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/movimientos', icon: ArrowLeftRight, label: 'Movimientos' },
    { href: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
        <>
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

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
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

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </button>
            </div>
        </>
    )
}

export function Sidebar() {
    const pathname = usePathname()
    const { mobileNavOpen, closeMobileNav } = useMobileNav()

    useEffect(() => {
        closeMobileNav()
    }, [pathname, closeMobileNav])

    useEffect(() => {
        document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileNavOpen])

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={closeMobileNav}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-200 ease-out lg:hidden ${
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-hidden={!mobileNavOpen}
            >
                <SidebarContent onNavigate={closeMobileNav} />
            </aside>
        </>
    )
}
