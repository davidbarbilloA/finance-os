# FinanceOS – Plataforma de finanzas personales

Plataforma privada para registrar ingresos, gastos, ahorros y deudas, organizarlos en bolsillos y visualizar métricas en un dashboard con gráficos interactivos. Acceso restringido a un único usuario administrador mediante Supabase Auth.

## Tech stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| **UI / Gráficos** | Lucide Icons, Recharts, Framer Motion, React Hot Toast |
| **Backend / DB** | Supabase (Auth + PostgreSQL) |
| **Formularios** | React Hook Form, Zod |
| **Fechas** | date-fns |
| **Deploy** | Vercel |

## Estructura del proyecto

```text
src/
├── app/
│   ├── (auth)/login/           # Pantalla de inicio de sesión
│   ├── (private)/              # Rutas protegidas
│   │   ├── dashboard/
│   │   ├── movimientos/
│   │   └── estadisticas/
│   ├── layout.tsx              # Layout raíz
│   └── page.tsx                # Redirige a /dashboard
├── components/layout/          # Sidebar, Header, PrivateShell, PrivateGuard
├── context/                    # AuthContext
├── hooks/                      # useMovimientos, useBolsillos
├── lib/supabase/               # Cliente, servidor y middleware
├── services/                   # auth, movimientos, bolsillos
├── types/                      # Tipos TypeScript del dominio
└── proxy.ts                    # Protege las rutas privadas y actualiza la sesión de Supabase
```

## Funcionalidades

- **Autenticación** con Supabase Auth — acceso restringido a un único usuario administrador
- **Dashboard** — resumen mensual, gráficos de actividad, distribución de gastos y bolsillos de ahorro
- **Movimientos** — libro de transacciones con filtros por tipo, categoría y bolsillo
- **Estadísticas** — tendencias, ranking por categoría, métodos de pago e insights del mes
- **Bolsillos** — metas de ahorro con progreso visual; si Supabase no responde, se guardan en `localStorage`
- **Responsive** — drawer en móvil, sidebar fijo en desktop

## Sistema de acceso

| Rol | Permisos | Acceso |
|-----|----------|--------|
| **ADMIN** | Total — registrar movimientos, gestionar bolsillos, ver métricas | Solo el usuario cuyo UUID coincida con `NEXT_PUBLIC_ADMIN_USER_ID` |

> Activa Row Level Security (RLS) en Supabase para que cada usuario solo acceda a sus propios registros. Las políticas no están versionadas en este repositorio.

## Rutas del frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Inicio de sesión |
| `/dashboard` | Autenticado | Resumen mensual y gráficos |
| `/movimientos` | Autenticado | Libro de transacciones |
| `/estadisticas` | Autenticado | Tendencias e insights |

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/davidbarbilloA/finance-os.git
cd finance-os
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_USER_ID=uuid-del-usuario-admin
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `NEXT_PUBLIC_ADMIN_USER_ID` | UUID del único usuario autorizado |

### 3. Instalar dependencias y levantar el servidor

**Requisitos:** Node.js 20+

```bash
npm install
npm run dev
```

App disponible en: `http://localhost:3000`

La raíz redirige a `/dashboard`; si no hay sesión activa, el guard redirige a `/login`.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Modelo de datos (Supabase / PostgreSQL)

El esquema no está versionado en este repositorio: crea estas tablas en tu proyecto de Supabase.
Tablas principales:

- `movimientos`
- `bolsillos`

Relaciones:

```text
User 1 ── * Movimiento
User 1 ── * Bolsillo
```

### `movimientos`

Campos principales: `id`, `titulo`, `descripcion`, `monto`, `tipo`, `categoria`, `metodo_pago`, `bolsillo`, `fecha`, `user_id`, `created_at`, `updated_at`.

Tipos: `ingreso`, `gasto`, `ahorro`, `deuda`.

### `bolsillos`

Campos principales: `id`, `nombre`, `color`, `monto_objetivo`, `user_id`, `created_at`.

## Build de producción

```bash
npm run build
npm run start
```

### Deploy en Vercel

1. Conecta el repositorio en [Vercel](https://vercel.com).
2. Añade las tres variables de entorno en **Project Settings → Environment Variables**.
3. Despliega:

```bash
npx vercel --prod
```

> **Nota:** No incluyas paquetes específicos de plataforma (p. ej. `@tailwindcss/oxide-win32-x64-msvc`) en `dependencies`. Tailwind instala el binario correcto según el SO del servidor de build.

## Autor

- [@davidbarbilloA](https://github.com/davidbarbilloA)
