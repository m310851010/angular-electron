import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '../shared/services';
import { NzModalService, ModalOptions } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  /**
   * 选择的文件路径
   */
  filePath?: string;
  validateForm!: FormGroup;
  radioValue = 'A';
  constructor(
    private fb: FormBuilder,
    public electronService: ElectronService,
    private nzModalService: NzModalService
  ) {}

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /**
   * 点击选择文件按钮
   */
  onOpenFileDialog() {
    this.electronService
      .showOpenDialog({ properties: ['openFile'], filters: [{ name: '数据文件', extensions: ['xls', 'xlsx'] }] })
      .then(v => {
        if (v.filePaths.length) {
          this.filePath = v.filePaths[0];
        }
      });
  }

  /**
   * 提交
   */
  onSubmit() {
    if (!this.filePath) {
      this.alert({ nzContent: '请选择文件' });
      return;
    }

    const exists = this.electronService.fs.existsSync(this.filePath);
    if (!exists) {
      this.alert({ nzContent: '文件不存在或已被删除，请重新选择' });
      return;
    }

  }

  private alert(option: ModalOptions) {
    return this.nzModalService.create({
      nzCentered: true,
      nzMaskClosable: false,
      nzTitle: '提示',
      nzCancelText: null,
      ...option
    });
  }

  openModal() {
    // this.nzModalService.create({ nzTitle: '冲冲冲', nzContent: 'xxx' });
    // this.electronService.openWindow({ url: 'http://localhost:4200', modal: true });
    // this.electronService.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then(list => {
    //   console.log(list.filePaths);
    // });
    this.electronService
      .showMessageBox({
        title: '提示',
        message: 'xxx',
        type: 'question',
        noLink: true,
        buttons: ['测试', '先谢谢']
      })
      .then(ret => {
        console.log(ret);
      });
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }
}
