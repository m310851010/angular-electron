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
    const args = typeof option === 'string' ? { on: option } : { on: option.event, winId: option.winId };
    this.send({ channel: 'mdc.onBrowserWindow', callback: listener, args });
  }

  /**
   * 打开对话框
   *
   * @param option OpenDialogOptions
   */
  showOpenDialog(option: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return this.invokeDialog<OpenDialogReturnValue>('showOpenDialog', true, option);
  }

  /**
   * 打开保存文件对话框
   *
   * @param option OpenDialogOptions
   */
  showSaveDialog(option: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    return this.invokeDialog<SaveDialogReturnValue>('showSaveDialog', true, option);
  }

  /**
   * 显示消息对话框
   *
   * @param option OpenDialogOptions type为系统默认图标, 取值有 none/info/error/question/warning
   */
  showMessageBox(option: MessageBoxOptions): Promise<MessageBoxReturnValue> {
    // 默认使用windows样式
    return this.invokeDialog<MessageBoxReturnValue>('showMessageBox', true, { noLink: true, cancelId: 2, ...option });
  }

  /**
   * 显示错误消息对话框
   * @param content 内容
   * @param title 标题 默认显示 "信息"
   */
  showErrorBox(content: string, title: string = '信息'): Promise<void> {
    return this.invokeDialog<void>('showErrorBox', false, title, content);
  }

  /**
   * 调用对话框方法
   *
   * @param fnName 函数名称
   * @param hasParent 是否有parent参数
   * @param option 函数参数
   */
  invokeDialog<T>(fnName: keyof Dialog, hasParent: boolean, ...option: NzSafeAny[]): Promise<T> {
    return this.ipcRenderer.invoke('mdc.invokeDialog', fnName, hasParent, ...option);
  }

  /**
   * 发送消息, 可通过回调函数获取结果
   * @param option 配置
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
  value?: NzSafeAny;
  /**
   * 如果是函数请传入args参数
   */
  args?: NzSafeAny[];
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

/**
 * 发送消息的配置
 */
export interface SendOptions {
  /**
   * 频道ID
   */
  channel: string;
  /**
   * 回调函数
   * @param event
   * @param result
   */
  callback: (event: IpcRendererEvent, ...result: NzSafeAny[]) => void;
  /**
   * 发送的参数
   */
  args?: NzSafeAny | NzSafeAny[];
}
