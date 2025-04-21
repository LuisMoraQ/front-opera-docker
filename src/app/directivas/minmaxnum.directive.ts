import { Directive,ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMinmaxnum]'
})
export class MinmaxnumDirective {
  @Input() menor: number;
  @Input() mayor: number;
  private valact:any;
  //valido para menor<=0, si se pone mas de 0 no funciona bien

  constructor(private readonly elRef:ElementRef) { }

  @HostListener('input',['$event'])
  onChangeInput(event:Event):void{
    if(this.menor!=undefined && this.mayor!=undefined)
    {
      const valido=this.elRef.nativeElement.value>=this.menor && this.elRef.nativeElement.value<=this.mayor?true:false;
      if(!valido)
      {
        this.elRef.nativeElement.value=this.valact;
      }
    }
    else if(this.menor!=undefined)
    {
      const valido=this.elRef.nativeElement.value>=this.menor?true:false;
      if(!valido)
      {
        this.elRef.nativeElement.value=this.valact;
      }
    }
    else if(this.mayor!=undefined)
    {
      const valido=this.elRef.nativeElement.value<=this.mayor?true:false;
      if(!valido)
      {
        this.elRef.nativeElement.value=this.valact;
      }
    }
  }
  
  @HostListener('keydown')
  onkeydown(){
    this.valact=this.elRef.nativeElement.value;
  }

  @HostListener('blur')
  onblur(){
    if(this.elRef.nativeElement.value=="")
    {
      this.elRef.nativeElement.value=0;
    }
  }
}
