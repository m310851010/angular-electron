import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotfoundComponent } from './page-notfound.component';

const routes: Routes = [{ path: '', component: PageNotfoundComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageNotfoundRoutingModule {}
