import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'desk-window',
  template: '<ng-content></ng-content>',
  host: {
    '[class.focused]': 'focused',
    '[class.unfocused]': '!focused'
  }
})
export class WindowComponent implements OnInit, OnDestroy {
  @Input() @HostBinding('class.chrome') chrome = true;
  @Input() @HostBinding('class.window-dark') dark = false;
  /**
   * 是否监听focus事件, 默认true
   */
  @Input() listenFocused?: boolean;
  /**
   * 添加padding
   */
  @Input() padding = '20px 30px';
  /**
   * 获取焦点
   */
  @Output() focusedChange = new EventEmitter<boolean>();
  @HostBinding('class.desk-window') readonly windowClass = true;
  /**
   * 是否获取焦点
   */
  @Input() focused = true;
  private subscribe$ = new Subject<void>();

  constructor(protected element: ElementRef, protected render: Renderer2) {}

  @HostListener('window:focused', ['$event'])
  handleKeyDown(event: KeyboardEvent) {}

  ngOnInit(): void {
    if (this.listenFocused == null || this.listenFocused) {
      fromEvent(window, 'focus')
        .pipe(takeUntil(this.subscribe$))
        .subscribe(() => ((this.focused = true), this.focusedChange.emit(this.focused)));

      fromEvent(window, 'blur')
        .pipe(takeUntil(this.subscribe$))
        .subscribe(() => ((this.focused = false), this.focusedChange.emit(this.focused)));
    }
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
