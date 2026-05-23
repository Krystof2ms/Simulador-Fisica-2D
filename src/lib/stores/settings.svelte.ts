export type Theme = "dark" | "light";

class SettingsStore {
  private _proyectName: string = "Simulación de Terreno 01";
  private _theme: Theme = "dark";

  get proyectName() {
    return this._proyectName;
  }

  set proyectName(value: string) {
    this._proyectName = value;
  }

  get theme() {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;
  }
}

export const settingsStore = new SettingsStore();
