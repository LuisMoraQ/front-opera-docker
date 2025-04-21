import { Component, OnInit,Input,ChangeDetectorRef } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-modversubplectura',
  templateUrl: './modversubplectura.component.html',
  styleUrls: ['./modversubplectura.component.scss']
})
export class ModversubplecturaComponent implements OnInit {
  @Input() moneda='S/';
  @Input() detallepartida = null
  @Input() partida = null
  @Input() indpri = null
  mostrar_carga_todo = false
  @Input() tipoProy = [];
  @Input() dec_precio;
  @Input() mask_precio;
  @Input() dec_cant;
  @Input() mask_cant;
  @Input() arrPriSubp = [];
  paddingscroll = 17;
  paddingscroll2 = 17;
  active = 0
  preventscroll = false;
  preventDefault = null
  id_user: any;
  formTabs = new UntypedFormGroup({
    formSubPartida: new UntypedFormArray([], Validators.required)
  })
  get formSubPartida() {
    return this.formTabs.controls['formSubPartida'] as UntypedFormArray
  }

  constructor(
    private modal: NgbActiveModal,
    private encriptadorService: EncriptadorService,
    private changeDetector: ChangeDetectorRef,
    private toaster: ToastrService,
    private modalService: NgbModal,
    public formsService: FormsService,
  ) { }

