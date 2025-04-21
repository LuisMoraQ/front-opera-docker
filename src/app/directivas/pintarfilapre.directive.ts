import { Directive,ElementRef, Input,Renderer2, RendererStyleFlags2 } from '@angular/core';

@Directive({
  selector: '[appPintarfilapre]'
})
export class PintarfilapreDirective {
  @Input() item: string;
  @Input() partida: boolean;
  @Input() tipo: string;
  @Input() color: string;
  @Input() letra: string;
  @Input() separador: string;
  @Input() hito: boolean = false

  constructor(private renderer: Renderer2,private readonly elRef:ElementRef) { }

  ngOnInit() {
    if(this.item!=undefined && !this.hito)
    {
      let valor2= this.item.toString().split(this.separador);
      if(this.letra!=undefined)
      {
        if(this.partida)
        {
          let letra_sel =  this.letra[11];
          this.renderer.setStyle(this.elRef.nativeElement,'color',letra_sel);
        }
        else
        {
          let letra_sel =  (valor2.length == 1 && this.item!='') ? this.letra[0] : valor2.length == 2 ? this.letra[1] : valor2.length == 3 ? this.letra[2] : valor2.length == 4 ? this.letra[3] : valor2.length == 5 ? this.letra[4] : valor2.length == 6 ? 
            this.letra[5] : valor2.length == 7 ? this.letra[6] : valor2.length == 8 ? this.letra[7] : valor2.length == 9 ? this.letra[8] : valor2.length == 10 ? this.letra[9] : valor2.length == 11 ? this.letra[10] : "";//hasta indice 10
          this.renderer.setStyle(this.elRef.nativeElement,'color',letra_sel,RendererStyleFlags2.Important);
        }
      }
  
      if(this.color!=undefined)
      {
        if(this.partida)
        {
          let color_sel = this.color[11];
          this.renderer.setStyle(this.elRef.nativeElement,'background-color',color_sel);
        }
        else
        {
          let color_sel =   (valor2.length == 1 && this.item!='') ? this.color[0] : valor2.length == 2 ? this.color[1] : valor2.length == 3 ? this.color[2] : valor2.length == 4 ? this.color[3] : valor2.length == 5 ? this.color[4] : valor2.length == 6 ?
            this.color[5] : valor2.length == 7 ? this.color[6] : valor2.length == 8 ? this.color[7] : valor2.length == 9 ? this.color[8] : valor2.length == 10 ? this.color[9] : valor2.length == 11 ? this.color[10] : "";
          this.renderer.setStyle(this.elRef.nativeElement,'background-color',color_sel);
        }
      }

      if(this.tipo!=undefined)
      {
        let tipo_sel="";
        if(this.partida)
        {
          tipo_sel = this.tipo[11];
        }
        else{
          tipo_sel =  (valor2.length == 1 && this.item!='') ? this.tipo[0] : valor2.length == 2 ? this.tipo[1] : valor2.length == 3 ? this.tipo[2] : valor2.length == 4 ? this.tipo[3] : valor2.length == 5 ? this.tipo[4] : valor2.length == 6 ? this.tipo[5] : valor2.length == 7 ?
            this.tipo[6] : valor2.length == 8 ? this.tipo[7] : valor2.length == 9 ? this.tipo[8] : valor2.length == 10 ? this.tipo[9] : valor2.length == 11 ? this.tipo[10] : "";
        }

        if(tipo_sel=="2"){
          this.renderer.setStyle(this.elRef.nativeElement,'font-style','italic');
        }
        if(tipo_sel=="3"){
          this.renderer.setStyle(this.elRef.nativeElement,'font-weight','bold');
        }
        if(tipo_sel=="4"){
          this.renderer.setStyle(this.elRef.nativeElement,'font-weight','bold');
          this.renderer.setStyle(this.elRef.nativeElement,'font-style','italic');
        }
      }
    }
    if (this.hito) {
      this.renderer.setStyle(this.elRef.nativeElement,'background-color', '#c3f08c');
    }
  }
}
