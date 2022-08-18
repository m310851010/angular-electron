import { NgModule } from '@angular/core';

import { PageNotfoundRoutingModule } from './page-notfound-routing.module';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PageNotfoundComponent } from './page-notfound.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CloseCircleOutline } from '@ant-design/icons-angular/icons';

@NgModule({
  declarations: [PageNotfoundComponent],
  imports: [
    PageNotfoundRoutingModule,
    NzTypographyModule,
    NzResultModule,
    NzButtonModule,
    NzIconModule.forChild([CloseCircleOutline])
  ]
})
export class PageNotfoundModule {}