  async ngOnInit() {
    this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
    await this.agregartab(this.partida, this.detallepartida);
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('tableBodysubp');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2 != sizeef2) {
        this.paddingscroll2 = sizeef2;
      }
    }
  }
  SyncScroll() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBodysubp");
    var face3 = document.getElementById("tableFootsubp");
    face3.scrollLeft = face2.scrollLeft;
  }
  SyncScroll2() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBodysubp");
    var face3 = document.getElementById("tableFootsubp");
    face2.scrollLeft = face3.scrollLeft;
  }
  async agregartab(row, detalleSubpartida) {
    if (this.formSubPartida.value.length > 4) {
      this.toaster.error('No se puede abrir mas de 4 pestañas', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    }
    const nrotab = this.formSubPartida.value.length
    const datosPartida = await this.formDataSubPartida(row, row.unidad)
    const datosTab = new UntypedFormGroup({
      indice_tab: new UntypedFormControl(nrotab),
      data_partida: new UntypedFormGroup(datosPartida.controls, Validators.required),//controles de partida(descripcion,unidad,rendimiento,und_rendi,jornada,precio)
      data_tabla: new UntypedFormControl(detalleSubpartida),//tabla detalles de la partida
      tabla_editada: new UntypedFormControl(false),//bool para saber si se edito la tabla detalle partidas
      precio: new UntypedFormControl(row.precio),
      cambiossubpartidas: new UntypedFormControl([]),
      row: new UntypedFormControl(row),
      undconcatrendi: new UntypedFormControl(row.unidad),
      filteredOptions: new UntypedFormControl([]),
      filasel: new UntypedFormControl(-1),
      codsoloiu: new UntypedFormControl(false),
      mcodigo: new UntypedFormControl(true),
      colselacu: new UntypedFormControl(false),
      editarpreins: new UntypedFormControl(false),
      idgruselacu: new UntypedFormControl(null),
      filasinserta: new UntypedFormControl([]),
      filaselimina: new UntypedFormControl([]),
    })
    this.formSubPartida.push(datosTab)
    this.CalcRatio(this.formSubPartida.length-1);
    this.active = this.formSubPartida.value.length - 1;
  }
  async formDataSubPartida(partida, undconcatrendi): Promise<UntypedFormGroup> {
    const inputidusuariols = this.encriptadorService.recuperarlocalstory('idusuario');
    const formDataPartida = new UntypedFormGroup({
      descripcion: new UntypedFormControl(partida.descripcion, [Validators.required]),
      unidad: new UntypedFormControl(partida.unidad, [Validators.required]),
      precio: new UntypedFormControl(partida.precio, [Validators.required, Validators.min(0)]),
      rendimiento: new UntypedFormControl(partida.rendimiento ? partida.rendimiento : '', []),
      undrendimiento: new UntypedFormControl(partida.und_rendi ? partida.und_rendi : '', []),
      jornada: new UntypedFormControl(partida.jornada, []),
      id_usuario: new UntypedFormControl(inputidusuariols, []),
      ratio: new UntypedFormControl('', []),
    })
    return formDataPartida
  }
  closeModal(result: any = null) {
    this.modal.close();
  }
  async cerrarPestana(event: MouseEvent, toRemove: number) {
    if (!this.formSubPartida.value.length) {
      this.closeModal()
    } else {
      this.formSubPartida.removeAt(toRemove)
      if (!this.formSubPartida.value.length) {
        this.closeModal()
      }
      event?.preventDefault();
      event?.stopImmediatePropagation();
      this.active = this.formSubPartida.value.length - 1
      for (let i = 0; i < this.formSubPartida.value.length; i++) {
        const form = (this.formSubPartida.controls[i]) as UntypedFormGroup
        const indicetab = form.get('indice_tab') as UntypedFormControl
        indicetab.setValue(i)
      }
      console.log(this.formSubPartida.value)
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async abrirDetalleTab(row) {
    const encontrado = this.formSubPartida.value.some(ele => ele.row.id_partida == row.id_partida && ele.row.indice_subp == row.indice_subp);
    if (encontrado) {
      this.toaster.error('Sub Partida ya abierta', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    }
    let detallepart = [];
    let summano=0;
    let summat=0;
    let sumeq=0;
    let sumsubc=0;
    let sumsubp=0;
    for (let fila1 of this.arrPriSubp) {
      if (row.indice_subp == fila1.indice && fila1.unidad!='') {
        detallepart.push(fila1);
        if(fila1.id_tipo_insumo=='1'){
          summano+=Number(fila1.parcial);
        }
        else if(fila1.id_tipo_insumo=='2'){
          summat+=Number(fila1.parcial);
        }
        else if(fila1.id_tipo_insumo=='3'){
          sumeq+=Number(fila1.parcial);
        }
        else if(fila1.id_tipo_insumo=='4'){
          sumsubc+=Number(fila1.parcial);
        }
        else if(fila1.id_tipo_insumo=='5'){
          sumsubp+=Number(fila1.parcial);
        }
      }
    }
    //agregar agrupaciones
    let pindice=detallepart.length>0?detallepart[0].indice:null;
    let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',summano,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',summat,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',sumeq,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',sumsubc,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',sumsubp,0,0);
    detallepart.push(filamano);
    detallepart.sort( (a, b) => {
      if(a.id_tipo_insumo < b.id_tipo_insumo) {
        return -1;
      }
      if(a.id_tipo_insumo > b.id_tipo_insumo) {
        return 1;
      }
      if (a.num_det < b.num_det) {
        return -1;
      }
      if (a.num_det > b.num_det) {
        return 1;
      }
      return 0;
    });
    if (detallepart.length > 0) {
      await this.agregartab(row, JSON.parse(JSON.stringify(detallepart)));
    }
    else {
      this.toaster.error('Debe guardar los cambios para ver la subpartida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  CrearFilaAgru(pindice:any,pdescripcion:any,pid_tipo_insumo:any,pparcial:any,pesinsumo:any,pafcuad:any){
    let filaaux={
      id_proyecto:null,//this.id_proyecto,
      indice:pindice,// se debe recuperar el indice del padre
      id_filadetalle:null,
      num_det:0,
      codigo:null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion:pdescripcion,
      id_unidad:'',
      unidad:'',
      operador:null,
      tipo_insumo:null,
      cuadrilla:null,
      cantidad:null,
      precio:null,
      parcial:Number(pparcial),
      id_tipo_insumo:Number(pid_tipo_insumo),
      id_indice:null,
      id_clasificacion:null,//revisar valores
      desc_clasi:null,
      id_insumo:null,
      id_subpartida:null,
      indice_subp:null,
      accion:0,
      esinsumo:pesinsumo,
      afcuadrilla:pafcuad,
      rendimiento:null,
      und_rendi:null,
      jornada:null,
      advceros:null,
      referencia:null,
      mostrar:1,
      icomost:1,
      editar:0,
      editar2:0,
      ind:-1,
      seleccion:0,
      asignaund:0
    };
    return filaaux;
  }
  //tabla acu
  cambindiceselacu(ind: any, tab: any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let filaselact = form.get('filasel') as UntypedFormControl
    if (ind == filaselact.value)
      filaselact.setValue(-1);
    else
      filaselact.setValue(ind);
  }
  toggleOn(condicion: any, ind: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[ind].icomost = 1;
    for (let i = ind + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 1;
        }
      }
      else { break; }
    }
  }
  toggleOff(condicion: any, ind: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[ind].icomost = 0;
    for (let i = ind + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 0;
        }
      }
      else { break; }
    }
  }
  Anumero(val:any){
    return Number(val);
  }
  CalcRatio(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const ratio = dataPartida.get('ratio') as UntypedFormControl
    let valret=0;
    for(let row of dataTabla){
      if(row.id_tipo_insumo==1){
        valret=Number(valret??0)+Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    ratio.setValue(this.formsService.redondeo(valret,this.dec_cant));
  }
}
