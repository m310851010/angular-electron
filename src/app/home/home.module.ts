import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ReactiveFormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';

import {
  LockOutline,
  AppstoreOutline,
  SettingOutline,
  MailOutline,
  UserOutline
} from '@ant-design/icons-angular/icons';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { ResultComponent } from './result/result.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzxTableModule } from '@xmagic/nzx-antd/table';
import { HomeService } from './home.service';

@NgModule({
  declarations: [HomeComponent, ResultComponent],
  imports: [
    SharedModule,
    HomeRoutingModule,
    NzInputModule,
    NzButtonModule,
    NzGridModule,
    NzFormModule,
    NzIconModule.forRoot([LockOutline, UserOutline, AppstoreOutline, SettingOutline, MailOutline]),
    NzModalModule,
    NzxTableModule
  ],
  providers: [HomeService]
})
export class HomeModule {}
