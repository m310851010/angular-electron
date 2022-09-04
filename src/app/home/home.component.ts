import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  /**
   * 持仓文件路径
   */
  filePathHolder?: string;
  /**
   * 配置文件路径
   */
  filePathConfig?: string;
  /**
   * 计算中
   */
  calculating = false;
  result: any[] = [];
  constructor(private homeService: HomeService) {}

  ngOnInit(): void {}

  /**
   * 点击 持仓文件 选择文件按钮
   */
  async onOpenFileDialogHolder() {
    const path = await this.homeService.openFileDialog('持仓文件', ['xls', 'xlsx']);
    if (path) {
      this.filePathHolder = path;
    }
  }

  /**
   * 点击 参数文件 选择文件按钮
   */
  async onOpenFileDialogConfig() {
    const path = await this.homeService.openFileDialog('参数文件', ['xml']);
    if (path) {
      this.filePathConfig = path;
    }
  }

  /**
   * 点击计算按钮
   */
  onCalcClick() {
    if (this.calculating) {
      this.homeService.alert('正在计算中，请稍后...');
      return;
    }

    const valid = this.homeService.validateFilePath(this.filePathConfig, this.filePathHolder);
    if (!valid) {
      return;
    }

    this.calculating = true;
    setTimeout(() => (this.calculating = false), 5000);
  }

  /**
   * 另存为持仓文件模板
   */
  onSaveAsTemplate() {

    this.homeService.saveAsTemplate();
  }
}
