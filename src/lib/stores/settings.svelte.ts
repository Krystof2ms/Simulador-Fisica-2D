export type Theme = "dark" | "light";

export type Settings = {
  proyectName: string;
};

class SettingsStore {
  private _proyectName = $state("Simulación de Terreno 01");
  private _theme = $state<Theme>("dark");

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

  exportSettings(): Settings {
    return {
      proyectName: this._proyectName,
    };
  }

  importSettings(settings: Settings) {
    this._proyectName = settings.proyectName;
  }
}

export const settingsStore = new SettingsStore();
