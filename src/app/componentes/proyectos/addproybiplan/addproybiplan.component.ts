import { Component, Input, OnInit, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';

@Component({
  selector: 'app-addproybiplan',
  templateUrl: './addproybiplan.component.html',
  styleUrls: ['./addproybiplan.component.scss']
})
export class AddproybiplanComponent implements OnInit {
  height: number = 100;
  @Input() clasificaciones = []//datosproy
  @Input() grupoprinc
  @Input() idprincipal
  @Input() departamentos = []
  modalidades = [
    { id: 0, nombre: 'DIRECTA' },
    { id: 1, nombre: 'CONTRATA' }
  ]
  estados = [
    { id: 0, nombre: 'BORRADOR' },
    { id: 1, nombre: 'APROBADO' },
    { id: 2, nombre: 'EVALUACIÓN' }
  ]
  paises = []
  monedas = []
  OtroPais: boolean = false
  provincias = []
  distritos = []
  tvista = 1;

  datacomp = [];
  buscando: boolean = false;
  //dataSource = [];
  fila_sel: any;
  formBuscar = new UntypedFormGroup({
    codigo: new UntypedFormControl('', [Validators.required]),
  })

  editar: boolean = false;
  mostrar_carga_todo: boolean = false;
  idUsuario: any = null;
  //idGrupoSeleccionado: any = null;
  dataproy: any;
  valorEliminar = null
  get codigo(): UntypedFormControl { return this.formBuscar.get('codigo') as UntypedFormControl }

  formProyecto = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    id_clasificacion: new UntypedFormControl('', [Validators.required]),
    modalidad: new UntypedFormControl('', [Validators.required]),
    id_grupo: new UntypedFormControl('0', [Validators.required]),
    moneda: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', [Validators.required]),
    cod_pais: new UntypedFormControl(227, []),
    departamento: new UntypedFormControl('', []),
    distrito: new UntypedFormControl('', []),
    provincia: new UntypedFormControl('', []),
    direccion: new UntypedFormControl('', []),
    otrodepartamento: new UntypedFormControl('', []),
    otrodistrito: new UntypedFormControl('', []),
    otraprovincia: new UntypedFormControl('', []),
    fecha_elaboracion: new UntypedFormControl('', [Validators.required]),
    plazo: new UntypedFormControl('', [Validators.required]),
    fecha_inicio: new UntypedFormControl('', [Validators.required]),
    fecha_culmina: new UntypedFormControl('', [Validators.required]),
  })

  get descripcion(): UntypedFormControl { return this.formProyecto.get('descripcion') as UntypedFormControl }
  get id_clasificacion(): UntypedFormControl { return this.formProyecto.get('id_clasificacion') as UntypedFormControl }
  get modalidad(): UntypedFormControl { return this.formProyecto.get('modalidad') as UntypedFormControl }
  get id_grupo(): UntypedFormControl { return this.formProyecto.get('id_grupo') as UntypedFormControl }
  get moneda(): UntypedFormControl { return this.formProyecto.get('moneda') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formProyecto.get('estado') as UntypedFormControl }
  get cod_pais(): UntypedFormControl { return this.formProyecto.get('cod_pais') as UntypedFormControl }
  get direccion(): UntypedFormControl { return this.formProyecto.get('direccion') as UntypedFormControl }
  get departamento(): UntypedFormControl { return this.formProyecto.get('departamento') as UntypedFormControl }
  get distrito(): UntypedFormControl { return this.formProyecto.get('distrito') as UntypedFormControl }
  get provincia(): UntypedFormControl { return this.formProyecto.get('provincia') as UntypedFormControl }
  get fecha_elaboracion(): UntypedFormControl { return this.formProyecto.get('fecha_elaboracion') as UntypedFormControl }
  get plazo(): UntypedFormControl { return this.formProyecto.get('plazo') as UntypedFormControl }
  get fecha_inicio(): UntypedFormControl { return this.formProyecto.get('fecha_inicio') as UntypedFormControl }
  get fecha_culmina(): UntypedFormControl { return this.formProyecto.get('fecha_culmina') as UntypedFormControl }
  get otrodepartamento(): UntypedFormControl { return this.formProyecto.get('otrodepartamento') as UntypedFormControl }
  get otrodistrito(): UntypedFormControl { return this.formProyecto.get('otrodistrito') as UntypedFormControl }
  get otraprovincia(): UntypedFormControl { return this.formProyecto.get('otraprovincia') as UntypedFormControl }

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private formsService: FormsService,
    private configuracionService: ConfiguracionService,
    private encriptadorService: EncriptadorService,
    private principalService: PrincipalService,
  ) { }

  async ngOnInit() {
    try {
      this.tvista = 0;
      this.mostrar_carga_todo = true;
      this.paises = await this.configuracionService.listarPaises();
      this.monedas = await this.configuracionService.listarMonedas();
      var resto = 550;
      this.height = window.innerHeight - resto;
      this.idUsuario = this.encriptadorService.recuperarlocalstory('idusuario');
      this.fecha_culmina.disable();
      this.fecha_elaboracion.disable();
      this.plazo.disable();
      this.fecha_inicio.disable();
      // this.datacomp.push({nombres:'EDICION DEL PRESUPUESTO',visual:'1',permite:'1',mostrar:'1'});
      // this.datacomp.push({nombres:'DISEÑO DE COSTOS INDIRECTOS',visual:'1',permite:'0',mostrar:'1'});
      // /* this.datacomp.push({nombres:'COTIZACION INSUMOS',visual:'1',permite:'0',mostrar:'0'}); */
      // this.datacomp.push({nombres:'HOJA DE METRADOS',visual:'1',permite:'0',mostrar:'1'});
      // this.datacomp.push({nombres:'FÓRMULA POLINÓMICA',visual:'1',permite:'0',mostrar:'1'});
      // this.datacomp.push({nombres:'PROGRAMACION DE OBRA',visual:'1',permite:'0',mostrar:'1'});
      // this.datacomp.push({nombres:'ESPECIFICACIONES TECNICAS',visual:'1',permite:'0',mostrar:'1'});
      // /* this.datacomp.push({nombres:'GESTION DE PROYECTO',visual:'1',permite:'0',mostrar:'0'}); */
      // let menproy = await this.encriptadorService.recuperarlocalstory('menu_proy');
      // let arrmenuproy=menproy?JSON.parse(menproy).split('|'):[0,0,0,0,0,0,0,0];
      // arrmenuproy.splice(0,1);//datosproy
      // arrmenuproy.splice(4,1);//programacion
      // if(this.rowproy.permite){
      //   let arrper = JSON.parse(this.rowproy.permite);
      //   for(let m=0;m<this.datacomp.length;m++){
      //     this.datacomp[m].mostrar=arrmenuproy[m]==1?1:0;
      //     if(Number(arrper[m])==0){
      //       this.datacomp[m].permite=2;
      //     }
      //   }
      // }
      // else{
      //   for(let m=0;m<this.datacomp.length;m++){
      //     this.datacomp[m].mostrar=arrmenuproy[m]==1?1:0;
      //   }
      // }
      this.mostrar_carga_todo = false;
    } catch (e) {
      console.log(e);
      //SwalService.error()
    }
  }
  async CambiarPais(id) {
    if (id === '227') {
      this.OtroPais = false;
    } else {
      this.OtroPais = true;
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 550;
    this.height = window.innerHeight - resto;
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  limpiarFormulario() {
    this.formBuscar = new UntypedFormGroup({
      codigo: new UntypedFormControl('', [Validators.required]),
    })
    //limpiar formulario proyecto

  }
  closeModal(result: any = null) {
    this.modal.close()
  }

  cambioselt1(row) {
    if (row.visual == 0) {
      row.visual = 1;
    }
    else {
      row.visual = 0;
    }
  }
  cambioselt2(row) {
    if (row.permite == 0) {
      row.permite = 1;
    }
    else {
      row.permite = 0;
    }
  }
  async Duplicaproy() {
    try {
      if (!this.dataproy) {
        this.toaster.error('Buscar los datos del proyecto que antes de Importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      }
      if (this.formProyecto.invalid) {
        this.formProyecto.markAllAsTouched()
        this.toaster.error('Datos incompletos o erroneos', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      }
      let arrpermite = [];
      let dupli = 0;
      let valido = true;
      let edpresu = false;
      let edotro = false;
      let edform = false;
      let edindir = false;
      // for(let ele of this.datacomp){
      //   arrpermite.push(ele.permite);
      //   if(ele.permite==1){
      //     dupli++;
      //   }
      //   if(ele.nombres=='EDICION DEL PRESUPUESTO' && ele.permite==1){
      //     edpresu=true;
      //   }
      //   if(ele.permite==1){
      //     edotro=true;
      //   }
      //   if(ele.nombres == 'FÓRMULA POLINÓMICA' && ele.permite==1){
      //     edform=true;
      //   }
      //   if(ele.nombres == 'DISEÑO DE COSTOS INDIRECTOS' && ele.permite==1){
      //     edindir=true;
      //   }
      // }

      // valido=edotro && edpresu?true:!edotro?true:false;
      // if(edotro){
      //   if(valido){
      //     let valform=edform?(edindir?true:false):true;
      //     if(valform){
      const sw = await SwalService.confirm('Advertencia', 'Esta seguro que desea duplicar?. El proceso puede tardar.')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        let descpasa = this.descripcion.value.toString().toUpperCase().trim().replace(/\s+/g, ' ')//quitar saltos y espacios, solo mayuscula
        //pasar datos recuperado del proyecto
        const body = JSON.stringify({
          'id_proyecto': this.dataproy.id_proyecto,
          'id_usuario': this.dataproy.id_usuario,
          'userfinal': this.idUsuario,
          //'admitidos': arrpermite.join('|'),
          //'asignaund': this.asignaund,
          'cui': this.cod_pais.value === 227 ? '' : this.otrodepartamento.value + '|' + this.otraprovincia.value + '|' + this.otrodistrito.value,
          'descripcion': descpasa,
          'id_clasificacion': this.id_clasificacion.value,
          'modalidad': this.modalidad.value,
          'id_grupo': this.id_grupo.value,
          'moneda': this.moneda.value,
          'estado': this.estado.value,
          'cod_pais': this.cod_pais.value,//null
          'id_localidad': this.distrito.value,//null
          'direccion': this.direccion.value == "" ? null : this.direccion.value,
          'fecha_elaboracion': this.dataproy.fecha_elaboracion ? moment(this.dataproy.fecha_elaboracion).format('YYYY-MM-DD') : null,
          'plazo': this.dataproy.plazo ?? null,
          'fecha_inicio': this.dataproy.fecha_inicio ? moment(this.dataproy.fecha_inicio).format('YYYY-MM-DD') : null,
          'fecha_culmina': this.dataproy.fecha_culmina ? moment(this.dataproy.fecha_culmina).format('YYYY-MM-DD') : null,
          'fuente': 1,
          //'desplaza': false,
          //'difidas': 0,
          'id_principal': null,//asignar id que corresponde
        });
        console.time('timetemp')
        let resp = await this.principalService.AgregarProyBiplan(body);
        console.timeEnd('timetemp')
        this.mostrar_carga_todo = false;
        if (resp.id == "1") {
          if (resp.observacion) {
            let prueba = JSON.parse(resp.observacion);
            let datos = '';
            for (let rowp of prueba) {
              let valos = rowp.split('|');
              datos += '<tr><td>' + valos[0] + '</td><td>' + valos[1] + '</td><td>' + valos[2] + '</td></tr>'//mostrar con decimales
            }
            SwalService.showTable2('Se importo con Observaciones', '0',
              `<style>
                    .tablaswall {
                      border-collapse: collapse;
                      width:570px;
                    }
                    .tablaswall th, .tablaswall td {
                      border: 1px solid #ccc;
                      padding: 2px 8px;
                      text-align: left;
                      font-size: 11px;
                    }
                    .tablaswall th {
                      text-align: center;
                      font-weight: bolder;
                      background-color:rgb(216, 216, 216);
                    }
                  </style>
                  <div style="font-size:13px">No se pudo agregar Metrados ya que no son compatibles con Presupuesto, en las siguientes partidas:<br><br>
                  <table class="tablaswall">
                    <tr>
                      <th style="width:180px">ITEM</th>
                      <th style="width:200px">METRADO PRESUPUESTO</th>
                      <th>METRADO</th>
                    </tr>`+
              datos
              + `</table></div>`
            )
            this.modal.close('listar')
          }
          else {
            await this.eliminarCodigoComp()
            SwalService.success('Correcto', resp.mensaje)
            this.modal.close('listar')
          }
        }
        else {
          SwalService.error('Advertencia', resp.mensaje)
        }
      }
      //     }
      //     else{
      //       this.toaster.error('Para procesar Fórmula Polinómica debe seleccionar tambien Costos Indirectos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      //     }
      //   }
      //   else{
      //     this.toaster.error('Seleccione Presupuesto para duplicar los elementos selececcionados.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      //   }
      // }
      // else{
      //   this.toaster.error('Seleccione alguna Opcion para duplicar.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      // }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  //datos proyecto
  async Siguiente() {
    if (this.formProyecto.invalid) {
      this.formProyecto.markAllAsTouched()
      this.toaster.error('Datos incompletos', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    } else {
      // let fechaa = moment(this.fecha_iniproy);
      // let fechab = moment(this.fecha_inicio.value);
      // let difdias=fechab.diff(fechaa, 'days');
      // if(difdias!=0){
      //   this.mostrar_carga_todo=true;
      //   const aspectos = await this.principalService.ListarAspectosDiasProy({ id_proyecto: this.rowproy.id_proyecto })
      //   const arrayDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      //   let fechainicioInvalida = false
      //   let fechain= new Date(this.fecha_inicio.value);
      //   const Fi = fechab.format('YYYY-MM-DD')
      //   var nombreDia = arrayDays[fechain.getDay()];
      //   let encontrado1 = false
      //   let encontrado = false
      //   if (aspectos[0].length>0) {
      //     let diasnolabo=aspectos[0][0].nolabo1?(aspectos[0][0].nolabo1.toString().includes('|')?aspectos[0][0].nolabo1.toString().split('|'):[aspectos[0][0].nolabo1.toString()]):[];
      //     encontrado1 = diasnolabo.find(ele => ele==nombreDia.toUpperCase())?true:false;
      //   }
      //   if (aspectos[1]) {
      //     encontrado = aspectos[1].find(ele => moment(ele.fecha).format('YYYY-MM-DD') == Fi && !ele.laborado)
      //   }
      //   fechainicioInvalida = encontrado || encontrado1 ? true : false;
      //   this.mostrar_carga_todo=false;
      //   if (fechainicioInvalida) {
      //     this.toaster.error('La Fecha Inicio Seleccionada es  dia no laborable', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      //   }
      //   else{
      //     this.tvista=1;
      //   }
      // }
      // else{
      this.tvista = 1;
      // }
    }
  }
  Regresar() {
    this.tvista = 0;
  }
  async listarProvincias(idDepartamento: number) {
    this.provincias = []
    this.distritos = []
    this.provincia.setValue('')
    this.distrito.setValue('')
    if (!idDepartamento) {
      this.provincia.clearValidators()
      this.provincia.updateValueAndValidity()
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    this.provincia.setValidators([Validators.required])
    this.provincia.updateValueAndValidity()
    this.distrito.setValidators([Validators.required])
    this.distrito.updateValueAndValidity()
    this.provincias = await this.configuracionService.Provincia(idDepartamento)
  }
  async listarDistritos(idProvincia: string) {
    this.distritos = []
    this.distrito.reset()
    this.distrito.setValue('')
    if (!idProvincia) {
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    const provincia = this.provincia.value.split('-')
    this.distritos = await this.configuracionService.Distrito(this.departamento.value, provincia[1])
  }
  // TeclaCalcFin(event:any){
  //   if (event.keyCode.toString() == "13") {
  //     event.target.blur();
  //   }
  // }
  async BuscarProy() {
    // buscar en otro proy
    if (!this.codigo.value) {
      this.toaster.error('Ingresar el codigo del Proyecto para buscar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    this.mostrar_carga_todo = true;
    const obj = {
      codigo: this.codigo.value
    }
    console.log('obj', obj)
    const res = await this.principalService.dataCodigoCompart(obj)
    console.log('res', res)
    if (res[0]) {
      this.valorEliminar = res[0]
      let val1 = res[0].id_proyecto
      let val2 = res[0].id_usuario
      const detalleProyecto = await this.principalService.BuscarProyBiplan({ id_proyecto: val1, id_usuario: val2 })
      this.mostrar_carga_todo = false;
      if (detalleProyecto.id == "1") {
        this.toaster.success(detalleProyecto.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        if (detalleProyecto.observacion) {
          let datarecu = JSON.parse(detalleProyecto.observacion)
          this.dataproy = datarecu[0]
          console.log(this.dataproy)
          this.descripcion.setValue(datarecu[0].descripcion)
          this.id_clasificacion.setValue(datarecu[0].id_clasificacion)
          this.modalidad.setValue(datarecu[0].modalidad)
          this.moneda.setValue(datarecu[0].moneda)
          this.estado.setValue(datarecu[0].estado)
          this.cod_pais.setValue(datarecu[0].cod_pais)
          this.direccion.setValue(datarecu[0].direccion)
          this.departamento.setValue(datarecu[0].id_deptact ?? '')
          if (datarecu[0].id_deptact) {
            let id_prov = datarecu[0].id_deptact + '-' + datarecu[0].id_provact;
            let id_dist = datarecu[0].id_deptact + '-' + datarecu[0].id_provact + '-' + datarecu[0].id_distact;
            if (datarecu[0].id_provact) {
              await this.listarProvincias(datarecu[0].id_deptact);
              this.provincia.setValue(id_prov)
              await this.listarDistritos(id_prov);
              this.distrito.setValue(id_dist)
            }
          }
          this.fecha_elaboracion.setValue(datarecu[0].fecha_elaboracion ? moment(datarecu[0].fecha_elaboracion).format('YYYY-MM-DD') : '')
          this.plazo.setValue(datarecu[0].plazo)
          this.fecha_inicio.setValue(datarecu[0].fecha_inicio ? moment(datarecu[0].fecha_inicio).format('YYYY-MM-DD') : '')
          this.fecha_culmina.setValue(datarecu[0].fecha_culmina ? moment(datarecu[0].fecha_culmina).format('YYYY-MM-DD') : '')
        }
      }
      else {
        this.dataproy = null;
        this.toaster.error(detalleProyecto.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }

  }

  async eliminarCodigoComp() {
    const obj = {
      id_proyecto: this.valorEliminar?.id_proyecto,
      id_usuario: this.valorEliminar?.id_usuario
    }
    const res = await this.principalService.eliminarCodigoComp(obj)
  }
}
