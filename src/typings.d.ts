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
  invokeBowserWindow: any;
  require: any;
}

declare const basePath: string;
declare const assetsPath: string;
declare const BasePath: (url: TemplateStringsArray, ...keys: string[]) => string;
