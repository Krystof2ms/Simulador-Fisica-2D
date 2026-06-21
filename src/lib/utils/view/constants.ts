export const EVENTS = {
  THEME_SELECTED_CHANGE: "theme-selected-change",
  MAIN_CLOSE: "main-close",
}

export type ThemeEvent = {
  theme: "dark" | "light";
}

export type MainCloseEvent = {
  closed: boolean;
}
