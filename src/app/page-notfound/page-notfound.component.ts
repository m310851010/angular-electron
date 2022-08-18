import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-page-notfound',
  templateUrl: './page-notfound.component.html'
})
export class PageNotfoundComponent implements OnInit {
  @Output() refreshEvent = new EventEmitter<MouseEvent>();
  constructor(private location: Location) {}

  ngOnInit(): void {}

  handleRefresh(evt: MouseEvent) {
    if (this.refreshEvent.observed) {
      this.refreshEvent.emit(evt);
    } else {
      this.location.back();
    }
  }
}
