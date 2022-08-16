import * as pkg from './package.json';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

/**
 * 打开对话框
 * @param option
 */
export function dialog(option: DialogOption): BrowserWindow {
  const defaultOption: DialogOption = {
    width: 800,
    height: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
      allowRunningInsecureContent: false,
      contextIsolation: false // false if you want to run e2e test with Spectron
    }
  };
  const win = new BrowserWindow(option);
  return win;
}

export interface DialogOption extends BrowserWindowConstructorOptions {

}
