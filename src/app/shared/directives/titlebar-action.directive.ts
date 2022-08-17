import { Directive, Host } from '@angular/core';
import { TitlebarComponent } from 'ui-lib';
import { ElectronService } from '../services';

@Directive({
  selector: 'desk-titlebar[titlebar-action]'
})
export class TitlebarActionDirective {
  constructor(@Host() titlebar: TitlebarComponent, private electronService: ElectronService) {
    titlebar.showClose = this.electronService.invokeBrowserWindow('closable');
    titlebar.showMinimize = this.electronService.invokeBrowserWindow('minimizable');
    titlebar.showMaximize = this.electronService.invokeBrowserWindow('maximizable');
    titlebar.isMaximized = this.electronService.invokeBrowserWindow('isMaximized');

    titlebar.maximizeClick.subscribe(() => this.electronService.invokeBrowserWindow('maximize'));
    titlebar.minimizeClick.subscribe(() => this.electronService.invokeBrowserWindow('minimize'));
    titlebar.closeClick.subscribe(() => this.electronService.invokeBrowserWindow('close'));
    titlebar.restoreDownClick.subscribe(() => this.electronService.invokeBrowserWindow('unmaximize'));

    this.electronService.onBrowserWindow('maximize', () => (titlebar.isMaximized = true));
    this.electronService.onBrowserWindow('unmaximize', () => (titlebar.isMaximized = false));
  }
}
