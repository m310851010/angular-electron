import * as pkg from './package.json';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
export function dialog(option: DialogOption) {
  const win = new BrowserWindow(option);
}

export interface DialogOption extends BrowserWindowConstructorOptions {

}
