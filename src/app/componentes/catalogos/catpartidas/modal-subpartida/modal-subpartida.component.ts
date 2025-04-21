import { data } from 'jquery';
import { Component, Input, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { BuscarinsumoComponent } from '../buscarinsumo/buscarinsumo.component';
import { BuscaaddunidadmedComponent } from '../../unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { BusqpartcatComponent } from '../busqpartcat/busqpartcat.component';

export interface rowinsumo {
  id_partida: any;
  id_tipo_insumo: any;
  num_det: any;
  codigo:any
  descripcion:any;
  id_unidad:any;
  unidad:any;
  operador:any;
  tipo_insumo:any;
  cuadrilla: any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice: any;
  id_insumo: any;
  id_clasificacion:any;
  id_subpartida: any;
  esinsumo: any;
  afcuadrilla: any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  advceros:any;
  icomost: any;
  mostrar: any;
  editar: any;
  editar2:any;
  ind:any;
  afectaref: any;
  seleccion:any;
}
export interface unidadmed {
  id_unidad: string;
  unidad: string;
  descripcion:string;
  operador:string;
  tipo_insumo:string;
  id_usuario:string;
  fuente:string;
  activo: string;
}
@Component({
  selector: 'app-modal-subpartida',
  templateUrl: './modal-subpartida.component.html',
  styleUrls: ['./modal-subpartida.component.scss']
})
export class ModalSubpartidaComponent implements OnInit {
  @Input() detallepartida = null
  @Input() Arreglosubp = null
  @Input() partida = null
  //@Input() row = null
  mostrar_carga_todo = false
  procesando=false;
  @Input() medidas: unidadmed[] = [];
  @Input() tipoProy = [];
  @Input() tipoproysel;
  @Input() fondo: any = '';
  @Input() color: any = '';
  @Input() letra: any = '';
  @Input() dec_cant;
  @Input() mask_cant;
  @Input() dec_precio;
  @Input() mask_precio;
  @Input() inpfuente=1;
  @Input() ultidpart=1;
  @Input() bloquear=false;
  active = 0
  preventDefault = null
  paddingscroll = 17;
  paddingscroll2 = 17;
  preventscroll = false;
  id_user: any;
  cargarDetallePartida = false
  formTabs = new UntypedFormGroup({
    formSubPartida: new UntypedFormArray([], Validators.required)
  })
  get formSubPartida() {
    return this.formTabs.controls['formSubPartida'] as UntypedFormArray
  }
  minimbut=false;
  constructor(
    private modal: NgbActiveModal,
    private encriptadorService: EncriptadorService,
    private catalogosService: CatalogosService,
    private toaster: ToastrService,
    private modalService: NgbModal,
    public formsService: FormsService,
    private changeDetector: ChangeDetectorRef,
    private adminservice: AdministradorService,
    private configuracionService: ConfiguracionService,
    ) { }

  async ngOnInit() {
    this.minimbut=document.body.clientWidth <= 991?true:false;
    this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
    await this.agregartab(this.partida, this.detallepartida)
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.minimbut=document.body.clientWidth <= 991?true:false;
    return
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
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
  async agregartab(data, detalleSubpartida) {
    if (this.formSubPartida.value.length > 4) {
      this.toaster.error('No se puede abrir mas de 4 pestañas', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    }
    let arraux=[];
    let tablabusq=JSON.parse(JSON.stringify(this.Arreglosubp));
    for(let fila1 of tablabusq){
      if(fila1.id_partida==data.id_subpartida){
        //arraux.push(JSON.parse(JSON.stringify(fila1)));
        if(fila1.id_subpartida){
          this.cargarSubpartPestana(tablabusq,arraux,fila1.id_subpartida)
        }
      }
    }
    const nrotab = this.formSubPartida.value.length
    let undsel=this.medidas.find(ele=>ele.id_unidad==data.id_unidad);
    const datosPartida = await this.formDataSubPartida(data)
    const datosTab = new UntypedFormGroup({
      indice_tab: new UntypedFormControl(nrotab),
      data_partida: new UntypedFormGroup(datosPartida.controls, Validators.required),
      data_tabla: new UntypedFormControl(detalleSubpartida),
      tabla_editada: new UntypedFormControl(false),
      precio: new UntypedFormControl(data.precio),
      cambiossubpartidas: new UntypedFormControl([]),
      detalleSubpartida: new UntypedFormControl(detalleSubpartida),
      data: new UntypedFormControl(data),
      undconcatrendi: new UntypedFormControl(undsel.unidad.toUpperCase()),
      filteredOptions: new UntypedFormControl([]),
      filasel: new UntypedFormControl(-1),
      codsoloiu: new UntypedFormControl(false),
      mcodigo: new UntypedFormControl(true),
      colselacu: new UntypedFormControl(false),
      idgruselacu: new UntypedFormControl(null),
      editarpreins:new UntypedFormControl(false),
      filasinserta: new UntypedFormControl([]),
      filaselimina: new UntypedFormControl([]),
      fuente:new UntypedFormControl(data.fuente),
      subpartidas:new UntypedFormControl(arraux)
    })
    if(this.bloquear){
      datosTab.disable();
    }
    this.formSubPartida.push(datosTab)
    this.active = this.formSubPartida.value.length - 1
  }
  cargarSubpartPestana(datos:any,arraux:any,id_partida:any){
    for(let fila1 of datos){
      if(fila1.id_partida==id_partida){
        arraux.push(JSON.parse(JSON.stringify(fila1)));
        if(fila1.id_subpartida){
          this.cargarSubpartPestana(datos,arraux,fila1.id_subpartida)
        }
      }
    }
  }
  async formDataSubPartida(partida): Promise<UntypedFormGroup> {
    let tipoP=this.tipoProy.find(ele=> ele.id_clasificacion==partida.tipo_proy);
    const inputidusuariols = this.encriptadorService.recuperarlocalstory('idusuario');
    let desab=this.inpfuente==1 && partida.fuente==0?true:false;
    const formDataPartida = new UntypedFormGroup({
      descripcion: new UntypedFormControl({value: partida.descripcion, disabled:desab}, [Validators.required]),
      unidad: new UntypedFormControl({value:Number(partida.id_unidad), disabled:desab}, [Validators.required]),
      precio: new UntypedFormControl({value:partida.precio, disabled:desab}, [Validators.required, Validators.min(0)]),
      rendimiento: new UntypedFormControl({value:partida.rendimiento!=null ? partida.rendimiento : '', disabled:desab}, []),
      undrendimiento: new UntypedFormControl({value:partida.und_rendi ? partida.und_rendi : '', disabled:desab}, []),
      jornada: new UntypedFormControl({value:partida.jornada, disabled:desab}, []),
      id_usuario: new UntypedFormControl({value:inputidusuariols, disabled:desab}, []),
      tipo_proy: new UntypedFormControl({value:tipoP, disabled:desab}),
    })
    formDataPartida.get('undrendimiento').disable();
    return formDataPartida
  }
  async closeModal(result: any = null) {
    if(this.bloquear){
      this.modal.close({cargadet:null,ultid:this.ultidpart});
    }
    else{
      if(this.formSubPartida.controls.length>0){
        const form = (this.formSubPartida.controls[this.active]) as UntypedFormGroup
        const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
        const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
        if (tabla_editada || dataSubPartidaEditada) {
          const respu=await SwalService.confirm('Esta seguro que desea Salir sin guardar los cambios?','');
          if(!respu.isConfirmed){
            return;
          }
          else{
            this.modal.close({cargadet:this.cargarDetallePartida,ultid:this.ultidpart})//pasar arreglo subpartidas? el arreglo principal cuando se edita?
          }
        }
        else{
          this.modal.close({cargadet:this.cargarDetallePartida,ultid:this.ultidpart})//pasar arreglo subpartidas? el arreglo principal cuando se edita?
        }
      }
      else{
        this.modal.close({cargadet:this.cargarDetallePartida,ultid:this.ultidpart})//pasar arreglo subpartidas? el arreglo principal cuando se edita?
      }
    }
  }
  async close(event: MouseEvent, toRemove: number) {
    const form = (this.formSubPartida.controls[toRemove]) as UntypedFormGroup
    const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
    const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
    if (tabla_editada || dataSubPartidaEditada) {
      const sw = await SwalService.confirm('Estas seguro?', 'Desea guardar los cambios realizados?')
      if (sw.isConfirmed) {
        await this.actualizar(toRemove)
      } else {
        await this.cerrarPestana(event, toRemove)
      }
    } else {
      await this.cerrarPestana(event, toRemove)

    }
  }
  async cerrarPestana(event: MouseEvent, toRemove: number) {
    if (!this.formSubPartida.value.length) {
      this.closeModal()
    } else {
      this.formSubPartida.removeAt(toRemove)
      if (!this.formSubPartida.value.length) {
        this.closeModal()
      }
      if(event){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      this.active = this.formSubPartida.value.length - 1
      for (let i = 0; i < this.formSubPartida.value.length; i++) {
        const form = (this.formSubPartida.controls[i]) as UntypedFormGroup
        const indicetab = form.get('indice_tab') as UntypedFormControl
        indicetab.setValue(i)
      }
    }
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
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async abrirDetalleTab(row, tab) {
    if (!row.id_partida) {
      this.toaster.error('Sub Partida no guardada', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return
    }
    const tabla_editada = this.formSubPartida.value[tab].tabla_editada
    const form = this.formSubPartida.controls[tab] as UntypedFormGroup
    if (tabla_editada || form.dirty) {
      this.toaster.error('Datos no Guardados', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return
    }

    let arraux=[];
    for(let fila1 of this.Arreglosubp){
      if(fila1.id_partida==row.id_subpartida){
        arraux.push(JSON.parse(JSON.stringify(fila1)));
      }
    }
    const encontrado = this.formSubPartida.value.some(ele => ele.data.id_subpartida == row.id_subpartida)
    if (encontrado) {
      this.toaster.error('Sub Partida ya abierta', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return
    }
    await this.agregartab(row, arraux)
  }
  toggleOn(condicion: any, indice2: any, numb) {
    const formSubpartida = (this.formSubPartida.controls[numb]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[indice2].icomost = 1;
    for (let i = indice2 + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 1;
        }
      }
      else { break; }
    }
  }
  toggleOff(condicion: any, indice2: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[indice2].icomost = 0;
    for (let i = indice2 + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 0;
        }
      }
      else { break; }
    }
  }
  async verificarDecimales(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    const undrendimiento= dataPartida.get('undrendimiento') as UntypedFormControl;
    if (rendimiento.dirty) {
      let valrendi = Number(rendimiento.value.toString().replace(/\,/g, ''));
      const rendiValido = await this.formsService.redondeo(valrendi, 2);
      rendimiento.setValue(rendiValido)
      if(valrendi==0){
        undrendimiento.setValue('GLOBAL');
      }
      else{
        undrendimiento.setValue('DIA');
      }
      for (let row of dataTabla) {
        if (row.num_det > 0 && row.afcuadrilla == 1 && row.operador!='%') {
          let cuadri = Number(row.cuadrilla);
          let aprecio = Number(row.precio);
          var canti=0;
          if(valrendi==0){
            row.cuadrilla=this.formsService.redondeo(0,8);
            canti=Number(row.cantidad);
          }else{
            if(cuadri==0 && aprecio!=0){
              canti=Number(row.cantidad);
              cuadri=(canti*valrendi)/Number(jornada.value.toString().replace(/\,/g,''));
              row.cuadrilla=this.formsService.redondeo(cuadri,8);
            }
            else{
              var canti=(cuadri*Number(jornada.value.toString().replace(/\,/g,'')))/valrendi;
            }
          }
          //var canti = (cuadri * Number(jornada.value.toString().replace(/\,/g, ''))) / valrendi;
          row.cantidad = this.formsService.redondeo(canti, this.dec_cant);
          row.parcial = this.formsService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.actualizarParcGrupos(tab);
    }
  }
  async verificarDecimalesJor(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    if (jornada.dirty) {
      let valjor = Number(jornada.value.toString().replace(/\,/g, ''));
      const jornValido = await this.formsService.redondeo(valjor, 0)
      jornada.setValue(jornValido)
      var arendi = Number(rendimiento.value.toString().replace(/\,/g, ''));
      for (let row of dataTabla) {
        if (row.num_det > 0 && row.afcuadrilla == 1 && row.operador!='%') {
          let cuadri = Number(row.cuadrilla);
          let aprecio = Number(row.precio);
          var canti = arendi==0?Number(row.cantidad):(cuadri * valjor) / arendi;
          row.cantidad = this.formsService.redondeo(canti, this.dec_cant);
          row.parcial = this.formsService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.actualizarParcGrupos(tab);
    }
  }
  actualizarParcGrupos(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    let precio = formSubpartida.get('precio') as UntypedFormControl
    let indgru = -1;
    let actgru;
    let parcialgru = 0;
    let parcgrusinporc=0;
    let sumtot = 0;
    for (let i = 0; i < dataTabla.length; i++) {
      if (dataTabla[i].num_det == 0) {
        if (indgru != -1) {
          sumtot += parcialgru;
          dataTabla[indgru].parcial = this.formsService.redondeo(parcialgru, this.dec_precio);
          this.actinsporc(dataTabla[indgru].id_tipo_insumo,parcgrusinporc,dataTabla[indgru].operador,tab);
        }
        indgru = i;
        actgru = dataTabla[i];
        parcialgru = 0;
        parcgrusinporc=0;
      }
      else {
        if (dataTabla[i].id_tipo_insumo == actgru.id_tipo_insumo) {
          parcialgru += Number(dataTabla[i].parcial)
          if(dataTabla[i].unidad != '' && dataTabla[i].operador==null){
            parcgrusinporc+=Number(dataTabla[i].parcial)
          }
        }
      }
    }
    if (indgru != -1) {
      sumtot += parcialgru;
      dataTabla[indgru].parcial = this.formsService.redondeo(parcialgru, this.dec_precio);
    }
    precio.setValue(this.formsService.redondeo(sumtot, this.dec_precio));
  }
  presentertRendi(event: any) {
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  editarceldat1(ind: any, tab) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    if(!(this.inpfuente==1 && form.get('fuente').value==0) && !this.bloquear){
      let dataTabla = form.get('data_tabla').value;
      if(dataTabla[ind].num_det!=0){
        dataTabla[ind].editar = 1;
      }
    }
  }
  editarceldat2(ind: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    if(!(this.inpfuente==1 && form.get('fuente').value==0) && !this.bloquear){
      let dataTabla = form.get('data_tabla').value;
      if(dataTabla[ind].num_det!=0){
        dataTabla[ind].editar3 = 1;
      }
    }
  }
  editarceldat3(ind: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    if(!(this.inpfuente==1 && form.get('fuente').value==0) && !this.bloquear){
      let dataTabla = form.get('data_tabla').value;
      if(dataTabla[ind].num_det!=0 && dataTabla[ind].operador==null && dataTabla[ind].esinsumo==1){
        dataTabla[ind].editar2 = 1;
      }
    }
  }
  actinsporc(id_tipo_ins:any,parcialsinporc:any,operador:any,tab:any){
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = form.get('data_tabla').value
    if(operador==null){
      for(let row of dataTabla){
        if(row.operador=="%" && row.tipo_insumo==id_tipo_ins){
          let cant=Number(row.cantidad);
          let newparc=(parcialsinporc*cant)/100;
          row.precio=this.formsService.redondeo(parcialsinporc,this.dec_precio);
          row.parcial=this.formsService.redondeo(newparc,this.dec_precio);
          this.Actparcialt1(row.id_tipo_insumo,tab)
        }
      }
    }
  }
  caneditarceldat1(eve: any, ind: any, tab) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (form.get('data_tabla') as UntypedFormControl).value
    const dataPartida = form.get('data_partida') as UntypedFormGroup
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind].cantidad)
    var aprecio = Number(dataTabla[ind].precio);
    dataTabla[ind].editar = 0;
    if (valor != actual) {
      let resparc=dataTabla[ind].operador=='%'?(valor*aprecio)/100:valor*aprecio;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      //calcular cuadrilla, si rendimiento es mayor a 0, sino no hace nada
      if(dataTabla[ind].afcuadrilla==1 && Number(rendimiento.value)!=0){
        let rescuad=(valor*Number(rendimiento.value))/Number(jornada.value);
        if(this.errormaxval(rescuad.toString(),'Cuadrilla',10,'El resultado de ')){ return }
        dataTabla[ind].cuadrilla =this.formsService.redondeo(rescuad,8);
      }
      dataTabla[ind].cantidad = this.formsService.redondeo(Number(valor), this.dec_cant);
      dataTabla[ind].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(dataTabla[ind].id_tipo_insumo,tab)
      this.actinsporc(dataTabla[ind].id_tipo_insumo,sumasinporc,dataTabla[ind].operador,tab);
    }
  }
  caneditarceldat2(eve: any, ind: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind].cuadrilla);
    var aprecio = Number(dataTabla[ind].precio);
    var rendi = Number(rendimiento.value);
    dataTabla[ind].editar3 = 0;
    if (valor != actual) {
      var canti = rendi==0?Number(dataTabla[ind].cantidad):(valor * Number(jornada.value)) / rendi;
      let resparc=dataTabla[ind].operador=='%'?(Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio)/100:Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      dataTabla[ind].cuadrilla = this.formsService.redondeo(Number(valor), 8);
      dataTabla[ind].cantidad = this.formsService.redondeo(canti, this.dec_cant);
      dataTabla[ind].parcial =this.formsService.redondeo(resparc, this.dec_precio);// valor*aprecio==0?'-':
      let sumasinporc=this.Actparcialt1(dataTabla[ind].id_tipo_insumo, tab)
      this.actinsporc(dataTabla[ind].id_tipo_insumo,sumasinporc,dataTabla[ind].operador,tab);
    }
  }
  async caneditarceldat3(eve: any, ind: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let editarpreins=form.get('editarpreins').value;
    let dataTabla = (form.get('data_tabla') as UntypedFormControl).value
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind].precio)
    var acantidad = Number(dataTabla[ind].cantidad);
    dataTabla[ind].editar2 = 0;
    if (valor != actual) {
      let resparc=dataTabla[ind].operador=='%'?(valor*acantidad)/100:valor*acantidad;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      dataTabla[ind].precio=this.formsService.redondeo(Number(valor), this.dec_precio);
      dataTabla[ind].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(dataTabla[ind].id_tipo_insumo,tab)
      this.actinsporc(dataTabla[ind].id_tipo_insumo,sumasinporc,dataTabla[ind].operador,tab);
      if(editarpreins && dataTabla[ind].id_insumo){//editar precio de insumo
        let resp=await this.configuracionService.ModificarPrecioInsumo({ id_insumo: dataTabla[ind].id_insumo,precio:dataTabla[ind].precio });
        if(resp[0]?.id==1){
          this.toaster.success(resp[0].mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else if(resp[0]?.id==0){
          this.toaster.error(resp[0].mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    }
  }
  presentert1(event: any, ind: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if (event.keyCode.toString() == "27") {//esc descartar los cambios
      this.caneditarceldat1(dataTabla[ind].cantidad, ind, tab)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            dataTabla[i].editar = 1;
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            dataTabla[i].editar = 1;
            break;
          }
        }
      }
    }
  }
  presentert2(event: any, ind: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if (event.keyCode.toString() == "27") {//esc descartar los cambios
      this.caneditarceldat2(dataTabla[ind].cuadrilla, ind, tab)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            if(dataTabla[i].afcuadrilla==0 || dataTabla[i].operador=='%'){
              dataTabla[i].editar = 1;
            }
            else{
              dataTabla[i].editar3 = 1;
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            if(dataTabla[i].afcuadrilla==0 || dataTabla[i].operador=='%'){
              dataTabla[i].editar = 1;
            }
            else{
              dataTabla[i].editar3 = 1;
            }
            break;
          }
        }
      }
    }
  }
  presentert3(event: any, ind: any,tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat3(dataTabla[ind].precio,ind,tab)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '' && dataTabla[i].operador==null && dataTabla[i].esinsumo==1) {
            dataTabla[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '' && dataTabla[i].operador==null && dataTabla[i].esinsumo==1) {
            dataTabla[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
  }
  Actparcialt1(idtipo: any, tab) {
    let indgrupo = -1;
    let suma = 0;
    let sumasinporc=0;
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
    const precio = formSubpartida.get('precio') as UntypedFormControl
    const tabla_editada = formSubpartida.get('tabla_editada') as UntypedFormControl
    let dataTabla = tabla.value
    for (let i = 0; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == idtipo && dataTabla[i].unidad == '') {
        indgrupo = i;
      }
      if (dataTabla[i].id_tipo_insumo == idtipo && dataTabla[i].unidad != '') {
        suma += Number(dataTabla[i].parcial)
      }
      if(dataTabla[i].id_tipo_insumo == idtipo && dataTabla[i].unidad != '' && dataTabla[i].operador==null){
        sumasinporc+=Number(dataTabla[i].parcial)
      }
    }
    if (indgrupo >= 0) {
      let parcant = Number(dataTabla[indgrupo].parcial);
      let difer = parcant - suma;
      dataTabla[indgrupo].parcial = this.formsService.redondeo(suma, this.dec_precio);
      //total tabla
      let tottem = Number(precio.value);
      precio.setValue(this.formsService.redondeo(tottem - difer, this.dec_precio));
      tabla_editada.setValue(true)
    }
    return sumasinporc;
  }
  errormaxval(valor,tetval,nenteros,txtini='Un valor de '){
    if(valor.includes('.')){
      let numar=valor.split('.');
      if(numar[0].length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 8000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    else{
      if(valor.length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 8000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    return false;
  }
  async actualizar(tab) {//guardar cambios
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
      const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
      const formpartida = formSubpartida.get('data_partida') as UntypedFormGroup
      const cambios = formSubpartida.get('cambiossubpartidas') as UntypedFormControl
      const data1 = formSubpartida.get('data') as UntypedFormGroup
      const precio = formSubpartida.get('precio') as UntypedFormGroup
      const subpartidas = formSubpartida.get('subpartidas') as UntypedFormGroup
      let dataTabla = tabla.value
      let formValue = formpartida.value
      let cambiossubpartidas = cambios.value
      let row = data1.value
      if (formpartida.invalid) {
        formpartida.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        let existeceros = 0;
        for (let i = 0; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '') {
            if(Number(dataTabla[i].cantidad) == 0){
              existeceros = 1;
            }
            let cuadr=dataTabla[i].cuadrilla?dataTabla[i].cuadrilla.toString():'';
            if(this.errormaxval(cuadr,'Cuadrilla',10)){ return }
            let cantr=dataTabla[i].cantidad.toString();
            if(this.errormaxval(cantr,'Cantidad',10)){ return }
            let precior=dataTabla[i].precio.toString();
            if(this.errormaxval(precior,'Precio',10)){ return }
            let parcr=dataTabla[i].parcial.toString();
            if(this.errormaxval(parcr,'Parcial',10)){ return }
          }
        }
        //si es principal afecta a otra tabla, sino a arreglosubpartidas
        let datosform=formpartida.getRawValue();
        if(this.partida.id_subpartida==row.id_subpartida){//principal
          let undsel=this.medidas.find(ele=>ele.id_unidad==formValue.unidad);
          this.partida.advceros=existeceros;
          this.partida.id_unidad=formValue.unidad;
          this.partida.unidad=undsel.unidad;
          this.partida.descripcion=formValue.descripcion.toUpperCase();
          this.partida.jornada=formValue.jornada;
          this.partida.precio=precio.value;
          let cantact=Number(this.partida.cantidad);
          this.partida.parcial=this.formsService.redondeo(cantact*Number(precio.value),this.dec_precio);
          this.partida.rendimiento=formValue.rendimiento;
          this.partida.und_rendi=datosform.undrendimiento;
        }
        else{//subpartidas de subpartidas
          for(let filasub of this.Arreglosubp){//actualizar tambien en arreglos abiertos?
            if(filasub.id_subpartida==row.id_subpartida){
              let undsel=this.medidas.find(ele=>ele.id_unidad==formValue.unidad);
              filasub.advceros=existeceros;
              filasub.id_unidad=formValue.unidad;
              filasub.unidad=undsel.unidad;
              filasub.descripcion=formValue.descripcion.toUpperCase();
              filasub.jornada=formValue.jornada;
              filasub.precio=precio.value;
              let cantact=Number(filasub.cantidad);
              filasub.parcial=this.formsService.redondeo(cantact*Number(precio.value),this.dec_precio);
              filasub.rendimiento=formValue.rendimiento;
              filasub.und_rendi=datosform.undrendimiento;
              //actualizar datos de los padres recursivamente
              this.RefreshPadre(filasub);
            }
          }
        }
        tablaeditada.setValue(false)
        cambios.setValue([])
        //gurdar cambios en tabla subpartidas
        let arrideli=[];
        arrideli.push(row.id_subpartida)
        for(let m=0;m<this.Arreglosubp.length;m++){//eliminar datos anteriores
          if(this.Arreglosubp[m].id_partida==row.id_subpartida){
            if(this.Arreglosubp[m].id_subpartida){
              this.AddideliDetSubp(arrideli,this.Arreglosubp[m].id_subpartida)
              arrideli.push(this.Arreglosubp[m].id_subpartida);
            }
          }
        }
        for(let b=0;b<this.Arreglosubp.length;b++){
          let exist=arrideli.find(ele=>ele==this.Arreglosubp[b].id_partida)
          if(exist){
            this.Arreglosubp.splice(b,1);
            b--;
          }
        }
        for(let row of dataTabla){//asignar variables que le corresponden ids,idsub?
          this.Arreglosubp.push(JSON.parse(JSON.stringify(row)));
          if(row.id_subpartida){//una nueva subpartida tiene subpartidas, que se deben agregar al arreglo subpartidas, usar arreglo creado
            this.cargarSubpartPestana(subpartidas.value,this.Arreglosubp,row.id_subpartida);
          }
        }

        let detallesubpartida = formSubpartida.get('detalleSubpartida') as UntypedFormControl
        detallesubpartida.setValue(dataTabla)
        let data_tabla = formSubpartida.get('data_tabla') as UntypedFormControl
        data_tabla.setValue(dataTabla)

        //actualizar todas las filas dependientes de una subpartida?
        let index = 0;
        let auxactive=JSON.parse(JSON.stringify(this.active));
        for await (const file of this.formSubPartida.value) {
          const formSubpartida2 = (this.formSubPartida.controls[index]) as UntypedFormGroup
          const data1 = formSubpartida2.get('data') as UntypedFormGroup
          if(row.id_subpartida!=data1.value.id_subpartida){//no actualizar el actual
            //eliminar si no existe
            let exist=this.partida.id_subpartida==data1.value.id_subpartida;
            if(!exist){
              exist=this.Arreglosubp.find(ele=>ele.id_subpartida==data1.value.id_subpartida);
            }
            if(exist){
              let arraux=[];
              let arrdet=[];
              let tablabusq=JSON.parse(JSON.stringify(this.Arreglosubp));
              for(let fila1 of tablabusq){
                if(data1.value.id_subpartida==fila1.id_partida){
                  arrdet.push(JSON.parse(JSON.stringify(fila1)));
                }
                if(fila1.id_partida==data1.value.id_subpartida){
                  //arraux.push(JSON.parse(JSON.stringify(fila1)));
                  if(fila1.id_subpartida){
                    this.cargarSubpartPestana(tablabusq,arraux,fila1.id_subpartida)
                  }
                }
              }
              const datosPartida = await this.formDataSubPartida(data1.value)
              formSubpartida2.patchValue({
                indice_tab: index,
                data_partida: datosPartida.controls.value,
                data_tabla: arrdet,
                tabla_editada: false,
                precio: data1.value.precio,
                cambiossubpartidas: [],
                //row: row,
                detalleSubpartida: arrdet,
                data: data1.value,
                undconcatrendi: data1.value.unidad,
                filteredOptions: [],
                filasel:-1,
                colselacu:false,
                idgruselacu:null,
                editarpreins:false,
                filasinserta:[],
                filaselimina:[],
                subpartidas:arraux
              })
              formSubpartida2.markAsPristine()
            }
            else{
              this.close(null,index);
              index--;
            }
          }
          index++
        }
        formSubpartida.markAsPristine();
        this.active=auxactive;
        this.cargarDetallePartida = true
        this.mostrar_carga_todo = false;
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  RefreshPadre(filasub:any){//corregir solo en arreglosubpartidas
    let arraux=[];
    let filapadre;
    for(let filaaux of this.Arreglosubp){//actualizar tambien en arreglos abiertos?
      if(filasub.id_partida==filaaux.id_partida){
        arraux.push(filaaux);
      }
      //actualizar agrupacion y total del padre y hacer recursivo
      if(filasub.id_partida==filaaux.id_subpartida){
        filapadre=filaaux;
      }
    }
    //corregir totales y el padre
    let sumasubp=0;
    let sumtot=0;
    let indagru=-1;
    for(let a=0;a<arraux.length;a++){
      sumtot+=arraux[a].num_det>0?Number(arraux[a].parcial):0;
      if(arraux[a].id_tipo_insumo==5){
        sumasubp+=arraux[a].num_det>0?Number(arraux[a].parcial):0;
        indagru=arraux[a].num_det==0?a:indagru;
      }
    }
    arraux[indagru].parcial=this.formsService.redondeo(sumasubp,this.dec_precio);
    if(filapadre){
      filapadre.precio=this.formsService.redondeo(sumtot,this.dec_precio);
      let cantact=Number(filapadre.cantidad);
      filapadre.parcial=this.formsService.redondeo(cantact*Number(filapadre.precio),this.dec_precio);
      this.RefreshPadre(filapadre);
    }
    else{//puede ser el principal
      if(this.partida.id_subpartida==filasub.id_partida){//actualizar el padre
        this.partida.precio=this.formsService.redondeo(sumtot,this.dec_precio);
        let cantact=Number(this.partida.cantidad);
        this.partida.parcial=this.formsService.redondeo(cantact*Number(this.partida.precio),this.dec_precio);
      }
    }
  }
  AddideliDetSubp(arrideli:any,id_subpartida:any){
    for(let m=0;m<this.Arreglosubp.length;m++){//eliminar datos anteriores
      if(this.Arreglosubp[m].id_partida==id_subpartida){
        if(this.Arreglosubp[m].id_subpartida){
          this.AddideliDetSubp(arrideli,this.Arreglosubp[m].id_subpartida)
          arrideli.push(this.Arreglosubp[m].id_subpartida);
        }
      }
    }
  }
  async cambioTab(changeEvent) {
    const form = (this.formSubPartida.controls[this.active]) as UntypedFormGroup
    const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
    const partida = form.value.data.descripcion
    const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
    if (tabla_editada || dataSubPartidaEditada) {
      if (changeEvent.nextId !== this.active) {
        changeEvent.preventDefault();
        this.toaster.error('Guarde o descarte cambios realizados', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      }
    } else {

    }
  }
  async descartarCambios(numb) {
    const form = (this.formSubPartida.controls[numb]) as UntypedFormGroup
    const row = form.get('data').value
    const partida = (form.get('data') as UntypedFormControl).value
    const undconcatrendi = (form.get('undconcatrendi') as UntypedFormControl).value
    const data_partida = form.get('data_partida') as UntypedFormGroup
    const detalle_subpartida = form.get('detalleSubpartida').value
    let tipoP=this.tipoProy.find(ele=> ele.id_clasificacion==partida.tipo_proy);
    data_partida.patchValue({
      descripcion: partida.descripcion,
      unidad: Number(partida.id_unidad),
      precio: partida.precio,
      rendimiento: partida.rendimiento,
      undrendimiento: partida.und_rendi,
      jornada: partida.jornada,
      id_usuario: this.id_user,
      tipo_proy: tipoP,
    })
    let undsel=this.medidas.find(ele=>ele.id_unidad==partida.id_unidad);
    let detallepartida=[];
    let subpartaux=[];
    for(let fila1 of this.Arreglosubp){
      if(fila1.id_partida==row.id_subpartida){
        detallepartida.push(JSON.parse(JSON.stringify(fila1)));
        if(fila1.id_subpartida){//subpartidas
          this.cargarSubpartPestana(this.Arreglosubp,subpartaux,fila1.id_subpartida);
        }
      }
    }
    form.patchValue({
      data_tabla: detallepartida,
      tabla_editada: false,
      precio: partida.precio,
      cambiossubpartidas: [],
      undconcatrendi: undsel.unidad,
      filteredOptions: [],
      subpartidas:subpartaux
    })
    form.markAsPristine()
  }
  //metodos agregados
  AgregarFilaBut(tab){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
    let indselfila = formSubpartida.get('filasel').value;
    let dataTabla = tabla.value
    if(indselfila>-1){
      let rowsel=dataTabla[indselfila];
      if(rowsel.num_det==0){
        this.AgregarFilaIns(1,tab)
      }
      else{
        this.AgregarFilaIns(3,tab)
      }
    }
    else{
      this.toaster.error('Seleccione una fila para agregar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async AgregarFilaIns(donde: any, tab: any) {//0:inicio,1:final,2:sobre,3:bajo
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
      /* const cambios = formSubpartida.get('cambiossubpartidas') as FormControl
      let cambiossubpartidas = cambios.value */
      const editada = formSubpartida.get('tabla_editada') as UntypedFormControl
      const datosrow = formSubpartida.get('data') as UntypedFormControl
      let indselfila = formSubpartida.get('filasel').value;
      const formpartida = formSubpartida.get('data_partida') as UntypedFormGroup
      const subpartidas = formSubpartida.get('subpartidas') as UntypedFormGroup
      let formValue = formpartida.value
      let dataTabla = tabla.value
      if (indselfila > -1) {
        let rowsel = dataTabla[indselfila];
        if(rowsel.num_det==0){//agrupacion
          if(donde==2 || donde==3){
            this.toaster.error('No se puede agregar '+(donde==2?'sobre la selección.':'bajo la selección.'),'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            return;
          }
        }
        if (rowsel.esinsumo == 1) {//insumos
          this.mostrar_carga_todo = true;
          let arrexisten = []
          let filagru;
          for (let row of dataTabla) {
            if (row.id_tipo_insumo == rowsel.id_tipo_insumo && row.num_det != 0) {
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false/* no cerrar el modal con ESC */ })
          this.mostrar_carga_todo = false
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.inpfuente=this.inpfuente;
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(dataTabla));
          const result = await modalRef.result
          if (result?.length > 0) {
            let admitidos = []
            for (let filaadd of result) {
              let existe = false;
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == filaadd.id_tipo_insumo && dataTabla[i].id_insumo == filaadd.id_insumo) {
                  existe = true;
                }
              }
              if (!existe) {
                admitidos.push(filaadd);
              }
            }
            this.procesando=true;
            let indins = 0;
            let nuevnumdet = 0;
            if (donde == 0) {
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det == 0) {
                  indins = i + 1;
                  nuevnumdet = 1;
                }
                else {
                  if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det != 0) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
            }
            else {
              let indbusq = donde == 3 ? indselfila + 1 : indselfila;
              indins = donde == 3 ? indselfila + 1 : indselfila;
              nuevnumdet = donde == 3 ? Number(dataTabla[indselfila].num_det) + 1 : Number(dataTabla[indselfila].num_det);
              for (let i = indbusq; i < dataTabla.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if (donde != 1) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
                else {
                  if (donde == 1) {
                    indins = i;
                    nuevnumdet = Number(dataTabla[i - 1].num_det) + 1;
                    break;
                  }
                }
              }
            }
            let nronuevo = donde == 0 ? 1 : nuevnumdet;
            for (let filaadd of admitidos) {
              let preciogru=0;
              if(filaadd.tipo_insumo){
                for(let rowpri of dataTabla){
                  if(rowpri.num_det>0 && rowpri.id_tipo_insumo==filaadd.tipo_insumo && rowpri.operador==null){
                    preciogru+=Number(rowpri.parcial);
                  }
                }
              }
              //calcular total de cantidad o con cuadrilla, tambien ver si agrega algun porcentaje
              let cuadpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?filaadd.cantidad:0;
              let cantpasa=0;
              let preciopasa=0;
              let parccal=0;
              if(filaadd.cantidad && Number(filaadd.cantidad)!=0){
                var canti=0;
                if(rowsel.afcuadrilla==1 && filaadd.operador!='%'){
                  canti=Number(formValue.rendimiento.toString())==0?Number(filaadd.cantidad):(cuadpasa*Number(formValue.jornada.toString().replace(/\,/g,'')))/Number(formValue.rendimiento.toString());
                }
                cantpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?(this.formsService.redondeo(canti,this.dec_cant)):filaadd.cantidad;
                preciopasa=preciogru>0?preciogru:filaadd.precio;//filaadd.operador=='%'?():filaadd.precio;//buscar precio de agrupacion, si cumple condicion buscar, sino no, usar preciogru
                parccal=filaadd.operador=='%'?(Number(cantpasa)*Number(preciopasa))/100 :Number(cantpasa)*Number(preciopasa);//condicionar si se opera con porcentaje
              }
              else{
                preciopasa=preciogru>0?preciogru:filaadd.precio;
              }
              let agrega: rowinsumo = {
                id_partida: datosrow.value.id_subpartida,//this.datasourcePri[this.filaSel].id_partida,
                id_tipo_insumo: filaadd.id_tipo_insumo,
                num_det: nronuevo++,
                codigo: filaadd.codigo,
                id_unidad:filaadd.id_unidad,
                descripcion: filaadd.descripcion,
                unidad: filaadd.unidad,
                operador:filaadd.operador,
                tipo_insumo:filaadd.tipo_insumo,
                cuadrilla: rowsel.afcuadrilla==1?(filaadd.cantidad??0):0,
                cantidad: cantpasa,
                precio: preciopasa,
                parcial: this.formsService.redondeo(parccal,this.dec_precio),
                id_insumo: filaadd.id_insumo,
                id_clasificacion:filaadd.id_clasificacion,
                id_indice: filaadd.id_indice,
                id_subpartida: null,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: rowsel.afcuadrilla,
                rendimiento:null,
                und_rendi:null,
                jornada:null,
                advceros:null,
                afectaref: null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: -1,//this.datasourcePriacu.length,
                seleccion: 0
              };
              dataTabla.splice(indins, 0, agrega);
              editada.setValue(true);
              indins++;
            }
            indselfila = (donde == 0 && rowsel.num_det != 0) || donde == 2 ? indselfila + admitidos.length : indselfila;
            formSubpartida.get('filasel').setValue(indselfila);
            if (result.length != admitidos.length) {
              let difer = result.length - admitidos.length;
              this.toaster.error(difer + ' insumos ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
            if(admitidos.length>0){
              let insumosauto=await this.catalogosService.ListarInsumosAddAuto({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
              for(let rowauto of insumosauto){
                let indexis=dataTabla.find(elem=> elem.id_insumo==rowauto.id_insumo);
                if(!indexis){
                  let preciogru=0;
                  let indagre=-1;
                  let numdetadd=-1;
                  let existipo=false;
                  for(let im=0;im<dataTabla.length;im++){
                    if(dataTabla[im].num_det>0 && dataTabla[im].id_tipo_insumo==rowauto.tipo_insumo && dataTabla[im].operador==null){
                      preciogru+=Number(dataTabla[im].parcial);
                    }
                    if(!existipo && dataTabla[im].id_tipo_insumo==rowauto.id_tipo_insumo){
                      existipo=true;
                    }
                    if(existipo && dataTabla[im].id_tipo_insumo!=rowauto.id_tipo_insumo && indagre==-1){
                      numdetadd=(Number(dataTabla[im-1].num_det))+1;
                      indagre=im;
                    }
                  }
                  let agrega:rowinsumo = {
                    id_partida: datosrow.value.id_subpartida,
                    num_det: numdetadd,//posicion
                    codigo:rowauto.codigo,
                    descripcion: rowauto.descripcion,
                    id_unidad:rowauto.id_unidad,
                    unidad: rowauto.unidad,
                    operador:rowauto.operador,
                    tipo_insumo:rowauto.tipo_insumo,
                    cuadrilla: 0,
                    cantidad: 0,
                    precio: preciogru,
                    parcial: 0,
                    id_tipo_insumo: rowauto.id_tipo_insumo,
                    id_insumo: rowauto.id_insumo,
                    id_clasificacion:rowauto.id_clasificacion,
                    id_indice: rowauto.id_indice,
                    id_subpartida: null,
                    esinsumo:rowsel.esinsumo,
                    afcuadrilla:rowsel.afcuadrilla,
                    rendimiento:null,
                    und_rendi:null,
                    jornada:null,
                    advceros:null,
                    //afectaref:null,
                    icomost: '1',
                    mostrar: rowsel.icomost == '1' ? '1' : '0',
                    editar: 0,
                    editar2:0,
                    ind:dataTabla.length,
                    seleccion:0,
                    afectaref:null,
                  };
                  dataTabla.splice(indagre,0,agrega);
                }
              }
            }
            this.procesando=false;
            //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
            let sumasinporc=this.Actparcialt1(rowsel.id_tipo_insumo,tab)
            this.actinsporc(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador,tab);
          }
        }
        else {//subpartidas
          let rowcondi = JSON.parse(JSON.stringify(datosrow.value))
          rowcondi.id_partida = datosrow.value.id_subpartida;
          this.mostrar_carga_todo = true;
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user, fuente: this.inpfuente, tipo_proy: this.tipoproysel??'', idpadre: rowcondi.id_partida??'', restriccion: rowcondi.referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(BusqpartcatComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
          modalRef.componentInstance.partidacondiciona = rowcondi;
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy = this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipoproysel;//cargar los tipos de proyecto
          modalRef.componentInstance.fuentecrea=this.inpfuente;
          modalRef.componentInstance.fondo = this.fondo;
          modalRef.componentInstance.color = this.color;
          modalRef.componentInstance.letra = this.letra;
          modalRef.componentInstance.medidas = this.medidas;
          modalRef.componentInstance.inpfuente = this.inpfuente;
          this.mostrar_carga_todo = false;
          const result = await modalRef.result
          if (result.response) {
            let admitidos = [];
            let titsubtitulos = 0;
            for (let filaadd of result.response) {
              if (filaadd.esgrupo == 1) {
                let existe = false;
                for (let i = 0; i < dataTabla.length; i++) {
                  if (dataTabla[i].esinsumo == 0 && filaadd.esgrupo == 1 && dataTabla[i].descripcion == filaadd.descripcion) {
                    existe = true;
                  }
                }
                if (!existe) {
                  admitidos.push(filaadd);
                }
              }
              else {
                titsubtitulos++;
              }
            }
            this.procesando=true;
            let indins = 0;
            let nuevnumdet = 0;
            if (donde == 0) {
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det == 0) {
                  indins = i + 1;
                  nuevnumdet = 1;
                }
                else {
                  if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det != 0) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
            }
            else {
              let indbusq = donde == 3 ? indselfila + 1 : indselfila;
              indins = donde == 3 ? indselfila + 1 : indselfila;
              nuevnumdet = donde == 3 ? Number(dataTabla[indselfila].num_det) + 1 : Number(dataTabla[indselfila].num_det);
              let tienecont = false;
              for (let i = indbusq; i < dataTabla.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if (donde != 1) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
              if (!tienecont && donde == 1) {
                indins = dataTabla.length;
                nuevnumdet = dataTabla[dataTabla.length - 1].num_det + 1;
              }
            }
            let nronuevo = donde == 0 ? 1 : nuevnumdet;
            for (let filaadd of admitidos) {
              let newidpart=this.ultidpart++;
              let agrega: rowinsumo = {
                id_partida: rowsel.id_partida,//this.datasourcePri[this.filaSel].id_partida,
                id_tipo_insumo: rowsel.id_tipo_insumo,
                num_det: nronuevo++,
                codigo: null,
                descripcion: filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad:filaadd.unidad,
                operador:null,
                tipo_insumo:null,
                cuadrilla: 0,
                cantidad: 0,
                precio: filaadd.precio,
                parcial: 0,
                id_insumo: null,
                id_clasificacion:null,
                id_indice: null,
                id_subpartida: newidpart,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: 0,
                rendimiento:filaadd.rendimiento,
                und_rendi:filaadd.und_rendi,
                jornada:filaadd.jornada,
                advceros:filaadd.advceros,
                afectaref: 1,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: dataTabla.length,
                seleccion: 0
              };
              /* if (cambiossubpartidas.length) {
                for (let j = 0; j < cambiossubpartidas.length; j++) {
                  if (cambiossubpartidas[j].id_subpartida == agrega.id_subpartida) {
                    cambiossubpartidas.splice(j, 1);
                  }
                }
              } else {
                cambiossubpartidas.push(agrega);
              } */
              dataTabla.splice(indins, 0, agrega);
              editada.setValue(true);
              indins++;
              //agregar detalle de filas admitidas, tambien recuperar de bd si es de catalogo
              if(result.donde==0){
                let tablas = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
                if(tablas.length>0){
                  for(let fil1 of tablas[0]){//detalle
                    let filacop=JSON.parse(JSON.stringify(fil1))
                    filacop.id_partida=newidpart;
                    if(filacop.id_subpartida){
                      let newsubp=this.ultidpart++;
                      this.cargarSubpartidas(tablas[1],fil1.id_subpartida,newsubp,subpartidas.value);
                      filacop.id_subpartida=newsubp;
                    }
                    subpartidas.value.push(filacop);//dar formato de bd
                  }
                }
              }
              else{//nuevo
                for(let row of result.arrsubpart){
                  if(row.id_partida==filaadd.id_partida){
                    let filacop=JSON.parse(JSON.stringify(row))
                    filacop.id_partida=newidpart;//asignar nuevos ids?
                    if(filacop.id_subpartida){
                      let newsubp=this.ultidpart++;
                      this.cargarSubpartidas(result.arrsubpart,row.id_subpartida,newsubp,subpartidas.value);
                      filacop.id_subpartida=newsubp;
                    }
                    subpartidas.value.push(filacop);//dar formato de bd?
                  }
                }
              }
            }
            this.procesando=false;
            indselfila = (donde == 0 && rowsel.num_det != 0) || donde == 2 ? indselfila + admitidos.length : indselfila;
            formSubpartida.get('filasel').setValue(indselfila);
            if ((result.response.length - titsubtitulos) != admitidos.length) {
              let difer = (result.response.length - titsubtitulos) - admitidos.length;
              this.toaster.error(difer + ' subpartida(s) ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
          }
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
    }
  }
  cargarSubpartidas(datos:any,id_subp:any,newid:any,arrfin:any){
    for(let fil2 of datos){//subpartidas //recursivo
      let filacop=JSON.parse(JSON.stringify(fil2));
      if(filacop.id_partida==id_subp){
        filacop.id_partida=newid;
        if(filacop.id_subpartida){
          let newsubp=this.ultidpart++;
          this.cargarSubpartidas(datos,filacop.id_subpartida,newsubp,arrfin);
          filacop.id_subpartida=newsubp;
        }
        arrfin.push(filacop);
      }
    }
  }
  OpcCodigo(opc: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let mcodigo = formSubpartida.get('mcodigo');
    let codsoloiu = formSubpartida.get('codsoloiu');
    if (opc == 1) {//ver codigo
      mcodigo.setValue(true);
      codsoloiu.setValue(false);
    }
    else if (opc == 2) {//ver indice unif
      mcodigo.setValue(true);
      codsoloiu.setValue(true);
    }
    else if (opc == 3) {//ocultar codigo
      mcodigo.setValue(false);
    }
  }
  HabSelAcu(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabladet = formSubpartida.get('data_tabla') as UntypedFormControl
    let colselacu = formSubpartida.get('colselacu');
    let idgruselacu = formSubpartida.get('idgruselacu');
    colselacu.setValue(!colselacu.value);
    idgruselacu.setValue(null);
    for (let row of tabladet.value) {
      row.seleccion = 0;
    }
  }
  Cambioseltacu(row, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabladet = formSubpartida.get('data_tabla').value;
    let idgruselacu = formSubpartida.get('idgruselacu');
    if (!idgruselacu.value) {
      idgruselacu.setValue(row.id_tipo_insumo);
    }
    if (row.seleccion == 0) {
      if (idgruselacu.value == row.id_tipo_insumo) {
        row.seleccion = 1;
      }
      else {
        row.seleccion = 1;
        idgruselacu.setValue(row.id_tipo_insumo);
        for (let row2 of tabladet) {
          if (row2.id_tipo_insumo != row.id_tipo_insumo) {
            row2.seleccion = 0;
          }
        }
      }
    }
    else { row.seleccion = 0; }
  }
  SubirFilaIns(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let tabladet = formSubpartida.get('data_tabla').value;
    let colselacu = formSubpartida.get('colselacu').value;
    let indselfila = formSubpartida.get('filasel').value;
    const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
    if (colselacu) {//seleccion multiple
      let arrsel = [];
      let arrindic = [];
      for (let i = 0; i < tabladet.length; i++) {
        if (tabladet[i].seleccion == 1) {
          arrsel.push(tabladet[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for (let j = 0; j < arrsel.length; j++) {
          let sube = tabladet[arrindic[j]];
          let baja = tabladet[arrindic[j] - 1];
          if (baja.seleccion == 0 && baja.num_det > 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;;
            tabladet[arrindic[j]] = baja;
            tabladet[arrindic[j] - 1] = sube;
          }
        }
        tablaeditada.setValue(true);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else {
      if (indselfila > -1) {
        let sube = tabladet[indselfila];
        let baja = tabladet[indselfila - 1];
        if (sube.num_det != 0) {
          if (baja.num_det != 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;;
            tabladet[indselfila] = baja;
            tabladet[indselfila - 1] = sube;
            indselfila = indselfila - 1;
            formSubpartida.get('filasel').setValue(indselfila);
            tablaeditada.setValue(true);
          }
          else {
            this.toaster.error('Ya no se puede subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('La fila seleccionada no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
  }
  BajarFilaIns(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let tabladet = formSubpartida.get('data_tabla').value;
    let colselacu = formSubpartida.get('colselacu').value;
    let indselfila = formSubpartida.get('filasel').value;
    const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
    if (colselacu) {//seleccion multiple
      let arrsel = [];
      let arrindic = [];
      for (let i = 0; i < tabladet.length; i++) {
        if (tabladet[i].seleccion == 1) {
          arrsel.push(tabladet[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for (let j = arrsel.length - 1; j >= 0; j--) {
          let sube = tabladet[arrindic[j] + 1];
          let baja = tabladet[arrindic[j]];
          if (sube.seleccion == 0 && sube.num_det > 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;
            tabladet[arrindic[j]] = sube;
            tabladet[arrindic[j] + 1] = baja;
          }
        }
        tablaeditada.setValue(true);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else {
      if (indselfila > -1) {
        if (indselfila < tabladet.length - 1) {
          let sube = tabladet[indselfila + 1];
          let baja = tabladet[indselfila];
          if (baja.num_det != 0) {
            if (sube.num_det != 0) {
              sube.num_det = sube.num_det - 1;
              baja.num_det = baja.num_det + 1;;
              tabladet[indselfila] = sube;
              tabladet[indselfila + 1] = baja;
              indselfila = indselfila + 1;
              formSubpartida.get('filasel').setValue(indselfila);
              tablaeditada.setValue(true);
            }
            else {
              this.toaster.error('Ya no se puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
          }
          else {
            this.toaster.error('La fila seleccionada no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('Ya no se puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
  }
  async EliminarIns(tab: any) {
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      let tabladet = formSubpartida.get('data_tabla').value;
      let colselacu = formSubpartida.get('colselacu').value;
      let indselfila = formSubpartida.get('filasel').value;
      let cambiossubpartidas = formSubpartida.get('cambiossubpartidas').value;
      let filaseli = formSubpartida.get('filaselimina').value;
      const subpartidas = formSubpartida.get('subpartidas') as UntypedFormGroup
      if (colselacu) {//seleccion multiple
        let arrsel = [];
        let arrindic = [];
        for (let i = 0; i < tabladet.length; i++) {
          if (tabladet[i].seleccion == 1) {
            arrsel.push(tabladet[i]);
            arrindic.push(i);
          }
        }
        if (arrsel.length > 0) {
          const respu = await SwalService.confirm('Esta seguro que desea Eliminar?', '');
          if (!respu.isConfirmed) {
            return;
          }
          let tipoinsactporc;
          for (let j = 0; j < arrsel.length; j++) {
            if(!tipoinsactporc){
              tipoinsactporc=!(tabladet[arrindic[j]].operador)?tabladet[arrindic[j]].id_tipo_insumo:tipoinsactporc;
            }
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(tabladet[arrindic[j]].esinsumo==0){
              let arrideli=[];
              arrideli.push(tabladet[arrindic[j]].id_subpartida)
              for(let m=0;m<subpartidas.value.length;m++){//eliminar datos anteriores
                if(subpartidas.value[m].id_partida==tabladet[arrindic[j]].id_subpartida){
                  if(subpartidas.value[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,subpartidas.value[m].id_subpartida)
                    arrideli.push(subpartidas.value[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<subpartidas.value.length;b++){
                let exist=arrideli.find(ele=>ele==subpartidas.value[b].id_partida)
                if(exist){
                  subpartidas.value.splice(b,1);
                  b--;
                }
              }
            }
            //fin es subpartida
            for (let k = arrindic[j] + 1; k < tabladet.length; k++) {//actualizar nuevos num_det
              if (tabladet[k].id_tipo_insumo == arrsel[j].id_tipo_insumo) {
                let newind = tabladet[k].num_det - 1;
                tabladet[k].num_det = newind;
              }
              let indact = tabladet[k].ind;
              if (indact > arrsel[j].ind) {//actualizar ind si es mayor al eliminado
                tabladet[k].ind = tabladet[k].ind - 1;
              }
            }
            if (arrsel[j].esinsumo == 0) {
              filaseli.push(arrsel[j]);
            }
            tabladet.splice(arrindic[j], 1);
            for (let a = j + 1; a < arrindic.length; a++) {
              arrindic[a] = arrindic[a] - 1;
            }
          }
          let sumasinporc=this.Actparcialt1(arrsel[0].id_tipo_insumo, tab);
          this.actinsporc(tipoinsactporc,sumasinporc,null,tab);
        }
        else {
          this.toaster.error('Seleccione insumos para eliminar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {//seleccion individual
        if (indselfila > -1) {
          if (tabladet[indselfila].num_det != 0) {
            const respu = await SwalService.confirm('Esta seguro que desea Eliminar?', '');
            if (!respu.isConfirmed) {
              return;
            }
            let indpri = tabladet[indselfila].ind;
            let tipoinssel = tabladet[indselfila].id_tipo_insumo;
            let operadorsel=tabladet[indselfila].operador;
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(tabladet[indselfila].esinsumo==0){
              let arrideli=[];
              arrideli.push(tabladet[indselfila].id_subpartida)
              for(let m=0;m<subpartidas.value.length;m++){//eliminar datos anteriores
                if(subpartidas.value[m].id_partida==tabladet[indselfila].id_subpartida){
                  if(subpartidas.value[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,subpartidas.value[m].id_subpartida)
                    arrideli.push(subpartidas.value[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<subpartidas.value.length;b++){
                let exist=arrideli.find(ele=>ele==subpartidas.value[b].id_partida)
                if(exist){
                  subpartidas.value.splice(b,1);
                  b--;
                }
              }
            }
            for (let k = indselfila + 1; k < tabladet.length; k++) {//actualizar nuevos num_det
              if (tabladet[k].id_tipo_insumo == tipoinssel) {
                let newind = tabladet[k].num_det - 1;
                tabladet[k].num_det = newind;
              }
              let indact = tabladet[k].ind;
              if (indact > indpri) {//actualizar ind si es mayor al eliminado
                tabladet[k].ind = tabladet[k].ind - 1;
              }
            }
            if (tabladet[indselfila].esinsumo == 0) {
              filaseli.push(tabladet[indselfila]);
            }
            tabladet.splice(indselfila, 1);
            formSubpartida.get('filasel').setValue(-1);
            let sumasinporc=this.Actparcialt1(tipoinssel, tab);
            this.actinsporc(tipoinssel,sumasinporc,operadorsel,tab);
          }
          else {
            this.toaster.error('No se puede eliminar el elemento seleccionado', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('Seleccione una insumo para eliminar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
    }
  }
  async ReemplazarIns(tab: any) {
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      let tabladet = formSubpartida.get('data_tabla').value;
      let indselfila = formSubpartida.get('filasel').value;
      if (indselfila > -1) {
        let rowsel = tabladet[indselfila];
        if (rowsel.num_det == 0) {//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        if (rowsel.esinsumo == 1) {//insumos
          this.mostrar_carga_todo = true;
          let arrexisten = []
          let filagru;
          for (let row of tabladet) {
            if (row.id_tipo_insumo == rowsel.id_tipo_insumo && row.num_det != 0) {
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
          this.mostrar_carga_todo = false
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente=this.inpfuente;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.rowfiltro=rowsel;
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              //calcular parcial
              let preciogru=0;
              if(result[0].tipo_insumo){
                rowsel.cuadrilla=0;
                for(let rowpri of tabladet){
                  if(rowpri.num_det>0 && rowpri.id_tipo_insumo==result[0].tipo_insumo && rowpri.operador==null){
                    preciogru+=Number(rowpri.parcial);
                  }
                }
              }
              else{
                preciogru=result[0].precio;
              }
              if(rowsel.afcuadrilla==1 && rowsel.operador=='%'){
                rowsel.cuadrilla=0;
                rowsel.cantidad=0;
              }
              let nuevparc=result[0].tipo_insumo?(Number(rowsel.cantidad)*Number(preciogru))/100:Number(rowsel.cantidad)*Number(preciogru);//redondear   
              let agrega: rowinsumo = {
                id_partida: rowsel.id_partida,
                id_tipo_insumo: result[0].id_tipo_insumo,
                num_det: rowsel.num_det,
                codigo: result[0].codigo,
                descripcion: result[0].descripcion,
                id_unidad:result[0].id_unidad,
                unidad: result[0].unidad,
                operador:result[0].operador,
                tipo_insumo:result[0].tipo_insumo,
                cuadrilla: rowsel.cuadrilla,
                cantidad: rowsel.cantidad,
                precio: preciogru,
                parcial: this.formsService.redondeo(nuevparc,this.dec_precio),
                id_insumo: result[0].id_insumo,
                id_clasificacion:result[0].id_clasificacion,
                id_indice: result[0].id_indice,
                id_subpartida: null,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: rowsel.afcuadrilla,
                rendimiento:null,
                und_rendi:null,
                jornada:null,
                advceros:null,
                afectaref:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: rowsel.ind,
                seleccion: 0
              };
              //reemplazar en tablas
              tabladet[indselfila] = agrega;
              let sumasinporc=this.Actparcialt1(tabladet[indselfila].id_tipo_insumo, tab)
              this.actinsporc(tabladet[indselfila].id_tipo_insumo,sumasinporc,tabladet[indselfila].operador,tab);
            }
          }
        }
        else {//subpartidas
          this.toaster.error('No se puede reemplazar una subpartida, Eliminar la subpartida y Agregar una nueva.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
    }
  }
  async abrirmodalUnidades(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    const unidad = dataPartida.get('unidad') as UntypedFormControl
    const undconcatrendi = (formSubpartida.get('undconcatrendi') as UntypedFormControl);
    this.mostrar_carga_todo = true
    let tablaunid = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 1;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      unidad.setValue(Number(result.datosel.id_unidad))
      let undsel=this.medidas.find(ele=>ele.id_unidad==unidad.value);
      undconcatrendi.setValue(undsel.unidad.toUpperCase());
    } else {
      if (valorInicial) {
        unidad.setValue(valorInicial.id_unidad)
      }
    }
  }
  cambUnidad(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    const unidad = dataPartida.get('unidad') as UntypedFormControl
    const undconcatrendi = (formSubpartida.get('undconcatrendi') as UntypedFormControl);
    if(unidad.value!=''){
      let undsel=this.medidas.find(ele=>ele.id_unidad==unidad.value);
      undconcatrendi.setValue(undsel.unidad.toUpperCase());
    }
    else{
      undconcatrendi.setValue('');
    }
  }
  Anumero(val:any){
    return Number(val);
  }
}
