import { Injectable } from '@angular/core';
import { ElectronService } from '../shared/services';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ExcelService } from '../shared/services/excel.service';

@Injectable()
export class HomeService {
  /**
   * 最大文件大小
   */
  readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  constructor(
    private electronService: ElectronService,
    private nzModalService: NzModalService,
    private excelService: ExcelService
  ) {}

  /**
   * 打开选择文件对话框
   * @param name 过滤名称
   * @param extensions 后缀
   */
  openFileDialog(name: string, extensions: string[]): Promise<string | null> {
    return this.electronService
      .showOpenDialog({ properties: ['openFile'], filters: [{ name, extensions }] })
      .then(v => {
        if (v.filePaths.length) {
          return v.filePaths[0];
        }
        return null;
      });
  }

  /**
   * 验证文件是否正确
   * @param filePathConfig 参数文件路径
   * @param filePathHolder 持仓文件路径
   */
  validateFilePath(filePathConfig: string, filePathHolder: string): boolean {
    if (!filePathConfig) {
      this.alert('请选择参数文件');
      return false;
    }
    if (!filePathHolder) {
      this.alert('请选择持仓文件');
      return false;
    }

    if (!this.electronService.fs.existsSync(filePathConfig)) {
      this.alert('参数文件不存在或已被删除，请重新选择');
      return false;
    }

    if (!this.electronService.fs.existsSync(filePathHolder)) {
      this.alert('持仓文件不存在或已被删除，请重新选择');
      return false;
    }

    if (this.electronService.fs.statSync(filePathConfig).size > this.MAX_FILE_SIZE) {
      this.alert('参数文件不能超过50M，请重新选择');
      return false;
    }
    if (this.electronService.fs.statSync(filePathHolder).size > this.MAX_FILE_SIZE) {
      this.alert('持仓文件不能超过50M，请重新选择');
      return false;
    }

    return true;
  }

  /**
   * 另存为持仓文件模板
   */
  async saveAsTemplate(): Promise<void> {
    const result = await this.electronService.showSaveDialog({
      defaultPath: '持仓文件模板.xlsx',
      filters: [{ name: '持仓文件', extensions: ['xlsx'] }]
    });

    if (result.filePath) {
      this.electronService.fs.copyFile(BasePath`/assets/template.xlsx`, result.filePath, error => {
        if (error) {
          this.nzModalService.error({ nzContent: error.message });
        }
      });
    }
  }

  /**
   * 提示信息
   *
   * @param nzContent 提示信息
   * @private
   */
  alert(nzContent: string) {
    return this.nzModalService.create({
      nzCentered: true,
      nzMaskClosable: false,
      nzTitle: '提示',
      nzCancelText: null,
      nzContent
    });
  }
}
