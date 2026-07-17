# Dinamiza Aula — Guía para asistentes IA

## Stack
- **Vue 3** + **TypeScript 6.0** + **Vite 8** + **Tailwind CSS 4**
- **Pinia** (estado + persistencia localStorage), **Vue Router** (hash history)
- **@vueuse/core**, **@heroicons/vue**, **vite-plugin-pwa** (Workbox auto-update)
- **Node 24** para build, **sharp** para generar PNGs de iconos

## Despliegue
- GitHub Pages: https://sergarb1.github.io/DinamizaAula/
- Base: `/DinamizaAula/` (configurado en `vite.config.ts`)
- Hash routing (`createWebHashHistory`)
- Workflow: `.github/workflows/deploy.yml` — push a master → build → deploy
- Usuario debe activar Pages en Settings > Pages > Source: "GitHub Actions"
- Dominio personalizado opcional en `CNAME`

## Marca e identidad
- Logo horizontal: `logo.png` (cabecera y README)
- Favicon: ruleta SVG con flecha hacia abajo en `public/favicon.svg`
- Iconos PWA (48–512px + apple-touch-icon) generados con `scripts/generate-icons.js` desde el favicon SVG
- favicon.ico, favicon-96x96.png también disponibles

## Estructura
```
src/
├── main.ts                    # Entry: createPinia + router + mount
├── App.vue                    # Root: AppHeader + router-view + AppFooter + InstallPrompt
├── style.css                  # @import "tailwindcss", fonts, safe areas, @custom-variant dark
│
├── router/index.ts            # 6 rutas hash + redirects para dinámicas legacy
├── i18n/                      # vue-i18n@11: locales ES/EN, persistencia localStorage
├── stores/
│   ├── students.ts            # CRUD alumnos, import/export JSON, groups, colors, active/inactive
│   ├── history.ts             # Participaciones: record, stats, clear, persist
│   ├── settings.ts            # sound, confetti, reducedMotion, dark mode (useColorMode), default mechanic/strategy
│   ├── challenges.ts          # Retos para la mecánica Desafío (sin límites de tiempo)
│   └── gamification.ts        # XP, streaks, 9 badges, level system
│
├── types/
│   ├── student.ts             # Student { id, name, surname, color, group, active }
│   ├── strategy.ts            # SelectionStrategy interface, StrategyResult, StrategySettings
│   └── history.ts             # Participation, StudentStats
│
├── strategies/                # 18 estrategias (ver sección abajo)
├── components/
│   ├── layout/                # AppHeader.vue (logo con rounded-lg), AppFooter.vue
│   ├── mechanics/             # 3 componentes custom: RouletteWheel, QuickPick, CardDeck
│   ├── shared/                # ConfettiEffect, InstallPrompt, GamificationBar, AchievementsModal, CelebrationPopup, ChallengeManager (modal CRUD retos)
│   ├── stats/                 # BarChart, DonutChart, TimelineChart (SVG con i18n)
│   └── settings/              # SelectionTimer
└── views/
    ├── Home.vue               # Dashboard + GamificationBar + AchievementsModal
    ├── Students.vue            # CRUD + import/export + grupos
    ├── Mechanics.vue           # Grid 8 dinámicas (3 cols, cards grandes)
    ├── MechanicDetail.vue     # Mecánica con estrategia + timer + celebración + cola auto-generada + equipos auto-generados
    ├── Statistics.vue          # Gráficos SVG + equidad + métricas + historial
    └── Settings.vue            # Config global + toggle gamificación + selector idioma
```

## Dinámicas (6)
1. **Ruleta** 🎡 — Canvas con sectores proporcionales adaptativos + físicas + sonido tick
2. **Sorteo rápido** 🎲 — Cicla nombres y revela el ganador con animación
3. **Cartas** 🎴 — Cada alumno tiene una carta oculta; pulsar para revelar y seleccionar
4. **Cola** 👥 — Genera cola ordenada automáticamente al entrar; botón "Siguiente"; botón "Re-sortear cola"
5. **Equipos** ⭐ — Genera grupos equilibrados con capitán
6. **Desafío** 🔥 — Selecciona alumno + reto aleatorio

