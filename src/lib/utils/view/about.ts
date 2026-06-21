import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const windowName = "about";

export async function openAboutWindow(theme: "dark" | "light") {
  const existWindow = await WebviewWindow.getByLabel(windowName);

  if (existWindow) {
    await existWindow.setFocus();
    return existWindow;
  }

  const window = new WebviewWindow(windowName, {
    title: "Acerca de TerraSim 2D",
    url: `/view/about?theme=${theme}`,
    width: 560,
    height: 520,
    resizable: false,
  });

  return window;
}
