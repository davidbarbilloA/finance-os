import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Paleta custom para el proyecto
                finance: {
                    income: '#10b981',   // emerald-500
                    expense: '#ef4444',  // red-500
                    saving: '#3b82f6',   // blue-500
                    debt: '#f59e0b',     // amber-500
                }
            }
        }
    },
    plugins: [],
}

export default config