import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAnchocol]'
})
export class AnchocolDirective {
  @Input() ancho: string;
  @Input() detalle: boolean;
  @Input() lineHeight: boolean;
  @Input() alineamiento: string;
  constructor(
    private renderer: Renderer2,
    private readonly elRef: ElementRef
  ) { }

  ngOnInit() {
    var esdetalle = this.detalle != undefined ? this.detalle : false;
    var lineHeight = this.lineHeight != undefined ? this.lineHeight : false;
    if (this.ancho != undefined) {
      if (!esdetalle) {
        this.renderer.setStyle(this.elRef.nativeElement, 'width', this.ancho + 'px');
      }
      this.renderer.setStyle(this.elRef.nativeElement, 'min-width', this.ancho + 'px');
      this.renderer.setStyle(this.elRef.nativeElement, 'max-width', this.ancho + 'px');

      this.renderer.setStyle(this.elRef.nativeElement, 'white-space', 'unset');
      this.renderer.setStyle(this.elRef.nativeElement, 'overflow-wrap', 'break-word');
      if (!lineHeight) {
        this.renderer.setStyle(this.elRef.nativeElement, 'line-height', 'calc(1em + 1px)');
      }
    }
    if (this.alineamiento) {
      console.log('this.alineamiento', this.alineamiento);
      
      this.renderer.setStyle(this.elRef.nativeElement,'text-align', this.alineamiento);
    }
  }
}
