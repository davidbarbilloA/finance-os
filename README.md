# FinanceOS

Plataforma privada de finanzas personales. Permite registrar ingresos, gastos, ahorros y deudas, organizarlos en bolsillos y visualizar métricas en un dashboard con gráficos.

## Características

- **Dashboard** — resumen mensual, gráficos de actividad, distribución de gastos y bolsillos de ahorro
- **Movimientos** — libro de transacciones con filtros por tipo, categoría y bolsillo
- **Estadísticas** — tendencias, ranking por categoría, métodos de pago e insights del mes
- **Bolsillos** — metas de ahorro con progreso visual
- **Autenticación** — acceso restringido a un usuario administrador (Supabase Auth)
- **Responsive** — navegación tipo drawer en móvil y layout adaptado a pantallas pequeñas

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| Gráficos | Recharts |
| Backend | [Supabase](https://supabase.com) (Auth + PostgreSQL) |
| Formularios | React Hook Form, Zod |
| Fechas | date-fns |
| Deploy | Vercel |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/       # Pantalla de inicio de sesión
│   ├── (private)/          # Rutas protegidas
│   │   ├── dashboard/
│   │   ├── movimientos/
│   │   └── estadisticas/
│   ├── layout.tsx          # Layout raíz
│   └── page.tsx            # Redirige a /dashboard
├── components/layout/      # Sidebar, Header, PrivateShell, PrivateGuard
├── context/                # AuthContext
├── hooks/                  # useMovimientos, useBolsillos
├── lib/supabase/           # Cliente, servidor y middleware
├── services/               # auth, movimientos, bolsillos
└── types/                  # Tipos TypeScript del dominio
```

## Requisitos previos

- Node.js 20+
- npm (o pnpm / yarn)
- Proyecto en [Supabase](https://supabase.com) con tablas `movimientos` y `bolsillos`
- Usuario creado en Supabase Auth

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_USER_ID=uuid-del-usuario-admin
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `NEXT_PUBLIC_ADMIN_USER_ID` | UUID del único usuario autorizado a iniciar sesión |

> Solo el usuario cuyo ID coincida con `NEXT_PUBLIC_ADMIN_USER_ID` puede acceder a la aplicación.

## Instalación y desarrollo

```bash
# Clonar e instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/dashboard`; si no hay sesión, el guard te llevará a `/login`.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Base de datos (Supabase)

La app espera al menos estas tablas en PostgreSQL:

### `movimientos`

Campos principales: `id`, `titulo`, `descripcion`, `monto`, `tipo`, `categoria`, `metodo_pago`, `bolsillo`, `fecha`, `user_id`, `created_at`, `updated_at`.

Tipos de movimiento: `ingreso`, `gasto`, `ahorro`, `deuda`.

### `bolsillos`

Campos principales: `id`, `nombre`, `color`, `monto_objetivo`, `user_id`, `created_at`.

Configura **Row Level Security (RLS)** para que cada usuario solo acceda a sus propios registros.

## Despliegue en Vercel

1. Conecta el repositorio en [Vercel](https://vercel.com).
2. Añade las tres variables de entorno en **Project Settings → Environment Variables**.
3. Despliega:

```bash
npx vercel --prod
```

**Nota:** No incluyas paquetes específicos de plataforma (por ejemplo `@tailwindcss/oxide-win32-x64-msvc`) en `dependencies`. Tailwind instala el binario correcto según el SO del servidor.

## Diseño responsive

- **Desktop (`lg+`):** sidebar fijo a la izquierda
- **Móvil / tablet:** sidebar oculto; menú hamburguesa abre un drawer con overlay
- Modales, formularios y gráficos adaptados a pantallas pequeñas

## Licencia

Proyecto privado — David Barbillo 2026
