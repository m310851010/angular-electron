import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, dialog, IpcMainEvent } from 'electron';
import { extend, isFunction } from './kit';
import * as path from 'path';

/**
 * 打开对话框
 * @param option
 */
export function openWindow(option?: OpenWindowOption): BrowserWindow {
  const defaultOption: OpenWindowOption = {
    width: 800,
    height: 500,
    frame: false,
    center: true,
    skipTaskbar: true, //不在任务栏显示
    modal: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
      contextIsolation: false, // false if you want to run e2e test with Spectron,
      preload: path.join(__dirname, 'preload.js')
    }
  };
  const opts = extend(defaultOption, option);
  const win = new BrowserWindow(opts);
  win.once('ready-to-show', () => {
    win.webContents.send('event.current.winId', win.id);
  });

  //阻止页面修改标题
  win.on('page-title-updated', (event, title) => {
    if (option.title) {
      win.setTitle(opts.title);
    }
    event.preventDefault();
  });

  if (opts.url) {
    win.loadURL(opts.url);
  } else if (opts.file) {
    win.loadFile(opts.file);
  }

  if (opts.webPreferences.devTools) {
    win.webContents.openDevTools();
  }

  return win;
}

/**
 * ipc方式打开对话框
 * @param event
 * @param option
 */
function ipcOpenWindow(event: IpcMainEvent, option: OpenWindowOption) {
  try {
    const win = openWindow({ parent: BrowserWindow.fromWebContents(event.sender), ...option });
    event.returnValue = win.id;
  } catch (e) {
    event.returnValue = null;
  }
}

/**
 * 把消息转成Promise返回给渲染进程
 * @param event
 * @param channel
 * @param promise
 */
function returnPromise<T>(event: IpcMainEvent, channel: string, promise: Promise<T>) {
  if (promise && channel) {
    promise
      .then(data => event.sender.send(channel, { success: true, data }))
      .catch(err => {
        event.sender.send(channel, { success: false, data: err });
      });
  }
}

/**
 * 子窗口调用当前窗口的方法或属性, 通过electron.service 主动调用
 * @param event
 * @param winId
 * @param name
 * @param value
 * @param args
 */
function ipcInvokeBrowserWindow(
  event: IpcMainEvent,
  { winId, name, value, args }: { winId?: number; name: string; value: any; args: any[] }
) {
  const browserWindow = winId ? BrowserWindow.fromId(winId) : BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) {
    event.returnValue = -1;
    return;
  }

  if (isFunction(browserWindow[name])) {
    event.returnValue = browserWindow[name](...(args || []));
    return;
  }

  if (value !== undefined) {
    browserWindow[name] = value;
    event.returnValue = 0;
    return;
  }
  event.returnValue = browserWindow[name];
}

/**
 * 启动注册消息
 */
export function setup() {
  // 获取当前窗口id
  ipcMain.on('mdc.currentWinId', event => (event.returnValue = BrowserWindow.fromWebContents(event.sender).id));
  // 打开新窗口
  ipcMain.on('mdc.openWindow', ipcOpenWindow);
  // 执行窗口方法
  ipcMain.on('mdc.invokeBrowserWindow', ipcInvokeBrowserWindow);
  // 监听窗口消息
  ipcMain.on('mdc.onBrowserWindow', (event, channel, { on, winId }) => {
    const browserWindow = winId ? BrowserWindow.fromId(winId) : BrowserWindow.fromWebContents(event.sender);
    browserWindow.on(on, (evt, ...args) => {
      event.sender.send(channel, ...args);
    });
  });

  // 执行对话框方法
  ipcMain.on('mdc.invokeDialog', (event, channel, fnName, hasParent, ...options) => {
    if (hasParent) {
      returnPromise(event, channel, dialog[fnName](BrowserWindow.fromWebContents(event.sender), ...options));
    } else {
      returnPromise(event, channel, dialog[fnName](...options));
    }
  });
}

export interface OpenWindowOption extends BrowserWindowConstructorOptions {
  /**
   * url地址
   */
  url?: string;
  /**
   * 文件地址
   */
  file?: string;
}
