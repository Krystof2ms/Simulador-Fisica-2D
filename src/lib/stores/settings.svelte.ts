class SettingsStore {
  private _proyectName: string = "Simulación de Terreno 01";

  get proyectName() {
    return this._proyectName;
  }

  set proyectName(value: string) {
    this._proyectName = value;
  }
}

export const settingsStore = new SettingsStore();
