# Simulador de Fisica 2D

Aplicacion de escritorio/web para simular el movimiento de un movil sobre un terreno editable en 2D. El proyecto esta desarrollado con Bun, Tauri, SvelteKit y TypeScript, combinando una interfaz interactiva con un motor fisico propio, telemetria en tiempo real y herramientas de exportacion para analizar la relacion entre posicion, velocidad, aceleracion, friccion y pendiente.

El simulador esta pensado como una herramienta academica: permite construir un perfil de terreno, ubicar la posicion inicial del movil, ajustar parametros fisicos y observar como evoluciona el sistema durante la simulacion.

## Funcionalidades principales

- Edicion visual del terreno por puntos y segmentos.
- Ajuste de friccion y angulo por seccion del terreno.
- Posicion inicial del movil editable por campos o arrastre en canvas.
- Parametros del movil: masa, fuerza impulsora, oscilacion, frecuencia, caida del impulso y resistencia.
- Simulacion con gravedad, contacto con terreno, pendiente, friccion, fuerza impulsora y limites laterales.
- Telemetria en tiempo real con posicion, velocidad, aceleracion y aceleracion neta.
- Graficos de series temporales con `uPlot`: distancia/tiempo, velocidad/tiempo y aceleracion/tiempo.
- Exportacion de telemetria a CSV y guardado/carga de simulaciones.
- Empaquetado con Tauri para uso como aplicacion de escritorio.

## Stack

- Bun
- Tauri 2
- SvelteKit 5
- TypeScript
- Tailwind CSS
- uPlot + uplot-svelte
- Zod para validacion de archivos de simulacion

## Requisitos

- Bun instalado.
- Dependencias instaladas con `bun install`.
- Para ejecutar como aplicacion Tauri, tambien se requiere el entorno Rust/Tauri configurado.

## Comandos

```bash
bun install
bun run dev
bun run check
bun run build
bun run tauri
```

## Estructura general

- `src/lib/engine`: motor fisico, terreno, integrador, colisiones y utilidades vectoriales.
- `src/lib/stores/simulation`: estado central de la simulacion, historial, edicion y reinicio del movil.
- `src/lib/components`: interfaz principal, canvas, panel de edicion, controles y telemetria.
- `src/lib/utils/canvas`: logica auxiliar de renderizado, coordenadas y particulas.
- `src/lib/utils/export`: exportacion de datos de simulacion y telemetria.

## Documentacion extendida

La explicacion detallada del funcionamiento, arquitectura y flujo de datos esta en:

[DOCUMENTACION_PROYECTO.md](./docs/PROJECT_DOCUMENTATION.md)
