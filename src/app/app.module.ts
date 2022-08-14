import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { NZ_I18N, zh_CN } from 'ng-zorro-antd/i18n';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IconDefinition } from '@ant-design/icons-angular';

import { NzIconModule } from 'ng-zorro-antd/icon';
// 引入你需要的图标，比如你需要 fill 主题的 AccountBook Alert 和 outline 主题的 Alert，推荐 ✔️
import { AccountBookFill, AlertFill, AlertOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [];

registerLocaleData(zh);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NoopAnimationsModule, SharedModule, AppRoutingModule, NzIconModule.forRoot(icons)],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }],
  bootstrap: [AppComponent]
})
export class AppModule {}
