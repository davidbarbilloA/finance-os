'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

type MobileNavContextValue = {
    mobileNavOpen: boolean
    openMobileNav: () => void
    closeMobileNav: () => void
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null)

export function useMobileNav() {
    const ctx = useContext(MobileNavContext)
    if (!ctx) throw new Error('useMobileNav must be used within PrivateShell')
    return ctx
}

export function PrivateShell({ children }: { children: React.ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
    const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

    return (
        <MobileNavContext.Provider value={{ mobileNavOpen, openMobileNav, closeMobileNav }}>
            <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </MobileNavContext.Provider>
    )
}