## Estrategias de selección (18)
Todas en `src/strategies/`, registradas en `registry.ts`.
Categorías: random(4), fairness(7), adaptive(2), queue(2), teams(2), gamification(1).

| ID | Nombre | Categoría |
|----|--------|-----------|
| random | Aleatorio puro | random |
| weighted | Aleatorio compensado | fairness |
| fair | Justicia total | fairness |
| no-repeat | Nunca repetido | fairness |
| forgotten | Los olvidados | fairness |
| shy | El tímido | fairness |
| brave | El valiente | random |
| adaptive-roulette | Ruleta adaptativa | adaptive |
| chain | Cadena | queue |
| by-group | Equilibrio por grupos | fairness |
| hot-ball | Bola caliente | random |
| surprise | Efecto sorpresa | random |
| custom-mix | Mezcla personalizada | adaptive |
| tournament | Modo torneo | gamification |
| smart-queue | Cola inteligente | queue |
| balanced-teams | Equipos equilibrados | teams |
| captain | Capitán | teams |
| exam-mode | Modo examen | fairness |

## Arquitectura de estrategias
```ts
interface SelectionStrategy {
  id: string
  name: string
  description: string
  longDescription: string
  icon: string
  category: 'random' | 'fairness' | 'gamification' | 'teams' | 'queue' | 'adaptive'
  select(students: Student[], history: Participation[], settings?: StrategySettings): StrategyResult
}
```

`registry.ts` exporta: `getAllStrategies()`, `executeStrategy(id, students, history)`.
`utils.ts` exporta: `getAllStats()`, `pickRandomIndex(weights)`, `shuffleArray(arr)`.

## Dinámicas visuales (3)
Se mapean en `MechanicDetail.vue` via `mechanicConfig`. Cada una recibe `students` y emite `select`, `start`, `end`.
- RouletteWheel: Canvas + físicas + sectores proporcionales adaptativos + sonido tick + easing
- QuickPick: ciclado rápido de nombres con animación fade
- CardDeck: cartas ocultas, click para revelar (progressive reveal)

Las mecánicas sin componente personalizado usan UI genérica basada en estrategia con transiciones Vue.

## MechanicDetail — Funcionalidades clave
- **Estrategia seleccionable** si la mecánica no es custom
- **Estrategia seleccionable** si la mecánica no es custom
- **Timer** toggleable que auto-ejecuta la selección (duración configurable vía SelectionTimer)
- **Cola auto-generada** al entrar en la mecánica Cola; botón "Siguiente" avanza
- **Cola finalizada** muestra mensaje "✅ ¡Cola finalizada!" con opción de regenerar
- **Re-sortear cola** botón ↻ que regenera la cola aleatoriamente
- **Equipos auto-generados** al entrar en Equipos; tamaño configurable (2–8); botón "Sortear equipo" y "Reorganizar"
- **Celebración popup** con avatar + nombre + datos al seleccionar
- **Confetti** + sonido win al seleccionar
- **Transiciones** fade/slide-up entre estados
- **Gamificación** integrada (XP, estrellas, rachas)
- **Modo oscuro/claro** sincronizado con el sistema

## Estadísticas
- **6 métricas**: total, activos, participaciones, media, grupos, equidad
- **Gráfico de barras** SVG por alumno
- **Gráfico donut** SVG por grupos
- **Heatmap** SVG de actividad últimos 14 días
- **Índice Gini** con valoración automática
- **Historial** de últimas 30 participaciones con limpieza

## Gamificación
- **Estrellas** ⭐: 1 por participación
- **Rachas** 🔥: consecutivas, se reinician tras 1 día sin participar
- **XP + Niveles**: 10 XP por participación, 25 XP por insignia
- **9 insignias**: Primer paso (1), Novato (5), Activo (10), Constante (20), Dedicado (35), Experto (50), Maestro (75), Leyenda (100), Imparable (150)
- Toggle en Settings, barra de progreso en Home, modal de logros con ranking

## PWA
- `vite-plugin-pwa` con `registerType: 'autoUpdate'`
- Manifest con 9 iconos (48–512px), standalone, scope `/DinamizaAula/`
- Workbox precache + runtime caching Google Fonts (CacheFirst, 1 año)
- Componente `InstallPrompt.vue` con evento `beforeinstallprompt`
- apple-touch-icon + meta tags para iOS

