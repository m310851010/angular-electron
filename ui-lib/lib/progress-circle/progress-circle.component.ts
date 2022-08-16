import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { startAnimation, stopAnimation } from './progress-circle-animation';

@Component({
  selector: 'desk-progress-circle',
  template: `
    <svg #element x="0px" y="0px" viewBox="0 0 150 150" class="svg" [style.width.px]="size" [style.height.px]="size">
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [attr.fill]="color" fill-opacity="0" cx="75" cy="75" r="7.3" />
    </svg>
  `,
  host: {
    '[class.desk-progress-circles]': 'true'
  }
})
export class ProgressCircleComponent implements AfterViewInit, OnDestroy {
  /**
   * 大小
   */
  @Input() size = 32;
  /**
   * 颜色
   */
  @Input() color = '#cc7f29';
  @ViewChild('element', { static: true }) element!: ElementRef<SVGElement>;
  @ViewChildren('ref') refs: QueryList<ElementRef<SVGElement>>;
  animation: number;
  constructor() {}

  ngAfterViewInit(): void {
    this.animation = startAnimation(...this.refs.map(e => e.nativeElement));
  }

  ngOnDestroy(): void {
    stopAnimation(this.animation);
  }
}
