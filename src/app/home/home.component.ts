import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '../shared/services';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
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
