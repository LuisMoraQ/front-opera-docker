import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
//import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

export interface rowpartida {
  id_partida: any;
  descripcion: any;
  unidad:any;
  precio:any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  id_usuario:any;
  tipo_proy:any;
  fuente:any;
  agrupacion:any;
  esgrupo:any;
  referencia:any;
  advceros:any;
  desc_tipoproy:any;
  
  mostrar:any;
  icomost:any;
  ind:any;
  ind2:any;
}

@Component({
  selector: 'app-buscartitsubt',
  templateUrl: './buscartitsubt.component.html',
  styleUrls: ['./buscartitsubt.component.scss']
})
export class BuscartitsubtComponent implements OnInit {
  @Input('height') height: number = 100;
  paddingscroll=17;
  mostrar_carga_todo: boolean = false;
  busqueda = '';
  iduser:any;

  buscando=false;

  @Input() tabla:[];
  @Input() tipoProy=[];
  @Input() tipoproysel;
  @Input() fuentesel;
  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';

  tiposel='';

  datasourcePri:rowpartida[]=[];
  fila_sel:any;

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private catalogosService: CatalogosService,
    private _EncriptadorService: EncriptadorService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    var resto = 300;
    this.height = window.innerHeight - resto;
    this.datasourcePri=this.tabla;
    this.iduser=this._EncriptadorService.recuperarlocalstory('idusuario');
    this.tiposel=this.tipoproysel;
    document.getElementById('inpbusq')?.focus();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 300;
      this.height = window.innerHeight - resto;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('horscrollbod2');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  dobleseleccionar(row:any){
    let objresp={
      tipoproy:this.tiposel,
      data:row
    }
    this.modal.close(objresp)
  }
  seleccionar(){
    if(this.fila_sel>-1){
      let objresp={
        tipoproy:this.tiposel,
        data:this.datasourcePri[this.fila_sel]
      }
      this.modal.close(objresp)
    }
    else{
      this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  toggleOn(condicion:any,indice:any){
    this.datasourcePri[indice].icomost=1;
    for(let row of this.datasourcePri){
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if(row.agrupacion==condicion)
      {
        if(row.esgrupo!=0){
          row.mostrar=1;
        }
      }
      else if(palabra == (condicion + '.')){
        row.mostrar=1;
        row.icomost=1;
      }
    }
  }
  toggleOff(condicion:any,indice:any){
    this.datasourcePri[indice].icomost=0;
    for(let row of this.datasourcePri){
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if(row.agrupacion==condicion)
      {
        if(row.esgrupo!=0){
          row.mostrar=0;
        }
      }
      else if(palabra == (condicion + '.')){
        row.mostrar=0;
        row.icomost=0;
      }
    }
  }
  maxtodo(){
    for(let row of this.datasourcePri){
      if(row.agrupacion.split('.').length>1){
        row.mostrar=1;
      }
      else
        row.icomost=1;
    }
  }
  mintodo(){
    for(let row of this.datasourcePri){
      if(row.agrupacion.split('.').length>1){
        row.mostrar=0;
      }
      else
        row.icomost=0;
    }
  }
  closeModal(){
    this.modal.close(null)
  }
  cambindicesel(ind:any){
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  
  async cambiarTipoProy(idtipo: any){
    //filtrar solo front
    /* this.tiposel=idtipo; */
    /* let aux=[];
    let ind2=0;
    for(let row of this.datasourcePri){
      if(row.mostrar==1 && (row.tipo_proy==idtipo || idtipo=='')){
        row.ind2=ind2;
        aux.push(row);
        ind2++;
      }
      else{
        row.ind2=-1;
      }
    } */
    let tablatitsubt = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.iduser,fuente:this.fuentesel,tipo_proy:this.tiposel });
    this.datasourcePri=tablatitsubt;
  }
  async cambiarFuente(idfuente:any){
    try{
      this.buscando=true;
      this.datasourcePri=[];
      let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.iduser,fuente:idfuente });//cambiar dinamico tipo_proy
      this.datasourcePri=rpartidas;
      this.buscando=false;
    }
    catch(e){
      this.buscando=false;
      console.log(e)
    }
  }
}
