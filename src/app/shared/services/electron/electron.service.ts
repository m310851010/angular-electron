import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {
  IpcRenderer,
  WebFrame,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  OpenDialogOptions,
  OpenDialogReturnValue
} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

function randomId() {
  return Date.now() + '-' + Math.random() + '-' + Math.random();
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
      console.log("window.require('electron')====");
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
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  /**
   * 打开新窗口
   *
   * @param option
   * @return 窗口Id
   */
  openWindow(option?: DialogOption): number {
    return this.ipcRenderer.sendSync('mdc.openWindow', option);
  }

  /**
   * 获取当前窗口id
   */
  getWinId(): number {
    return this.ipcRenderer.sendSync('mdc.currentWinId');
  }

  /**
   * 执行窗口方法
   *
   * @param arg
   */
  invokeBrowserWindow<T = NzSafeAny>(arg: keyof BrowserWindow | EventBrowserWindow): T {
    return this.ipcRenderer.sendSync('mdc.invokeBrowserWindow', typeof arg === 'string' ? { name: arg } : arg);
  }

  /**
   * 监听窗口消息
   *
   * @param eventName 事件名称
   * @param listener
   */
  onBrowserWindow(eventName: string, listener: (event, ...args) => void): void;

  /**
   * 监听窗口消息
   *
   * @param option
   */
  onBrowserWindow(option: OnBrowserWindow): void;

  /**
   * 监听窗口消息
   *
   * @param option
   * @param listener
   */
  onBrowserWindow(option: string | OnBrowserWindow, listener?: (event, ...args) => void): void {
    const channel = randomId();
    if (typeof option === 'string') {
      this.ipcRenderer.on(channel, listener);
      this.ipcRenderer.send('mdc.onBrowserWindow', channel, { on: option });
    } else {
      this.ipcRenderer.on(channel, option.listener);
      this.ipcRenderer.send('mdc.onBrowserWindow', channel, { on: option.event, winId: option.winId });
    }
  }

  /**
   * 打开对话框
   *
   * @param option
   */
  showOpenDialog(option: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return this.asyncSend<OpenDialogReturnValue>('mdc.showOpenDialog', option);
  }

  /**
   * 异步发送
   *
   * @param channel
   * @param args
   */
  asyncSend<T>(channel: string, ...args: NzSafeAny[]): Promise<T> {
    const channelId = randomId();
    return new Promise((resolve, reject) => {
      this.ipcRenderer.on(channelId, (event, { success, data }) => {
        if (success) {
          resolve(data);
        } else {
          reject(data);
        }
      });
      this.ipcRenderer.send(channel, channelId, ...args);
    });
  }
}

/**
 * BrowserWindow事件参数
 */
export interface EventBrowserWindow {
  /**
   * 窗口id
   */
  winId?: number;
  /**
   * 属性名称
   */
  name: keyof BrowserWindow;
  /**
   * 如果设置属性值, 请传入value
   */
  value?: any;
  /**
   * 如果是函数请传入args参数
   */
  args?: any[];
}

export interface DialogOption extends BrowserWindowConstructorOptions {
  /**
   * url地址
   */
  url?: string;
  /**
   * 文件地址
   */
  file?: string;
}

export interface OnBrowserWindow {
  /**
   * 事件名称
   */
  event: string;
  /**
   * 监听器
   * @param event
   * @param args
   */
  listener: (event, ...args) => void;
  /**
   * 窗口ID
   */
  winId?: number;
}
