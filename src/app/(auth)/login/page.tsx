'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import type { AuthError } from '@supabase/supabase-js'
import { DollarSign, Loader2, Lock, Mail } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [serverError, setServerError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)
        setServerError('')

        try {
            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H5_login_submit_started',
                            location: 'src/app/(auth)/login/page.tsx:onSubmit',
                            message: 'login submit started',
                            data: { hasEmail: !!data.email },
                            timestamp: 0,
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion

            await AuthService.login(data.email, data.password)

            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H5_login_success_before_router',
                            location: 'src/app/(auth)/login/page.tsx:onSubmit',
                            message: 'AuthService.login succeeded; routing to /dashboard',
                            data: {},
                            timestamp: 0,
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion
            router.replace('/dashboard')
        } catch (err) {
            const message = AuthService.getErrorMessage(err as AuthError)
            setServerError(message)

            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H5_login_error_caught',
                            location: 'src/app/(auth)/login/page.tsx:onSubmit-catch',
                            message: 'login failed; showing serverError',
                            data: {
                                errorCode: (err as AuthError)?.code ?? 'unknown',
                                errorMessageLength: message.length,
                            },
                            timestamp: 0,
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl mb-4">
                        <DollarSign className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">FinanceOS</h1>
                    <p className="text-gray-500 text-sm mt-1">Acceso privado</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Error del servidor */}
                    {serverError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            <p className="text-red-400 text-sm">{serverError}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-700 mt-6">
                    Sistema privado — Solo acceso autorizado
                </p>
            </div>
        </div>
    )
}