## Privacidad
- Sin servidor, sin cookies, sin registro
- localStorage con claves `dinamiza-aula:*`
- Export/Import JSON completo
- Compatible RGPD / LOPDGDD

## Datos de ejemplo
3 clases en `src/utils/examples.ts`: 5º Primaria A (10), 4º Primaria B (8), 3º ESO B (8).
Los apellidos son inventados (Alumnez, Estudiantez, Aprendiz, etc.) para dejar claro que son datos de prueba.

## Comandos
```bash
npm install                  # instalar dependencias
npm run dev                  # servidor dev Vite
npm run build                # vue-tsc check + vite build → dist/
npm run preview              # servir dist/ localmente
npm run test                 # vitest (24 unit tests)
npx playwright test          # E2E tests (46 tests)
node scripts/generate-icons.js  # regenerar PWA icons desde favicon.svg
```

## Scripts de utilidad
- `scripts/generate-icons.js`: lee `public/favicon.svg`, escala con sharp, genera todos los PNGs para PWA (48–512px + apple-touch-icon). Ejecutar cada vez que se cambie el favicon.

## TypeScript
- `tsconfig.app.json` con `noUnusedLocals`, `noUnusedParameters`
- `vue-tsc -b` en build — no pasar errores TS
- `erasableSyntaxOnly: true`, `ignoreDeprecations: "6.0"`

## Sonidos
- `src/utils/sounds.ts`: Web Audio API
- `playTickSound()`: sine blip corto (para ruleta)
- `playWinSound()`: arpegio C-E-G ascendente (para selección)
- Controlados por `settings.soundEnabled`

## Workflow GitHub Actions
```yaml
# .github/workflows/deploy.yml
# push a master → npm ci → npm run build → upload dist → deploy-pages
```
Requisito: activar Pages > Source: "GitHub Actions".

## Accesibilidad
- **Skip link**: enlace "Saltar al contenido principal" como primer elemento del body
- **Focus-visible**: ring global `2px solid #6366f1` en todos los elementos interactivos
- **Focus trap + Escape** en CelebrationPopup y AchievementsModal (`role="dialog"`, `aria-modal`)
- **aria-live**: región `polite` que anuncia el alumno seleccionado
- **Contraste de color**: función `getTextColor()` en utils para texto legible sobre colores de alumno
- **Confetti**: respeta `prefers-reduced-motion: reduce`
- **Formulario**: `aria-invalid`, `maxlength`, mensaje de error inline

## Tests E2E (Playwright)
46 tests en `e2e/`:
- `navigation.spec.ts` — 6 rutas, nav links, mobile toggle
- `students.spec.ts` — CRUD, validación, import/export, ejemplos
- `mechanics.spec.ts` — 6 mecánicas verificadas + redirects legacy + ejecución + resultados
- `strategies.spec.ts` — idle state
- `statistics.spec.ts` — secciones, equity
- `settings.spec.ts` — toggles, dark mode, clear data, i18n locale switch
- `gamification.spec.ts` — sección home, modal logros
- `a11y.spec.ts` — skip link, focus, aria, alt text

## Notas importantes
- No renombrar `/DinamizaAula/` base path sin actualizar vite.config, router y deploy
- `students.ts` **no siembra datos ejemplo** — arranca vacío; el usuario carga plantilla manualmente
- Tailwind 4 usa `@import "tailwindcss"` (no `@tailwind` directives)
- Las clases `dark:` funcionan por class strategy (`@vueuse/core` `useDark`)
- El build falla si hay errores TS — `vue-tsc -b` es estricto
- AGPL v3 — ver `AGPL-3.0-or-later.txt`
- Logo en `logo.png` (horizontal) y en cabecera via `import.meta.env.BASE_URL`
- Íconos PWA y favicon deben regenerarse con `node scripts/generate-icons.js` si se cambia el diseño
- En mobile, el logo en cabecera es más pequeño (h-12) que en desktop (h-14)
- Logo tiene `rounded-lg` en la cabecera
- Proyecto web: https://mejoratudocencia.es
