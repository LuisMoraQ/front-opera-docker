import { Directive, AfterContentInit, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterContentInit {
  @Input() public appAutoFocus: boolean;

  constructor(private el: ElementRef) { }

  public ngAfterContentInit() {
    this.el.nativeElement.select();
    this.el.nativeElement.scrollIntoView({
      block: 'nearest',
      bebehavior: 'instant'
    });
  }
}
