import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { UiLibModule } from 'ui-lib';
import { TitlebarActionDirective } from './directives/titlebar-action.directive';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TitlebarActionDirective],
  imports: [CommonModule, FormsModule, UiLibModule],
  exports: [WebviewDirective, FormsModule, UiLibModule, TitlebarActionDirective]
})
export class SharedModule {}
