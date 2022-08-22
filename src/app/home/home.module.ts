import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
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
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {NzUploadModule} from "ng-zorro-antd/upload";
import {NzSpaceModule} from "ng-zorro-antd/space";

@NgModule({
  declarations: [HomeComponent],
    imports: [
        CommonModule,
        SharedModule,
        HomeRoutingModule,
        NzInputModule,
        NzButtonModule,
        NzMenuModule,
        NzCheckboxModule,
        ReactiveFormsModule,
        NzGridModule,
        NzFormModule,
        NzIconModule.forRoot([LockOutline, UserOutline, AppstoreOutline, SettingOutline, MailOutline]),
        NzRadioModule,
        NzModalModule,
        NzUploadModule,
        NzSpaceModule
    ]
})
export class HomeModule {}
