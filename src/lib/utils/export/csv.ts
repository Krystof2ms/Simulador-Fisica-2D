import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export interface ExportOptions {
  distance: boolean;
  velocity: boolean;
  acceleration: boolean;
  friction: boolean;
}

export async function exportToCSV(history: any[], options: ExportOptions, projectName: string) {
  if (history.length === 0) return;

  const headers = ['Tiempo (s)'];
  if (options.distance) headers.push('Posicion_X (m)', 'Posicion_Y (m)', 'Distancia_Recorrida (m)');
  if (options.velocity) headers.push('Velocidad_X (m/s)', 'Velocidad_Y (m/s)', 'Velocidad_Total (m/s)');
  if (options.acceleration) headers.push('Aceleracion_X (m/s²)', 'Aceleracion_Y (m/s²)', 'Aceleracion_Total (m/s²)');
  if (options.friction) headers.push('Friccion_Superficie', 'Angulo_Pendiente (°)');

  const SCALE = 30;
  const x0 = history[0].vehicle.position.x;

  const rows = history.map((h) => {
    const row = [h.time.toFixed(4)];

    if (options.distance) {
      const dx = (h.vehicle.position.x / SCALE).toFixed(4);
      const dy = ((760 - h.vehicle.position.y) / SCALE).toFixed(4);
      const dist = ((h.vehicle.position.x - x0) / SCALE).toFixed(4);
      row.push(dx, dy, dist);
    }

    if (options.velocity) {
      const vx = (h.vehicle.velocity.x / SCALE).toFixed(4);
      const vy = (-h.vehicle.velocity.y / SCALE).toFixed(4);
      const vTotal = (Math.hypot(h.vehicle.velocity.x, h.vehicle.velocity.y) / SCALE).toFixed(4);
      row.push(vx, vy, vTotal);
    }

    if (options.acceleration) {
      const ax = (h.vehicle.acceleration.x / SCALE).toFixed(4);
      const ay = (-h.vehicle.acceleration.y / SCALE).toFixed(4);
      const aTotal = (Math.hypot(h.vehicle.acceleration.x, h.vehicle.acceleration.y) / SCALE).toFixed(4);
      row.push(ax, ay, aTotal);
    }

    if (options.friction) {
      const friction = h.vehicle.groundedSurface ? h.vehicle.groundedSurface.segment.friction.toFixed(4) : '0';
      const angle = h.vehicle.groundedSurface ? (h.vehicle.groundedSurface.angle * 180 / Math.PI).toFixed(2) : '0';
      row.push(friction, angle);
    }

    return row.join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  try {
    const filePath = await save({
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      defaultPath: `${projectName.replace(/\s+/g, '_')}_telemetria.csv`
    });

    if (filePath) {
      await writeTextFile(filePath, csvContent);
      return true;
    }
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    throw error;
  }

  return false;
}
