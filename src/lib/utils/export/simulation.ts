import z from "zod";
import { save as saveDialog, open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile, writeTextFile } from "@tauri-apps/plugin-fs";

const vec2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const pointTerrainSchema = z.object({
  x: z.number(),
  y: z.number(),
  friction: z.number().optional(),
});

const vehicleSchema = z.object({
  position: vec2DSchema,
  velocity: vec2DSchema,
  acceleration: vec2DSchema,
  mass: z.number(),
  angle: z.number(),
  width: z.number(),
  height: z.number(),
});

const historyFrameSchema = z.object({
  time: z.number(),
  vehicle: vehicleSchema,
});

const configSchema = z.object({
  gravity: z.number(),
  maxDriveForce: z.number(),
  propulsionForce: z.number(),
  propulsionOscillation: z.number(),
  propulsionFrequencyHz: z.number(),
  propulsionDropFactor: z.number(),
  drag: z.number(),
  friction: z.number(),
  fixedDt: z.number(),
  snapDistance: z.number(),
});

const simulationDataSchema = z.object({
  settings: z.object({
    proyectName: z.string(),
  }),
  simulation: z.object({
    config: configSchema,
    terrainPoints: z.array(pointTerrainSchema),
    history: z.array(historyFrameSchema),
    initialVehicleState: vehicleSchema,
    vehicle: vehicleSchema,
    time: z.number(),
    maxTime: z.number(),
  }),
});

export const simulationExportSchema = z.object({
  version: z.enum(["1"]),
  data: simulationDataSchema,
});

export const DEFAULT_VERSION = "1";

export type SimulationExport = z.infer<typeof simulationExportSchema>;

export async function exportSimulation(
  projectName: string,
  data: SimulationExport,
): Promise<boolean> {
  try {
    const json = JSON.stringify(data);
    const path = await saveDialog({
      filters: [{ name: "sim", extensions: ["sim"] }],
      defaultPath: `${projectName.replace(/\s+/g, "_")}.sim`,
    });

    if (!path) return false;

    await writeTextFile(path, json);
    return true;
  } catch (error) {
    console.error("Failed to export simulation:", error);
    return false;
  }
}

export async function importSimulation(): Promise<SimulationExport | null> {
  try {
    const path = await openDialog({
      filters: [{ name: "sim", extensions: ["sim"] }],
    });

    if (!path) return null;

    const file = await openFile(path);

    const stat = await file.stat();
    const buf = new Uint8Array(stat.size);
    await file.read(buf);
    const textContents = new TextDecoder().decode(buf);
    await file.close();

    const json = JSON.parse(textContents);
    const result = simulationExportSchema.safeParse(json);

    if (!result.success) {
      console.error("Invalid simulation data:", result.error);
      return null;
    }

    return result.data satisfies SimulationExport;
  } catch (error) {
    console.error("Failed to import simulation:", error);
    return null;
  }
}
