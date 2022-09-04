import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebviewDirective, TitlebarActionDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { UiLibModule } from 'ui-lib';

@NgModule({
  declarations: [WebviewDirective, TitlebarActionDirective],
  imports: [CommonModule, FormsModule],
  exports: [CommonModule, WebviewDirective, FormsModule, UiLibModule, TitlebarActionDirective]
})
export class SharedModule {}
