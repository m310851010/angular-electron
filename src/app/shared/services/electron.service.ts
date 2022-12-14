import { Injectable } from '@angular/core';

// If you import a module but never use NzSafeAny of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {
  IpcRenderer,
  WebFrame,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  OpenDialogOptions,
  OpenDialogReturnValue,
  Dialog,
  SaveDialogOptions,
  SaveDialogReturnValue,
  MessageBoxOptions,
  MessageBoxReturnValue,
  IpcRendererEvent
} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

function randomId(prefix: string) {
  return prefix + ':' + Date.now() + '-' + Math.random();
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: IpcRenderer;
  webFrame: WebFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.fs = window.require('fs');

      this.childProcess = window.require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    } else {
      // mock ipcRenderer
      const noop = () => new Promise((s, f) => {});
      const noopVoid = () => ({} as IpcRenderer);
      // @ts-ignore
      this.ipcRenderer = {
        invoke: noop,
        on: noopVoid,
        send: noop,
        sendSync: noop,
        sendTo: noop,
        sendToHost: noop,
        once: noopVoid
      };
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  /**
   * ???????????????
   *
   * @param option
   * @return ??????Id
   */
  openWindow(option?: DialogOption): number {
    return this.ipcRenderer.sendSync('mdc.openWindow', option);
  }

  /**
   * ??????????????????id
   */
  getWinId(): number {
    return this.ipcRenderer.sendSync('mdc.currentWinId');
  }

  /**
   * ??????????????????
   *
   * @param arg
   */
  invokeBrowserWindow<T = NzSafeAny>(arg: keyof BrowserWindow | EventBrowserWindow): T {
    return this.ipcRenderer.sendSync('mdc.invokeBrowserWindow', typeof arg === 'string' ? { name: arg } : arg);
  }

  /**
   * ??????????????????
   *
   * @param eventName ????????????
   * @param listener
   */
  onBrowserWindow(eventName: string, listener: (event, ...args) => void): void;

  /**
   * ??????????????????
   *
   * @param option
   */
  onBrowserWindow(option: OnBrowserWindow): void;

  /**
   * ??????????????????
   *
   * @param option
   * @param listener
   */
  onBrowserWindow(option: string | OnBrowserWindow, listener?: (event, ...args) => void): void {
    const args = typeof option === 'string' ? { on: option } : { on: option.event, winId: option.winId };
    this.send({ channel: 'mdc.onBrowserWindow', callback: listener, args });
  }

  /**
   * ???????????????
   *
   * @param option OpenDialogOptions
   */
  showOpenDialog(option: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return this.invokeDialog<OpenDialogReturnValue>('showOpenDialog', true, option);
  }

  /**
   * ???????????????????????????
   *
   * @param option OpenDialogOptions
   */
  showSaveDialog(option: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    return this.invokeDialog<SaveDialogReturnValue>('showSaveDialog', true, option);
  }

  /**
   * ?????????????????????
   *
   * @param option OpenDialogOptions type?????????????????????, ????????? none/info/error/question/warning
   */
  showMessageBox(option: MessageBoxOptions): Promise<MessageBoxReturnValue> {
    // ????????????windows??????
    return this.invokeDialog<MessageBoxReturnValue>('showMessageBox', true, { noLink: true, cancelId: 2, ...option });
  }

  /**
   * ???????????????????????????
   * @param content ??????
   * @param title ?????? ???????????? "??????"
   */
  showErrorBox(content: string, title: string = '??????'): Promise<void> {
    return this.invokeDialog<void>('showErrorBox', false, title, content);
  }

  /**
   * ?????????????????????
   *
   * @param fnName ????????????
   * @param hasParent ?????????parent??????
   * @param option ????????????
   */
  invokeDialog<T>(fnName: keyof Dialog, hasParent: boolean, ...option: NzSafeAny[]): Promise<T> {
    return this.ipcRenderer.invoke('mdc.invokeDialog', fnName, hasParent, ...option);
  }

  /**
   * ????????????, ?????????????????????????????????
   * @param option ??????
   */
  send<T>(option: SendOptions): void {
    const channelId = randomId(option.channel);
    this.ipcRenderer.on(channelId, option.callback);
    this.ipcRenderer.send(
      option.channel,
      channelId,
      ...(Array.isArray(option.args) ? option.args : option.args === undefined ? [] : [option.args])
    );
  }
}

/**
 * BrowserWindow????????????
 */
export interface EventBrowserWindow {
  /**
   * ??????id
   */
  winId?: number;
  /**
   * ????????????
   */
  name: keyof BrowserWindow;
  /**
   * ?????????????????????, ?????????value
   */
  value?: NzSafeAny;
  /**
   * ????????????????????????args??????
   */
  args?: NzSafeAny[];
}

export interface DialogOption extends BrowserWindowConstructorOptions {
  /**
   * url??????
   */
  url?: string;
  /**
   * ????????????
   */
  file?: string;
}

export interface OnBrowserWindow {
  /**
   * ????????????
   */
  event: string;
  /**
   * ?????????
   * @param event
   * @param args
   */
  listener: (event, ...args) => void;
  /**
   * ??????ID
   */
  winId?: number;
}

/**
 * ?????????????????????
 */
export interface SendOptions {
  /**
   * ??????ID
   */
  channel: string;
  /**
   * ????????????
   * @param event
   * @param result
   */
  callback: (event: IpcRendererEvent, ...result: NzSafeAny[]) => void;
  /**
   * ???????????????
   */
  args?: NzSafeAny | NzSafeAny[];
}
