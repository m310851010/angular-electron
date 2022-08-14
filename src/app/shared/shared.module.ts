import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { UiLibModule } from 'ui-lib';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [CommonModule, FormsModule, UiLibModule],
  exports: [WebviewDirective, FormsModule, UiLibModule ]
})
export class SharedModule {}
