import { Component, EventEmitter, Host, Input, OnInit, Optional, Output, TemplateRef } from '@angular/core';
import { WindowComponent } from '../window/window.component';

@Component({
  selector: 'desk-titlebar',
  templateUrl: './titlebar.component.html',
  host: {
    '[class.desk-title-bar]': 'true',
    '[class.dark]': 'theme === "dark"',
    '[class.light]': 'theme === "light"',
    '[style.background]': 'background'
  }
})
export class TitlebarComponent implements OnInit {
  /**
   * 背景色或背景图
   */
  @Input() background = '#cc7f29';
  /**
   * 图标,使用nz icon图标图库, 需要从@ant-design/icons-angular/icons导入到NzIconModule模块
   */
  @Input() icon?: string = 'user';
  /**
   * 是否是最大化状态,可双向绑定
   */
  @Input() isMaximized = false;

  /**
   * 标题
   */
  @Input() title: string | TemplateRef<void> = '标题';
  /**
   * 是否dark主题
   */
  @Input() theme: 'light' | 'dark' = 'dark';
  /**
   * 是否显示最大化图标
   */
  @Input() showMaximize = true;
  /**
   * 是否显示最小化图标
   */
  @Input() showMinimize = true;
  /**
   * 是否显示关闭图标
   */
  @Input() showClose = true;

  /**
   * 关闭按钮点击事件
   */
  @Output() closeClick = new EventEmitter<void>();
  /**
   * 关最小化按钮点击事件
   */
  @Output() minimizeClick = new EventEmitter<void>();
  /**
   * 最大化按钮点击事件
   */
  @Output() maximizeClick = new EventEmitter<void>();
  /**
   * 还原按钮点击事件
   */
  @Output() restoreDownClick = new EventEmitter<void>();
  /**
   * 是否最大化Change事件,
   */
  @Output() isMaximizedChange = new EventEmitter<boolean>();
  constructor(@Host() @Optional() parent: WindowComponent) {}

  ngOnInit(): void {}

  /**
   * 最大化点击事件
   *
   * @param isMaximized
   */
  onMaxIconClick(isMaximized: boolean) {
    this.isMaximized = !isMaximized;
    this.isMaximizedChange.emit(this.isMaximized);
    if (this.isMaximized) {
      this.maximizeClick.emit();
    } else {
      this.restoreDownClick.emit();
    }
  }
}
