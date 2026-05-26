'use client'

import { useAuthContext } from '@/context/AuthContext'
import { Bell, User as UserIcon } from 'lucide-react'

export function Header() {
    const { user } = useAuthContext()

    return (
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
            <div>
                <h2 className="text-sm font-semibold text-gray-400">FinanceOS</h2>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Notifications Button */}
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-850 rounded-lg transition-all relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </button>

                <div className="h-4 w-[1px] bg-gray-800" />

                {/* User Profile Info */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs font-medium text-white max-w-[150px] truncate">
                            {user?.displayName || 'Usuario'}
                        </p>
                        <p className="text-[10px] text-gray-500 max-w-[150px] truncate">
                            {user?.email || 'admin@financeos.com'}
                        </p>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <UserIcon className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </header>
    )
}
