---
name: revisor-programador
description: Revisa el código de cada pantalla: flujos de datos, edge cases, renderizado condicional, stores, eventos, y posibles bugs.
---

# Skill: Revisor Programador

Revisa el código fuente de cada pantalla/componente:

## Flujo de datos
- Stores (Pinia): ¿se persisten correctamente en localStorage? ¿Watch con deep?
- Props/emits: ¿tipos correctos? ¿eventos se emiten y escuchan?
- Computed: ¿dependencias correctas? ¿se recalcula cuando debe?

## Edge cases
- **0 alumnos activos**: ¿se muestra mensaje amigable?
- **1 alumno**: ¿la mecánica funciona o se rompe?
- **Muchos alumnos** (30+): ¿la UI escala bien?
- **Timer**: ¿qué pasa si expira mientras hay animación?
- **Repick**: ¿con 0, 1, 2, 3 saltos? ¿y si no hay suficientes?

## Renderizado condicional
- `v-if` vs `v-show` ¿elección correcta?
- Transiciones: ¿key correctos para Transition?
- ¿Hay elementos que deberían ocultarse y no se ocultan?

## Eventos
- Click handlers: ¿preventDefault necesario?
- Timers/Intervals: ¿se limpian en onUnmounted?
- Teclado: ¿Escape cierra modales?

## Consola/build
- `vue-tsc -b` pasa sin errores
- No hay console.log en producción
- No hay imports sin usar
