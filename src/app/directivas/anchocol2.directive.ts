import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appAnchocol2]'
})
export class Anchocol2Directive implements OnChanges {

  @Input() ancho!: number;
  @Input() detalle = false;
  @Input() alineamiento?: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ancho']) {
      this.aplicarEstilos();
    }
  }

  private aplicarEstilos(): void {
    if (!this.ancho) return;

    const anchoPx = `${this.ancho}px`;
    const element = this.el.nativeElement;

    this.renderer.setStyle(element, 'min-width', anchoPx);
    this.renderer.setStyle(element, 'max-width', anchoPx);
    this.renderer.setStyle(element, 'width', anchoPx);

    this.renderer.setStyle(element, 'box-sizing', 'border-box');
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'text-overflow', 'ellipsis');
    this.renderer.setStyle(element, 'white-space', this.detalle ? 'normal' : 'nowrap');

    if (this.alineamiento) {
      this.renderer.setStyle(element, 'text-align', this.alineamiento);
    }
  }
}
