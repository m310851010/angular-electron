import { NgModule } from '@angular/core';
import { ProgressCircleModule } from './progress-circle/progress-circle.module';
import { WindowModule } from './window/window.module';

@NgModule({
  declarations: [],
  imports: [],
  exports: [WindowModule, ProgressCircleModule]
})
export class UiLibModule {}
