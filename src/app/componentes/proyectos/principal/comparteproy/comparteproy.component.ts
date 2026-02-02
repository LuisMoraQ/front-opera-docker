import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UntypedFormControl, FormControlName, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';
import { AgrupacionProyectosComponent } from '../../agrupacion-proyectos/agrupacion-proyectos.component';

@Component({
  selector: 'app-comparteproy',
  templateUrl: './comparteproy.component.html',
  styleUrls: ['./comparteproy.component.scss']
})
export class ComparteproyComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() rowproy: any;
  @Input() opcion = "comparte";
  @Input() asignaund = 0;
  @Input() clasificaciones = []//datosproy
  @Input() grupos = []
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
  calculandofecha = false;
  fecha_iniproy = null;
  tvista = 1;
  datacomp = [];
  busqueda = '';
  buscando: boolean = false;
  dataSource = [];
  fila_sel: any;
  formAgrupacion = new UntypedFormGroup({
    codigo: new UntypedFormControl('', [Validators.required]),
  })
  nombres = '';
  usersec = null;
  editar: boolean = false;
  mostrar_carga_todo: boolean = false;
  idUsuario: any = null;
  idGrupoSeleccionado: any = null;
  get codigo(): UntypedFormControl { return this.formAgrupacion.get('codigo') as UntypedFormControl }

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
    nombre_empresa: new UntypedFormControl('', []),
    ruc_empresa: new UntypedFormControl('', []),
    direccion_empresa: new UntypedFormControl('', []),
    imagen_empresa: new UntypedFormControl('', []),
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
  get nombre_empresa(): UntypedFormControl { return this.formProyecto.get('nombre_empresa') as UntypedFormControl }
  get ruc_empresa(): UntypedFormControl { return this.formProyecto.get('ruc_empresa') as UntypedFormControl }
  get direccion_empresa(): UntypedFormControl { return this.formProyecto.get('direccion_empresa') as UntypedFormControl }
  get imagen_empresa(): UntypedFormControl { return this.formProyecto.get('imagen_empresa') as UntypedFormControl }

  constructor(
    private configuracionService: ConfiguracionService,
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    private modalService: NgbModal,
    private formsService: FormsService,
  ) { }

  async ngOnInit() {
    try {
      this.tvista = this.opcion == "comparte" ? 1 : 0;
      if (this.opcion == 'duplica') {
        this.mostrar_carga_todo = true;
        this.paises = await this.configuracionService.listarPaises();
        this.monedas = await this.configuracionService.listarMonedas();
        const detalleProyecto = await this.principalService.recuperarDatosProyecto({ id_proyecto: this.rowproy.id_proyecto })
        if (detalleProyecto) {
          this.descripcion.setValue(detalleProyecto.descripcion)
          this.id_clasificacion.setValue(detalleProyecto.id_clasificacion)
          this.modalidad.setValue(detalleProyecto.modalidad)
          this.moneda.setValue(detalleProyecto.moneda)
          this.estado.setValue(detalleProyecto.estado)
          this.cod_pais.setValue(detalleProyecto.cod_pais)
          this.direccion.setValue(detalleProyecto.direccion)
          if (detalleProyecto.cod_pais == '227') {
            this.departamento.setValue(detalleProyecto.id_deptact ?? '')
            if (detalleProyecto.id_deptact) {
              let id_prov = detalleProyecto.id_deptact + '-' + detalleProyecto.id_provact;
              let id_dist = detalleProyecto.id_deptact + '-' + detalleProyecto.id_provact + '-' + detalleProyecto.id_distact;
              if (detalleProyecto.id_provact) {
                await this.listarProvincias(detalleProyecto.id_deptact);
                this.provincia.setValue(id_prov)
                await this.listarDistritos(id_prov);
                this.distrito.setValue(id_dist)
              }
            }
          } else {
            this.OtroPais = true;
            if (detalleProyecto.cui?.includes('|')) {
              const valores = detalleProyecto.cui.split('|');
              this.otrodepartamento.setValue(valores[0])
              this.otraprovincia.setValue(valores[1])
              this.otrodistrito.setValue(valores[2])
            }
          }
          this.fecha_elaboracion.setValue(detalleProyecto.fecha_elaboracion ? moment(detalleProyecto.fecha_elaboracion).format('YYYY-MM-DD') : '')
          this.plazo.setValue(detalleProyecto.plazo)
          this.fecha_inicio.setValue(detalleProyecto.fecha_inicio ? moment(detalleProyecto.fecha_inicio).format('YYYY-MM-DD') : '')
          this.fecha_iniproy = detalleProyecto.fecha_inicio ? moment(detalleProyecto.fecha_inicio).format('YYYY-MM-DD') : null;
          this.fecha_culmina.setValue(detalleProyecto.fecha_culmina ? moment(detalleProyecto.fecha_culmina).format('YYYY-MM-DD') : '')
          this.nombre_empresa.setValue(detalleProyecto.nombre_empresa)
          this.ruc_empresa.setValue(detalleProyecto.ruc_empresa)
          this.direccion_empresa.setValue(detalleProyecto.direccion_empresa)
          this.imagen_empresa.setValue(detalleProyecto.imagen_empresa)
        }
        this.mostrar_carga_todo = false;
      }
      var resto = 550;
      this.height = window.innerHeight - resto;
      this.idUsuario = this.encriptadorService.recuperarlocalstory('idusuario');
      this.datacomp.push({ nombres: 'EDICION DEL PRESUPUESTO', visual: '1', permite: '1', mostrar: '1' });
      this.datacomp.push({ nombres: 'DISEÑO DE COSTOS INDIRECTOS', visual: '1', permite: '0', mostrar: '1' });
      /* this.datacomp.push({nombres:'COTIZACION INSUMOS',visual:'1',permite:'0',mostrar:'0'}); */
      this.datacomp.push({ nombres: 'HOJA DE METRADOS', visual: '1', permite: '0', mostrar: '1' });
      this.datacomp.push({ nombres: 'FÓRMULA POLINÓMICA', visual: '1', permite: '0', mostrar: '1' });
      this.datacomp.push({ nombres: 'PROGRAMACION DE OBRA', visual: '1', permite: '0', mostrar: '1' });
      this.datacomp.push({ nombres: 'ESPECIFICACIONES TECNICAS', visual: '1', permite: '0', mostrar: '1' });
      /* this.datacomp.push({nombres:'GESTION DE PROYECTO',visual:'1',permite:'0',mostrar:'0'}); */
      if (this.opcion != 'duplica') {
        await this.listarTabla()
      }
      else {
        let menproy = await this.encriptadorService.recuperarlocalstory('menu_proy');
        let arrmenuproy = menproy ? JSON.parse(menproy).split('|') : [0, 0, 0, 0, 0, 0, 0, 0];
        arrmenuproy.splice(0, 1);//datosproy
        arrmenuproy.splice(4, 1);//programacion
        if (this.rowproy.permite) {
          let arrper = JSON.parse(this.rowproy.permite);
          for (let m = 0; m < this.datacomp.length; m++) {
            this.datacomp[m].mostrar = arrmenuproy[m] == 1 ? 1 : 0;
            if (Number(arrper[m]) == 0) {
              this.datacomp[m].permite = 2;
            }
          }
        }
        else {
          for (let m = 0; m < this.datacomp.length; m++) {
            this.datacomp[m].mostrar = arrmenuproy[m] == 1 ? 1 : 0;
          }
        }
      }
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
  async listarTabla() {
    this.buscando = true;
    this.dataSource = [];
    this.dataSource = await this.principalService.ListarUsuariosProyComp({ id_proyecto: this.rowproy.id_proyecto })
    this.buscando = false;
  }
  async EditaComp(row) {
    this.formAgrupacion.reset({
      codigo: '',
    })
    this.nombres = row.nombres;
    let arrvisual = JSON.parse(row.visual);
    let arrpermite = JSON.parse(row.permite);
    let arrmp = row.menu_proy.split('|');//quitar indice 0 y 5o6(ambos progra)
    arrmp.splice(0, 1);//datosproy
    arrmp.splice(4, 1);//programacion
    arrvisual.splice(0, 1);//datosproy
    arrvisual.splice(4, 1);//programacion
    for (let a = 0; a < this.datacomp.length; a++) {//algunos adaptan a 2 accesos
      this.datacomp[a].mostrar = arrmp[a] == 1 ? 1 : 0;
      this.datacomp[a].visual = arrvisual[a];
      this.datacomp[a].permite = arrpermite[a];
    }
    this.editar = true;
    //cargar 
    this.usersec = { id_proyecto: row.id_proyecto, id_usuario: row.id_secundario, nombres: row.nombres };
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  limpiarFormulario() {
    this.formAgrupacion = new UntypedFormGroup({
      codigo: new UntypedFormControl('', [Validators.required]),
    })
    this.nombres = '';
    this.usersec = null;
    this.editar = false
    for (let a = 0; a < this.datacomp.length; a++) {
      this.datacomp[a].mostrar = '1';
      this.datacomp[a].visual = '1';
      this.datacomp[a].permite = a == 0 || a == 1 ? '1' : '0';
    }
    this.idGrupoSeleccionado = null
    this.codigo.markAsPending()
  }
  async almacenar() {
    if (this.editar) {
      await this.actualizar()
    } else {
      await this.guardar()
    }
  }
  async guardar() {
    try {
      let usersecasig = this.usersec ? this.usersec.id_usuario ? true : false : false;
      if (!usersecasig) {
        this.formAgrupacion.markAllAsTouched()
        this.toaster.error('Buscar los datos de usuario.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      } else {
        let arrvisual = [];
        let arrpermite = [];
        let dupli = 0;
        let valido = true;
        let edpresu = false;
        let edotro = false;
        let edform = false;
        let edindir = false;
        for (let ele of this.datacomp) {
          arrvisual.push(ele.visual);
          if (ele.nombres == 'PROGRAMACION DE OBRA') {//programacion pushea 2
            arrvisual.push(ele.visual);
          }
          arrpermite.push(ele.permite);
          if (ele.permite == 1) {
            dupli++;
          }
          if (ele.nombres == 'EDICION DEL PRESUPUESTO' && ele.permite == 1) {
            edpresu = true;
          }
          if (ele.nombres != 'EDICION DEL PRESUPUESTO' && ele.permite == 1) {
            edotro = true;
          }
          if (ele.nombres == 'FÓRMULA POLINÓMICA' && ele.permite == 1) {
            edform = true;
          }
          if (ele.nombres == 'DISEÑO DE COSTOS INDIRECTOS' && ele.permite == 1) {
            edindir = true;
          }
        }
        arrvisual.unshift(1);
        valido = edotro && edpresu ? true : !edotro ? true : false;
        if (valido) {
          let valform = edform ? (edindir ? true : false) : true;
          if (valform) {
            this.mostrar_carga_todo = true
            const inputGuardar = {
              id_proyecto: this.rowproy.id_proyecto,
              id_usuario: this.idUsuario,
              id_secundario: this.usersec.id_usuario,
              duplica: dupli > 0 ? 1 : 0,
              visual: JSON.stringify(arrvisual),
              permite: JSON.stringify(arrpermite),
            }
            const response = await this.principalService.ComparteProy(inputGuardar)
            this.mostrar_carga_todo = false
            if (response[0]?.id == "1") {
              this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              await this.limpiarFormulario()
              await this.listarTabla()
            }
            else {
              this.limpiarFormulario();
              this.toaster.error(response[0].mensaje, 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
          else {
            this.toaster.error('Para procesar Fórmula Polinómica debe seleccionar tambien Costos Indirectos.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else {
          this.toaster.error('Seleccione Presupuesto para duplicar los elementos selececcionados.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      //SwalService.error()
    }
  }
  async actualizar() {
    try {
      if (!this.usersec) {
        this.formAgrupacion.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      } else {
        let arrvisual = [];
        let arrpermite = [];
        let dupli = 0;
        let valido = true;
        let edpresu = false;
        let edotro = false;
        let edform = false;
        let edindir = false;
        for (let ele of this.datacomp) {
          arrvisual.push(ele.visual);
          if (ele.nombres == 'PROGRAMACION DE OBRA') {//programacion pushea 2
            arrvisual.push(ele.visual);
          }
          arrpermite.push(ele.permite);
          if (ele.permite == 1) {
            dupli++;
          }
          if (ele.nombres == 'EDICION DEL PRESUPUESTO' && ele.permite == 1) {
            edpresu = true;
          }
          if (ele.nombres != 'EDICION DEL PRESUPUESTO' && ele.permite == 1) {
            edotro = true;
          }
          if (ele.nombres == 'FÓRMULA POLINÓMICA' && ele.permite == 1) {
            edform = true;
          }
          if (ele.nombres == 'DISEÑO DE COSTOS INDIRECTOS' && ele.permite == 1) {
            edindir = true;
          }
        }
        arrvisual.unshift(1);
        valido = edotro && edpresu ? true : !edotro ? true : false;
        if (valido) {
          let valform = edform ? (edindir ? true : false) : true;
          if (valform) {
            this.mostrar_carga_todo = true
            const inputGuardar = {
              id_proyecto: this.rowproy.id_proyecto,
              id_usuario: this.idUsuario,
              id_secundario: this.usersec.id_usuario,
              duplica: dupli > 0 ? 1 : 0,
              visual: JSON.stringify(arrvisual),
              permite: JSON.stringify(arrpermite),
            }
            const response = await this.principalService.ActualizaProyComp(inputGuardar)
            this.mostrar_carga_todo = false;
            if (response) {
              if (response[0].id == "1") {
                this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                await this.limpiarFormulario()
                await this.listarTabla()
              }
              else {
                await this.limpiarFormulario()
                await this.listarTabla()
                this.toaster.error(response[0].mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              }
            }
            else {
              this.toaster.error('No se pudo realizar la operacion', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              await this.limpiarFormulario()
              await this.listarTabla()
            }
          }
          else {
            this.toaster.error('Para procesar Fórmula Polinómica debe seleccionar tambien Costos Indirectos.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else {
          this.toaster.error('Seleccione Presupuesto para duplicar los elementos selececcionados.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      //SwalService.error()
    }
  }
  closeModal(result: any = null) {
    this.modal.close()
  }
  async Descomparte(row: any) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'El otro usuario ya no podra ver el proyecto.')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const respuesta = await this.principalService.DescomparteProy({ id_proyecto: row.id_proyecto, id_usuario: row.id_usuario, id_secundario: row.id_secundario })
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          this.toaster.error(respuesta.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listarTabla()
        }
        else {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listarTabla()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      this.toaster.error(err, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async BuscarUser() {
    if (!this.codigo.invalid) {
      this.nombres = '';
      this.usersec = null;
      let res = await this.configuracionService.BuscarUsuarioxCod({ codigo: this.codigo.value })
      if (res?.length > 0) {
        if (res[0].id_usuario != this.idUsuario) {
          this.nombres = res[0].nombres;
          this.usersec = res[0];
          //bloquear los checkbox de la tabla(visual y duplicar), limpiar los estados
          let arrmp = res[0].menu_proy.split('|');//quitar indice 0 y 5o6(ambos progra)
          arrmp.splice(0, 1);//datosproy
          arrmp.splice(4, 1);//programacion
          for (let a = 0; a < this.datacomp.length; a++) {
            this.datacomp[a].mostrar = arrmp[a] == 1 ? 1 : 0;
            this.datacomp[a].visual = arrmp[a] == 1 ? 1 : 0;
            //this.datacomp[a].permite=arrmp[a]==1?1:0;
          }
        }
        else {
          this.toaster.error('No se puede compartir el proyecto al mismo usuario.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Codigo Incorrecto, No se encontro datos del usuario.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else {
      this.toaster.error('Ingrese el Codigo del otro Usuario.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async DescompTodo() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'El otro usuario ya no podra ver el proyecto.')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const respuesta = await this.principalService.DescomparteProy({ id_proyecto: this.rowproy.id_proyecto, id_usuario: this.idUsuario })
        this.limpiarFormulario();
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          this.toaster.error(respuesta.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listarTabla()
        }
        else {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listarTabla()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      this.toaster.error(err, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
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
      let arrpermite = [];
      let dupli = 0;
      let valido = true;
      let edpresu = false;
      let edotro = false;
      let edform = false;
      let edindir = false;
      for (let ele of this.datacomp) {
        arrpermite.push(ele.permite);
        if (ele.permite == 1) {
          dupli++;
        }
        if (ele.nombres == 'EDICION DEL PRESUPUESTO' && ele.permite == 1) {
          edpresu = true;
        }
        if (ele.permite == 1) {
          edotro = true;
        }
        if (ele.nombres == 'FÓRMULA POLINÓMICA' && ele.permite == 1) {
          edform = true;
        }
        if (ele.nombres == 'DISEÑO DE COSTOS INDIRECTOS' && ele.permite == 1) {
          edindir = true;
        }
      }
      //siempre debe seleccionar presu, para duplicar, sino no duplica nada?
      valido = edotro && edpresu ? true : !edotro ? true : false;
      if (edotro) {
        if (valido) {
          let valform = edform ? (edindir ? true : false) : true;
          if (valform) {
            const sw = await SwalService.confirm('Advertencia', 'Esta seguro que desea duplicar?. El proceso puede tardar.')
            if (sw.isConfirmed) {
              this.mostrar_carga_todo = true;
              let fechaa = moment(this.fecha_iniproy);
              let fechab = moment(this.fecha_inicio.value);
              let difdias = fechab.diff(fechaa, 'days');
              /* const tablac = JSON.stringify(tabla.value.elimina); */
              if (difdias != 0) {
                const objeto = {
                  id_proyecto: this.rowproy.id_proyecto,
                  duracion: '',
                  fechaini: fechaa > fechab ? fechab.format('YYYY-MM-DD') : fechaa.format('YYYY-MM-DD'),
                  fechafin: fechaa > fechab ? fechaa.format('YYYY-MM-DD') : fechab.format('YYYY-MM-DD'),
                  posterior: 0
                }
                const response = await this.principalService.fechaDespuesDuracion(objeto)
                difdias = fechaa < fechab ? Number(response.duracion) * 1 : Number(response.duracion) * -1;
              }
              let descpasa = this.descripcion.value.toString().toUpperCase().trim().replace(/\s+/g, ' ')//quitar saltos y espacios, solo mayuscula
              const body = JSON.stringify({
                'id_proyecto': this.rowproy.id_proyecto,
                'id_usuario': this.rowproy.id_usuario,
                'userfinal': this.idUsuario,
                'admitidos': arrpermite.join('|'),
                'asignaund': this.asignaund,
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
                'fecha_elaboracion': this.fecha_elaboracion.value ? moment(this.fecha_elaboracion.value).format('YYYY-MM-DD') : null,
                'plazo': this.plazo.value ?? null,
                'fecha_inicio': this.fecha_inicio.value ? moment(this.fecha_inicio.value).format('YYYY-MM-DD') : null,
                'fecha_culmina': this.fecha_culmina.value ? moment(this.fecha_culmina.value).format('YYYY-MM-DD') : null,
                'fuente': 1,
                'desplaza': difdias == 0 ? false : true,
                'difidas': difdias,
                'nombre_empresa': this.nombre_empresa.value,
                'ruc_empresa': this.ruc_empresa.value,
                'direccion_empresa': this.direccion_empresa.value,
                'imagen_empresa': this.imagen_empresa.value,
              });
              console.time('timetemp')
              let resp = await this.principalService.DuplicarProy2(body);
              console.timeEnd('timetemp')
              this.mostrar_carga_todo = false;
              if (resp.id == "1") {
                SwalService.success('Correcto', resp.mensaje)
                this.modal.close('listar')
              }
              else {
                SwalService.error('Advertencia', resp.mensaje)
              }
            }
          }
          else {
            this.toaster.error('Para procesar Fórmula Polinómica debe seleccionar tambien Costos Indirectos.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else {
          this.toaster.error('Seleccione Presupuesto para duplicar los elementos selececcionados.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione alguna Opcion para duplicar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
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
      let fechaa = moment(this.fecha_iniproy);
      let fechab = moment(this.fecha_inicio.value);
      let difdias = fechab.diff(fechaa, 'days');
      if (difdias != 0) {
        this.mostrar_carga_todo = true;
        const aspectos = await this.principalService.ListarAspectosDiasProy({ id_proyecto: this.rowproy.id_proyecto })
        const arrayDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        let fechainicioInvalida = false
        let fechain = new Date(this.fecha_inicio.value);
        const Fi = fechab.format('YYYY-MM-DD')
        var nombreDia = arrayDays[fechain.getDay()];
        let encontrado1 = false
        let encontrado = false
        if (aspectos[0].length > 0) {
          let diasnolabo = aspectos[0][0].nolabo1 ? (aspectos[0][0].nolabo1.toString().includes('|') ? aspectos[0][0].nolabo1.toString().split('|') : [aspectos[0][0].nolabo1.toString()]) : [];
          encontrado1 = diasnolabo.find(ele => ele == nombreDia.toUpperCase()) ? true : false;
        }
        if (aspectos[1]) {
          encontrado = aspectos[1].find(ele => moment(ele.fecha).format('YYYY-MM-DD') == Fi && !ele.laborado)
        }
        fechainicioInvalida = encontrado || encontrado1 ? true : false;
        this.mostrar_carga_todo = false;
        if (fechainicioInvalida) {
          this.toaster.error('La Fecha Inicio Seleccionada es  dia no laborable', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else {
          this.tvista = 1;
        }
      }
      else {
        this.tvista = 1;
      }
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
  async verGrupoProyecto() {
    try {
      const valoract = this.id_grupo.value
      const gruposact = this.grupos;
      this.grupos = []
      this.mostrar_carga_todo = true
      const modalRef = this.modalService.open(AgrupacionProyectosComponent, { size: 'md', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
      modalRef.componentInstance.fuente = 1
      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        if (result.datos.length > 0) {
          this.grupos = result.datos
          if (valoract != '') {
            let encuentra = this.grupos.find(dato => dato.id_grupo == valoract);
            if (encuentra) {
              this.id_grupo.setValue(valoract)
            }
            else {
              this.id_grupo.setValue('');
            }
          }
        }
        else {
          this.grupos = gruposact;
          this.id_grupo.setValue(valoract)
        }
      }
    }
    catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error)
    }
  }
  async CalculaFechaFin(valmod: any) {
    if (valmod == 0) {//plazo
      let plazores = !isNaN(Number(this.plazo.value)) ? this.plazo.value : 1;
      if (plazores == null || plazores == '' || plazores == 0) {
        this.fecha_culmina.setValue(this.fecha_inicio.value);
        this.plazo.setValue(1);
      }
      else {
        if (this.fecha_inicio.value != '') {
          let fechaf = new Date(this.fecha_inicio.value);
          this.calculandofecha = true;
          fechaf.setDate(fechaf.getDate() + Number(plazores))
          this.calculandofecha = false;
          this.fecha_culmina.setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    } else if (valmod == 1) {//inicio
      if (this.fecha_inicio.value != '') {
        let plazores = !isNaN(Number(this.plazo.value)) ? this.plazo.value : 0;
        if (plazores == null || plazores == '') {
          this.fecha_culmina.setValue(this.fecha_inicio.value);
        }
        else {
          let fechaf = new Date(this.fecha_inicio.value);
          this.calculandofecha = true;
          fechaf.setDate(fechaf.getDate() + Number(plazores))
          this.calculandofecha = false;
          this.fecha_culmina.setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    } else if (valmod == 2) {//culmina
      if (this.fecha_culmina.value != '') {
        if (this.fecha_inicio.value != '') {
          //fecha culmina menor, error, asignar fecha actual plazo 1 dia
          let fechaa = moment(this.fecha_inicio.value);
          let fechab = moment(this.fecha_culmina.value);
          let difdias = fechab.diff(fechaa, 'days');
          if (difdias < 0) {
            this.toaster.error('La Fecha de Culminación no puede ser menor a la Fecha Inicial.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            this.fecha_culmina.setValue(this.fecha_inicio.value)
            this.plazo.setValue(1)
          }
          else {
            this.plazo.setValue(difdias + 1)
          }
        }
      }
    }
  }
  TeclaCalcFin(event: any) {
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
}
