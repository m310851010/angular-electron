import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { startAnimation, stopAnimation } from './progress-circle-animation';

@Component({
  selector: 'desk-progress-circle',
  template: `
    <svg
      #element
      x="0px"
      y="0px"
      viewBox="0 0 150 150"
      class="progress-circles"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
      <circle #ref [ngStyle]="componentStyle" fill-opacity="0" cx="75" cy="75" r="7.3" />
    </svg>
  `
})
export class ProgressCircleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('element', { static: true }) element!: ElementRef<SVGElement>;
  @Input() componentStyle: { [klass: string]: NzSafeAny } | null;
  @ViewChildren('ref') refs: QueryList<ElementRef<SVGElement>>;
  @Input() size = 50;
  animation: number;
  constructor() {}

  ngAfterViewInit(): void {
    this.animation = startAnimation(...this.refs.map(e => e.nativeElement));
  }

  ngOnDestroy(): void {
    stopAnimation(this.animation);
  }
}
