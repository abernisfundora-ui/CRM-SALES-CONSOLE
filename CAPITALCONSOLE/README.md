# Capital Console (Base)

Inicialización profesional de una app fintech **mobile-first** con:

- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- Zustand
- Recharts

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Estructura sugerida

```text
app/              # Rutas App Router y layout base
components/ui/    # Componentes reutilizables globales
lib/              # Utilidades y configuración compartida
store/            # Estado global (Zustand)
types/            # Tipos globales
data/             # Datos mock/fixtures
features/         # Módulos de producto por dominio
```

## Convención de componentes reutilizables

- `PascalCase.tsx` por componente.
- `Props` tipadas explícitamente.
- Componentes presentacionales en `components/ui`.
- Composición de pantallas en `features/*/screens`.

## Design system base (visual)

- Tokens globales en `styles/globals.css` (`--module-*`, radius, shadow, blur, estados).
- Mapeos reutilizables en `lib/design-tokens.ts`.
- Componentes base: `ScreenContainer`, `SectionTitle`, `AppCard`, `Pill`, `StatCard`, `IconPlaceholder`, `ModuleAccent`.

## Persistencia local (Zustand)

`useCapitalStore` persiste en `localStorage` solo las fuentes base:

- `assets`
- `liabilities`
- `manualIncomes`
- `manualExpenses`
- `manualEvents`
- `goals`

Los campos derivados (`incomes`, `expenses`) **no se persisten** para evitar duplicados y se reconstruyen al hidratar desde las fuentes base.
