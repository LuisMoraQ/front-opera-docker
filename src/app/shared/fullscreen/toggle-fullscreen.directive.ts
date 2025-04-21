import {Directive, HostListener} from '@angular/core';

import * as screenfull from 'screenfull';

@Directive({
  selector: '[appToggleFullScreen]'
})
export class ToggleFullScreenDirective {

  @HostListener('click')
  onClick() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }
}
