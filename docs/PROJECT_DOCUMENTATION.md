# Documentacion del Proyecto

## Objetivo

El proyecto implementa un simulador de fisica 2D para estudiar el movimiento de un movil sobre un terreno editable. La aplicacion permite construir una pista por segmentos, configurar propiedades del movil y observar la evolucion fisica mediante telemetria y graficos.

La idea central es separar la experiencia interactiva de la logica fisica: la interfaz edita parametros y visualiza resultados, mientras que el motor calcula fuerzas, contacto con terreno, integracion temporal y estado del movil.

## Flujo de uso

1. Se define o modifica el terreno en el canvas.
2. Se ajustan las propiedades de los segmentos: friccion y angulo.
3. Se configura el movil: posicion inicial, masa y fuerza impulsora.
4. Se inicia la simulacion.
5. Durante la simulacion, la edicion queda bloqueada para conservar consistencia.
6. La simulacion termina al alcanzar un limite lateral o al finalizar manualmente.
7. La telemetria queda disponible para analisis y exportacion.

## Motor fisico

El motor vive en `src/lib/engine` y trabaja con tipos simples:

- `Vec2D`: vector bidimensional.
- `PointTerrain`: punto editable del terreno.
- `TerrainSegment`: tramo entre dos puntos, con angulo y friccion.
- `Vehicle`: estado fisico del movil.
- `SurfaceInfo`: informacion de contacto con el terreno.

El paso de simulacion se concentra en `fixedUpdate`, que ejecuta:

1. Calculo de aceleracion por fuerzas.
2. Integracion semi-implicita de Euler.
3. Resolucion de contacto con el terreno.
4. Alineacion del movil con la superficie.
5. Aplicacion de resistencia/friccion en suelo.

## Fuerzas y movimiento

La fuerza impulsora puede actuar incluso sin traccion contra el piso, lo que modela un comportamiento tipo propulsor. Cuando existe contacto con el suelo, la friccion del segmento tambien participa en el limite de traccion.

Parametros relevantes:

- `gravity`: gravedad escalada al sistema de pixeles.
- `propulsionForce`: fuerza impulsora base.
- `propulsionOscillation`: amplitud de la variacion periodica.
- `propulsionFrequencyHz`: frecuencia de oscilacion.
- `propulsionDropFactor`: factor que reduce el impulso con la velocidad.
- `drag`: resistencia proporcional a la velocidad.
- `fixedDt`: paso fijo de simulacion.

La aceleracion neta mostrada en telemetria responde a:

```text
a_neta = F_neta / m
```

## Terreno

El terreno se define como una lista ordenada de puntos. A partir de esos puntos se generan segmentos con:

- inicio y fin,
- angulo,
- coeficiente de friccion.

Las herramientas permiten:

- mover puntos,
- agregar o borrar puntos internos,
- editar friccion por segmento,
- introducir angulo manual de un segmento,
- elevar, bajar o suavizar zonas del terreno.

Los puntos extremos se comportan como limites del terreno: pueden moverse verticalmente, pero no se eliminan ni rompen el rango horizontal establecido.

## Canvas e interaccion

El canvas renderiza:

- terreno,
- movil,
- ruedas,
- particulas visuales,
- reglas externas,
- marcador de posicion inicial,
- etiquetas de angulo por segmento.

La logica auxiliar de canvas se separa en `src/lib/utils/canvas`, para evitar que el componente visual concentre transformaciones, calculos de coordenadas y renderizado complejo.

Durante `sim.isPlaying`, la edicion se bloquea desde tres capas:

- eventos del canvas,
- controles visuales,
- metodos del store.

Esto evita cambios de terreno o parametros mientras existe una corrida activa.

## Estado de simulacion

El estado principal vive en `src/lib/stores/simulation`.

Responsabilidades principales:

- mantener `vehicle`, `terrainPoints`, `segments`, `config` e `history`,
- reiniciar el movil al estado inicial,
- avanzar la simulacion por pasos fijos,
- finalizar la corrida,
- scrubbing de tiempo con historial,
- exportar/cargar datos de simulacion.

Estados importantes:

- `isPlaying`: la simulacion esta corriendo.
- `isFinished`: la corrida termino.
- `time`: tiempo actual.
- `maxTime`: rango visible de la barra de tiempo.
- `configuredMaxTime`: duracion base antes de que la simulacion pueda extenderse.

Cuando la simulacion termina, `maxTime` queda fijado al tiempo final alcanzado. Si el movil sigue corriendo mas alla del tiempo base, la barra se expande dinamicamente.

## Telemetria

La telemetria muestra:

- posicion `x, y`,
- velocidad por componentes y magnitud,
- aceleracion por componentes y aceleracion neta,
- pendiente y friccion del contacto actual,
- estado de simulacion: activa, pausada o terminada.

Las graficas de serie usan `uPlot` mediante `uplot-svelte`. Los modos disponibles son:

- distancia / tiempo,
- velocidad / tiempo,
- aceleracion / tiempo.

Los datos se toman desde `sim.history`, que almacena frames con tiempo y estado del vehiculo.

## Exportacion

El proyecto soporta dos tipos de salida:

- CSV de telemetria desde `src/lib/utils/export/csv.ts`.
- Archivo `.sim` con configuracion, terreno, historial y estado desde `src/lib/utils/export/simulation.ts`.

La exportacion `.sim` se valida con Zod antes de cargarse, lo que reduce errores por archivos incompletos o con estructura incompatible.

## Componentes principales

- `Header.svelte`: encabezado y estado global.
- `Toolbar.svelte`: herramientas de edicion.
- `Canvas/Canvas.svelte`: superficie de simulacion.
- `Canvas/ZoomControl.svelte`: control de zoom del canvas.
- `EditorPanel/EditorPanel.svelte`: parametros editables.
- `Controls.svelte`: play, reset, finalizar y timeline.
- `Stats/Stats.svelte`: contenedor de telemetria.
- `SeriesUPlot.svelte`: grafico de series temporales.

## Consideraciones tecnicas

- El motor usa un paso fijo para mantener estabilidad.
- El canvas usa escala en pixeles, con conversion a metros para telemetria.
- La edicion reinicia la simulacion para evitar inconsistencias entre terreno, historial y estado del movil.
- La simulacion se detiene automaticamente al tocar limites laterales.
- La barra de tiempo diferencia pausa y finalizacion: pausar no define el tiempo final; finalizar si.

## Posibles extensiones

- Exportar imagen o datos directamente desde graficos uPlot.
- Agregar comparacion de multiples corridas.
- Permitir presets de materiales con friccion y color.
- Agregar guardado automatico de configuracion de UI.
- Incluir pruebas unitarias para fuerzas, colisiones y conversiones de telemetria.
