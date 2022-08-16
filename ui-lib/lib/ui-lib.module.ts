import { NgModule } from '@angular/core';
import { ProgressCircleModule } from './progress-circle/progress-circle.module';
import { WindowModule } from './window/window.module';
import { TitlebarModule } from './titlebar/titlebar.module';

@NgModule({
  declarations: [],
  imports: [],
  exports: [WindowModule, ProgressCircleModule, TitlebarModule]
})
export class UiLibModule {}
