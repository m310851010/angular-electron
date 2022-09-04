import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitlebarComponent } from './titlebar.component';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserOutline } from '@ant-design/icons-angular/icons';

@NgModule({
  declarations: [TitlebarComponent],
  imports: [CommonModule, NzOutletModule, NzIconModule.forChild([UserOutline])],
  exports: [TitlebarComponent]
})
export class TitlebarModule {}
