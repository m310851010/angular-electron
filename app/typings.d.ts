/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}
interface Window {
  [key: string]: any;
  process: any;
  openWindow: any;
  showOpenDialog: any;
  winId: number;
  require: any;
  electronAPI: any;
}
