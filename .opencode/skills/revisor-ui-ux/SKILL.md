---
name: revisor-ui-ux
description: Revisa el diseño visual, responsive (PC/tablet/móvil), modo oscuro, accesibilidad y coherencia visual de cada pantalla.
---

# Skill: Revisor UI/UX

Revisa cada pantalla en estos aspectos:

## Responsive — probar en 3 tamaños
- **PC** (≥1024px, ~1280px de ancho): aprovecha el espacio horizontal
- **Tablet** (~768px de ancho): grids y cards se adaptan, no scroll horizontal
- **Móvil estrecho** (~375px de ancho, iPhone SE): touch targets ≥44px, textos legibles, sin desbordes, menú hamburguesa visible

Para cada pantalla, simular los 3 anchos y verificar que no se rompe el layout, no hay solapamientos, y los elementos siguen siendo usables.

## Modo oscuro
- Contraste suficiente en fondos oscuros
- Clases `dark:` aplicadas correctamente
- No hay texto oscuro sobre fondo oscuro

## Accesibilidad
- Focus visible en todos los elementos interactivos
- `aria-label`, `role`, `aria-modal` en modales
- `prefers-reduced-motion` respetado
- Contraste de color suficiente (funciones getTextColor)
- Skip link presente

## Coherencia visual
- Mismos patrones de espaciado, bordes, sombras en toda la app
- Tipografía consistente (Outfit headings, texto normal)
- Animaciones suaves y con propósito
- Estados vacío y error tienen diseño cuidado (no rotos)

## Señalar
- Issues concretos con línea de código
- Priorizar: crítico > alto > medio > bajo
- Sugerir solución si es simple
