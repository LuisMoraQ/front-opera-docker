import {Component,OnInit,Input,HostListener,ViewChild,} from '@angular/core';
import * as math from 'mathjs';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PrincipalService } from 'src/app/servicios/principal.service';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ModalimportaproyComponent } from '../../../proyectos/principal/modalimportaproy/modalimportaproy.component';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import * as moment from 'moment';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

export interface rowacu {
  //revisar parametros de esta fila
  id_proyecto: any;
  indice: any;
  id_filadetalle: any;
  id_tipo_insumo: any;
  num_det: any;
  codigo: any;
  descripcion: any;
  id_unidad: any;
  unidad: any;
  operador: any;
  tipo_insumo: any;
  cuadrilla: any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice: any;
  id_clasificacion: any;
  id_insumo: any;
  id_subpartida: any;
  indice_subp: any;
  accion: any;
  esinsumo: any;
  afcuadrilla: any;
  rendimiento: any;
  und_rendi: any;
  jornada: any;
  advceros: any;
  referencia: any;
  desc_clasi: any;
  //afectaref:any;//no existe en tabla detalle, //0:no es subpartida, 1:agregar referencia, 2:eliminar referencia, para actualizar las referencias en bd
  icomost: any;
  mostrar: any;
  editar: any;
  editar2: any;
  ind: any;
  seleccion: any;
  asignaund: any;
  zidmodi: any;
}

@Component({
  selector: 'app-data-proyecto',
  templateUrl: './data-proyecto.component.html',
  styleUrls: ['./data-proyecto.component.scss'],
})
export class DataProyectoComponent implements OnInit {
  @ViewChild('modalDetalles') modaldetalle: ModalBasicComponent;
  @Input('height') height: number = 100;
  arreglomostrar=[]
  mostrar_carga_todo = false;
  mostrar_carga = false;
  activetab = 1;
  idnav = 1;
  expanded = false;
  vistagrande = true;
  datasourcePri = [];
  tabindir = [];
  data_source2 = [];
  data_source3 = [];
  tablaDetalles = [];
  buscatabla = false;
  id_proyecto;
  allform;
  prueba;
  moneda;
  dec_metrado;
  dec_precio;
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant;
  mostindir = false;
  simbolo;
  decima;
  colores;
  solover;
  tipoProy;
  id_userproy;
  mask_precio = '0.2';
  existetemp = false;
  datosproy
  nombrepro
  @ViewChild("modalLinks") modalLinks: ModalBasicComponent
  @Input('height') heightacu: number = 100;
  @Input() set tabproyecto(value: any) {
    this.prueba = value;
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    this.nombrepro=datosproy.value
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.idUsuario = datosrec.value.id_usuario;
    this.id_userproy = datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    // this.datosproy= datosproy.value
    this.simbolo = datosrec.value.simbolo;
  }
  constructor(
    private principalService: PrincipalService,
    private encriptadorService: EncriptadorService,
    public formService: FormsService,
    private toaster: ToastrService,
    private presuservice: PresupuestosService,
  ) {}
  idUsuario
  datasourceDeta=[]
  idUadmin: any;
  async ngOnInit() {
    await this.onResize(null);
    this.idUadmin = await this.encriptadorService.recuperarlocalstory('id_admin');
    this.permiso = (!this.solover||this.idUadmin== this.idUsuario)? true:false
    await this.CrearGrupo(true)
    let res = await this.presuservice.ListarPresuIndirecto({
      id_usuario: this.idUsuario,
      id_proyecto: this.id_proyecto,
      titulo: 0,
    });
    if (res.id == '1') {
      let tabs = JSON.parse(res.tabla);
        this.datasourcePri = tabs[0];
        this.datasourceDeta = tabs[1];
      }
  }
  
  async CrearGrupo(bool=false){
    const form = this.myGroup 
    const res = await this.principalService.lisTarProysAdicional({ id_proyecto: this.id_proyecto })
    const data = res?.[1]?.[0]
    form.patchValue({
      descripcion: this.nombrepro.descripcion || '',
      fecha_elaboracion: data?.ini_programado?.split('T')[0] || '',
      plazo: data?.plazo || '',
      fecha_inicio: data?.ini_real?.split('T')[0] || '',
      fecha_culmina: data?.fecha_culmina?.split('T')[0] || ''
    });
    form.disable();
    if(bool){
      this.arreglomostrar=res?.[0]||[]
      await this.ordenarJerarquia(this.arreglomostrar)
    }
  } 
  async listarLinks(){
    const arreglo  = await this.principalService.lisTarProysAdicional({ id_proyecto: this.id_proyecto })
    this.arreglomostrar= arreglo?.[0]||[]
    await this.ordenarJerarquia(this.arreglomostrar)
  }
  async ordenarJerarquia(arr:any[]) {
    if (!arr || arr.length === 0) {
      this.arreglomostrar = [];
      this.id_fila = 0; 
      return;
    }
    const usados = new Set<number>();
    const resultado: any[] = [];
    const principales = arr.filter(item => {
      const esPrincipal = item.filaagru === null;
      if (typeof item.idfila === 'number') {
        usados.add(item.idfila); 
      }
      return esPrincipal;
    });
  
    const hijos = arr.filter(item => {
      const esHijo = item.filaagru !== null;
      if (typeof item.idfila === 'number') {
        usados.add(item.idfila); 
      }
      return esHijo;
    });
  
    for (const padre of principales) {
      const hijosDelPadre = hijos.filter(hijo => hijo.filaagru === padre.idfila);
      padre.mostrar = 1;
      padre.icomost = '1';
      padre.totalsub = hijosDelPadre.length;
      resultado.push(padre);
      for (const hijo of hijosDelPadre) {
        hijo.mostrar = 1;
        resultado.push(hijo);
      }
    }
    let nuevoId = 0;
    while (usados.has(nuevoId)) {
      nuevoId++;
    }
    this.id_fila=nuevoId
    this.arreglomostrar = resultado;
  }
  async habilitarEdicionDatosProyecto() {
    if (this.permiso) {
      this.myGroup.enable();
      this.myGroup.get('descripcion').disable()
    } else {
      this.myGroup.disable();
    }
    this.permiso = !this.permiso;
  }
  async actualizarDatosProyecto() {
    try {
      let fechainicioInvalida = false
      var fechaSeleccionado = new Date(this.myGroup.get('fecha_inicio').value)
      const Fi = moment(this.myGroup.get('fecha_inicio').value).format('YYYY-MM-DD')
      const arrayDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      var nombreDia = arrayDays[fechaSeleccionado.getDay()];
      let encontrado1 = false
      let encontrado = false
      const aspectos = await this.principalService.ListarAspectosDiasProy({ id_proyecto:this.id_proyecto })
      if(aspectos[0].length>0){
        let diasnolabo=aspectos[0][0].nolabo1?(aspectos[0][0].nolabo1.toString().includes('|')?aspectos[0][0].nolabo1.toString().split('|'):[aspectos[0][0].nolabo1.toString()]):[];
        if (aspectos[0][0]) {
          encontrado1 = diasnolabo.find(ele => ele==nombreDia.toUpperCase())?true:false;
        }
      }
      if (aspectos[1]) {
        encontrado = aspectos[1].find(ele => moment(ele.fecha).format('YYYY-MM-DD') == Fi && !ele.laborado)
      }
      fechainicioInvalida = encontrado || encontrado1 ? true : false
      if (this.myGroup.invalid) {
        this.myGroup.markAllAsTouched()
        SwalService.error('Advertencia', 'Datos Incompletos')
        return
      } else if (fechainicioInvalida) {
        this.toaster.error('La Fecha Inicio Seleccionada es  dia no laborable', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      } else {
        this.mostrar_carga_todo = true;
        const modificarProyecto = {
          id_proyecto: this.id_proyecto,
          ini_programado: this.myGroup.get('fecha_elaboracion').value? this.myGroup.get('fecha_elaboracion').value:'',
          plazo: this.myGroup.get('plazo').value? this.myGroup.get('plazo').value: '',
          ini_real: this.myGroup.get('fecha_inicio').value? this.myGroup.get('fecha_inicio').value: '',
          fecha_culmina: this.myGroup.get('fecha_culmina').value? this.myGroup.get('fecha_culmina').value: '',
          fecha_actual: new Date().toISOString().split('T')[0].toString()
        };
        const response = await this.principalService.guardarProysAdicional(modificarProyecto)
        this.mostrar_carga_todo = false;
        if (response.id == '1') {
          SwalService.success();
          await this.habilitarEdicionDatosProyecto();
        } else {
          SwalService.error('Advertencia', response.mensaje);
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error()
    }
  }
  async cancelarEditarDatosProyecto() {
    await this.CrearGrupo();
    await this.habilitarEdicionDatosProyecto();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var windowHeight = window.innerHeight;
    var resto = 220;
    if (document.body.clientWidth <= 992) {
      resto = 240;
    }
    this.height = windowHeight - resto;
    return;
  }
  async onNavChange(event) {
    if (event.nextId == 1) {
      this.activetab = 1;
    } else if (event.nextId == 2) {
      this.activetab = 2;
    } else if (event.nextId == 3) {
      this.activetab = 3;
    } else if (event.nextId == 4) {
      this.activetab = 4;
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioSubMenu(value) {
    this.idnav = value;
  }
  ultindice = -1;
  datasourcePriacu = [];
  datasourcePrisub = [];
  datasourcePrisubaux;
  butselprecio = '3';
  titsel = '0';
  filaSel = -1;
  mostrarError(mensaje, titulo, tiempo) {
    this.toaster.error(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarInfo(mensaje, titulo, tiempo) {
    this.toaster.info(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarAdvertencia(mensaje, titulo) {
    this.toaster.warning(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }
  async cambindiceselpresu(ind: any, compara = false) {
    if (ind != this.filaSel || compara) {
      this.filaSel = ind;
    }
  }
  async CambTiporeg(value, indice) {
    this.datasourcePri[indice].tipo_registro = value;
    if (value == 2) {
      this.datasourcePri[indice].monto2 = 0;
    }else if(value==4){
      this.datasourcePri[indice].formula = '';
      this.datasourcePri[indice].monto2 = 0;
    }
  }
  agregarFila() {
    if (this.titsel == '0') {
      let indins = -1;
      let maxorden = -1;
      if (this.filaSel == -1 || this.filaSel == this.datasourcePri.length - 1) {
        //fin
        let orden
        indins = this.datasourcePri.length;
        if(this.datasourcePri.length==0){
          orden=0
        }else{
          orden=this.datasourcePri[this.datasourcePri.length - 1].orden + 1
        }
        maxorden = orden;
      } else {
        //bajo seleccion
        indins = this.filaSel + 1;
        for (let m = 0; m < this.datasourcePri.length; m++) {
          if (m == indins) {
            maxorden = this.datasourcePri[m].orden;
            this.datasourcePri[m].orden++;
          } else if (m > indins) {
            this.datasourcePri[m].orden++;
          }
        }
      }
      let newindice = this.ultindice++;
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        titulo: this.titsel,
        indice: newindice,
        orden: maxorden,
        tipo_registro: 1,
        abrev: '',
        descripcion: '',
        formula: '',
        monto: 0,
        monto2: 0,
        incluyefp: 0,
        id_indice: null,
        id_usuario: this.id_userproy,
        aplicatit: 1,
        editar1: 0,
        editar2: 0,
        editar4: 0,
        editar5: 0,
        accion: 1, //0:nada,1:insertar,2:update , 3 eliminado esta en otra tabla
        //descant:any;
      };
      if (indins < this.datasourcePri.length) {
        this.datasourcePri.splice(indins, 0, filaagrega);
      } else {
        this.datasourcePri.push(filaagrega);
      }
    }
  }
  async SubirFila() {
    try {
      if (this.titsel == '0') {
        if (this.filaSel > -1) {
          let numsubir = this.filaSel - 1;
          if (numsubir >= 0) {
            let filaact = JSON.parse(
              JSON.stringify(this.datasourcePri[this.filaSel])
            ); //sube
            // filaact.orden=JSON.parse(JSON.stringify(this.datasourcePri[numsubir].orden));
            filaact.orden = this.datasourcePri[numsubir].orden;
            let filamuev = JSON.parse(
              JSON.stringify(this.datasourcePri[numsubir])
            ); //baja
            // filamuev.orden=JSON.parse(JSON.stringify(this.datasourcePri[this.filaSel].orden));
            filamuev.orden = this.datasourcePri[this.filaSel].orden;
            if (filamuev.tipo_registro != '3') {
              this.datasourcePri[this.filaSel] = filamuev;
              this.datasourcePri[numsubir] = filaact;
              this.filaSel = numsubir;
              // this.actualizarTemp(10);
            } else {
              this.toaster.error('La fila ya no puede subir.', 'Advertencia', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            }
          } else {
            this.toaster.error('La fila ya no puede subir.', 'Advertencia', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        } else {
          this.toaster.error('Seleccione una fila para subir.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      }
      console.table(JSON.parse(JSON.stringify(this.datasourcePri)), [
        'indice',
        'orden',
        'tipo_registro',
        'descripcion',
      ]);
    } catch (e) {
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      console.log(e);
    }
  }
  async BajarFila() {
    try {
      if (this.titsel == '0') {
        if (this.filaSel > -1) {
          let final =
            this.datasourcePri.length - 1 == this.filaSel ? true : false;
          if (!final) {
            let indinicam = this.filaSel + 1;
            let filaact = JSON.parse(
              JSON.stringify(this.datasourcePri[this.filaSel])
            );
            if (filaact.tipo_registro != '3') {
              filaact.orden = this.datasourcePri[indinicam].orden;
              let filamuev = JSON.parse(
                JSON.stringify(this.datasourcePri[indinicam])
              );
              filamuev.orden = this.datasourcePri[this.filaSel].orden;
              this.datasourcePri[this.filaSel] = filamuev;
              this.datasourcePri[indinicam] = filaact;
              this.filaSel = indinicam;
              // this.actualizarTemp(11);
            } else {
              this.toaster.error('La fila ya no puede bajar.', 'Advertencia', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            }
          } else {
            this.toaster.error('La fila ya no puede bajar.', 'Advertencia', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        } else {
          this.toaster.error('Seleccione una fila para bajar.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      }
      console.table(JSON.parse(JSON.stringify(this.datasourcePri)), [
        'indice',
        'orden',
        'tipo_registro',
        'descripcion',
      ]);
    } catch (e) {
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      console.log(e);
    }
  }
  TeclaCalcFin(event: any) {
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  async Editar1(ind: any) {
    if (
      this.datasourcePri[ind].tipo_registro != 3 &&
      this.titsel == '0' &&
      !this.solover
    ) {
      this.datasourcePri[ind].editar1 = 1;
    }
  }
  caneditar1(eve: any, ind2: any) {
    var valor = eve.toString().toUpperCase()
    var actual = this.datasourcePri[ind2].abrev
    this.datasourcePri[ind2].editar1 = 0
    if (valor !== actual) {
      if (!isNaN(valor)) {
        //verificar alfanumerico
        this.toaster.error(
          'La Abreviatura no puede ser un número.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
      let existe = this.datasourcePri.find((ele) => ele.abrev == valor); //verificar que no exista en la tabla
      if (existe) {
        this.toaster.error(
          'La Abreviatura ya existe en la Tabla. Ingresar una abreviatura diferente',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
      } else {
        //actualizar formulas con la abreviatura
        for (let fila of this.datasourcePri) {
          let formuact = fila.formula ?? '';
          if (formuact != '') {
            const arregloResultado = this.convertirAArray(formuact);
            for (let a = 0; a < arregloResultado.length; a++) {
              if (arregloResultado[a] == actual) {
                arregloResultado[a] = valor
              }
            }
            fila.formula = arregloResultado.join('');
          }
        }
        this.datasourcePri[ind2].abrev = valor
          .replace(/\s+/g, '')
          .toUpperCase();
      }
    }
  }
  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/)
    const resultado = partes.filter((elemento) => elemento !== '')
    return resultado
  }
  presenter1(event: any, ind2: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditar1(this.datasourcePri[ind2].abrev, ind2); //el primer parametro es el valor de la celda a editar
    } else if (event.keyCode.toString() == '13') {
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      if (ind2 + 1 < this.datasourcePri.length) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          event.target.blur();
          this.datasourcePri[i].editar1 = 1
          break;
        }
      }
    } else if (event.keyCode.toString() == '38') {
      if (ind2 - 1 >= 0) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          event.target.blur();
          this.datasourcePri[i].editar1 = 1;
          break;
        }
      }
    }
  }
  async Editar2(ind: any) {
    if (
      this.datasourcePri[ind].tipo_registro != 3 &&
      this.titsel == '0' &&
      !this.solover
    ) {
      this.datasourcePri[ind].editar2 = 1;
    }
  }
  caneditar2(eve: any, ind2: any) {
    var valor = eve.toString();
    var actual = this.datasourcePri[ind2].descripcion;
    this.datasourcePri[ind2].editar2 = 0;
    if (valor !== actual) {
      this.datasourcePri[ind2].descripcion = valor.trim().toUpperCase();
    }
  }
  presenter2(event: any, ind2: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditar2(this.datasourcePri[ind2].descripcion, ind2); //el primer parametro es el valor de la celda a editar
    } else if (event.keyCode.toString() == '13') {
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      if (ind2 + 1 < this.datasourcePri.length) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          event.target.blur();
          this.datasourcePri[i].editar2 = 1;
          break;
        }
      }
    } else if (event.keyCode.toString() == '38') {
      if (ind2 - 1 >= 0) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          event.target.blur();
          this.datasourcePri[i].editar2 = 1;
          break;
        }
      }
    }
  }
  async Editar4(ind: any) {
    if (
      (this.datasourcePri[ind].tipo_registro == 1 ||this.datasourcePri[ind].tipo_registro == 4||
        this.datasourcePri[ind].tipo_registro == 2) &&
      this.titsel == '0' &&
      !this.solover
    ) {
      this.datasourcePri[ind].editar4 = 1;
    }
  }
  findabrev(input){
    let encontrado= this.datasourcePri.find((item)=>item.abrev==input)
    if(encontrado){
      return encontrado.monto
    }else{
      return ''
    }
  }
  async CalcularTabla() {
    let arraux = JSON.parse(JSON.stringify(this.datasourcePri));
    for (let a = 0; a < arraux.length; a++) {
      let formula = arraux[a].formula == null||arraux[a].formula == ''||arraux[a].tipo_registro==4 ? '' : arraux[a].formula;
      if (formula == '') {
        arraux[a].calculado = 1;
        if(arraux[a].tipo_registro==1){
        arraux[a].monto = arraux[a].monto2;
        }
      } else {
        arraux[a].calculado = 0;
      }
      arraux[a].indice = a;
    }
    console.log(arraux)
    for (let b = 0; b < arraux.length; b++) {
      if (arraux[b].calculado == 0) {
        let continua = true;
        const arregloResultado = this.convertirAArray(arraux[b].formula);
        for (let a = 0; a < arregloResultado.length; a++) {
          const operadores = arregloResultado[a].toString().match(/[+\-*()/]/g);
          // Si no hay operadores, devolver el arreglo con el string completo
          if (!operadores) {
            for (let row of arraux) {
              if (!isNaN(row.abrev)) {
                continue;
              }
              if (row.abrev == arregloResultado[a]) {
                if (row.calculado == 1) {
                  arregloResultado[a] = row.monto2;
                } else {
                  let raux = JSON.parse(JSON.stringify(arraux[b]));
                  arraux.splice(b, 1);
                  arraux.push(raux);
                  b--;
                  continua = false;
                  break;
                }
              }
            }
          }
          if (!continua) {
            break;
          }
        }
        if (continua) {
          let result = this.calcularformula(arregloResultado.join(''));
          if (result == null || result == Infinity) {
            //this.datasourcePri[i].formula='';
            arraux[b].monto2 = 0;
            let allnum=true;
            for(let a=0;a<arregloResultado.length;a++){
              const operadores = arregloResultado[a].toString().match(/[+\-*()/]/g);
              if (!operadores) {
                if(isNaN(Number(arregloResultado[a]))){
                  allnum=false;
                  break;
                }
              }
            }
            if(allnum){
              arraux[b].calculado=1
            }
          } else {
            arraux[b].monto2 = this.formService.redondeo(
              result,
              this.dec_parcial
            );
            arraux[b].calculado = 1;
          }
        }
      }
    }
    for (let filas of arraux) {
      this.datasourcePri[filas.indice].monto2 = filas.monto2;
       if(this.datasourcePri[filas.indice].tipo_registro==1){
        this.datasourcePri[filas.indice].monto = filas.monto2;
        }
    }
  }
  caneditar4(eve: any, ind2: any) {
    let vpas = eve ? eve.toString() : '';
    var valor = vpas.toUpperCase().replace(/\s+/g, '');
    var actual = this.datasourcePri[ind2].formula ?? '';
    this.datasourcePri[ind2].editar4 = 0;
    if (valor !== actual) {
      //validar formula antes de agregar
      if (valor == '') {
        this.datasourcePri[ind2].formula = valor.toUpperCase();
        this.datasourcePri[ind2].monto2 = this.formService.redondeo(
          0,
          this.dec_parcial
        );
        this.CalcularTabla();
      } else {
        if(this.datasourcePri[ind2].tipo_registro==4){
          let nuevo=this.findabrev(valor)
          if(nuevo===''){
            this.toaster.error(
              'La Abreviatura ingresada no existe.',
              'Advertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
            return
          }
        }
        const arregloResultado = this.convertirAArray(valor);
        let bucle = false;
        for (let a = 0; a < arregloResultado.length; a++) {
          const operadores = arregloResultado[a].match(/[+\-*()/]/g);
          // Si no hay operadores, devolver el arreglo con el string completo
          if (!operadores) {
            let abrbusc = this.datasourcePri[ind2].abrev;
            if (arregloResultado[a] == abrbusc) {
              bucle = true;
              break;
            }
            for (let row of this.datasourcePri) {
              if (row.abrev == arregloResultado[a]) {
                arregloResultado[a] = row.monto2;
                if ((row.formula ?? '') != '') {
                  bucle = this.VerifBucle(row.formula, abrbusc); //recursivo
                  if (bucle) {
                    break;
                  }
                }
              }
            }
          }
        }
        if (bucle) {
          this.toaster.error(
            'La formula ingresada genera un bucle infinito.',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
          return;
        }
        let result = this.calcularformula(arregloResultado.join(''));
        if (result == null || result == Infinity) {
          this.toaster.error(
            'La formula ingresada es incorrecta.',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
        } else {
          this.datasourcePri[ind2].formula = valor.toUpperCase();
          this.datasourcePri[ind2].monto2 = this.formService.redondeo(
            result,
            this.dec_parcial
          );
          this.CalcularTabla();
        }
      }
    }
  }
  calcularformula(texto) {
      try {
        return math.evaluate(texto);
      } catch {
        return null;
      }
    }
  VerifBucle(formula: any, vbusq: any) {
    const arregloResultado = this.convertirAArray(formula);
    let bucle = false;
    for (let a = 0; a < arregloResultado.length; a++) {
      const operadores = arregloResultado[a].match(/[+\-*()/]/g);
      if (!operadores) {
        if (arregloResultado[a] == vbusq) {
          bucle = true;
          break;
        }
        for (let row of this.datasourcePri) {
          if (row.abrev == arregloResultado[a]) {
            if ((row.formula ?? '') != '') {
              bucle = this.VerifBucle(row.formula, vbusq); //recursivo
              if (bucle) {
                break;
              }
            }
          }
        }
      }
    }
    return bucle;
  }
  presenter4(event: any, ind2: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditar4(this.datasourcePri[ind2].formula, ind2); //el primer parametro es el valor de la celda a editar
    } else if (event.keyCode.toString() == '13') {
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      if (ind2 + 1 < this.datasourcePri.length) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          event.target.blur();
          this.datasourcePri[i].editar4 = 1;
          break;
        }
      }
    } else if (event.keyCode.toString() == '38') {
      if (ind2 - 1 >= 0) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          event.target.blur();
          this.datasourcePri[i].editar4 = 1;
          break;
        }
      }
    }
  }
  async Editar5(ind: any) {
    if (
      this.titsel == '0' &&
      !this.solover
    ) {
      this.datasourcePri[ind].editar5 = 1;
    }
  }
  caneditar5(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].monto2);
    this.datasourcePri[ind2].editar5 = 0;
    if (valor !== actual) {
      this.datasourcePri[ind2].monto2 = Number(
        this.formService.redondeo(valor, this.dec_parcial)
      );
      this.CalcularTabla();
    }
  }
  presenter5(event: any, ind2: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditar5(this.datasourcePri[ind2].monto2, ind2); //el primer parametro es el valor de la celda a editar
    } else if (event.keyCode.toString() == '13') {
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      if (ind2 + 1 < this.datasourcePri.length) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          event.target.blur();
          this.datasourcePri[i].editar5 = 1;
          break;
        }
      }
    } else if (event.keyCode.toString() == '38') {
      if (ind2 - 1 >= 0) {
        //condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          event.target.blur();
          this.datasourcePri[i].editar5 = 1;
          break;
        }
      }
    }
  }
  async EliminarFila(ind) {
      if (this.titsel == '0') {
        if (this.Usafila(this.datasourcePri[ind].abrev)) {
          this.toaster.error(
            'La fila que desea eliminar esta vinculada a una FORMULA del Costo Indirecto.',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
        } else {
          let respu = await SwalService.confirm(
              'Esta seguro que desea Eliminar?',
              ''
            );
          if (!respu.isConfirmed) {
            return;
          }
          this.datasourcePri.splice(ind, 1);
          //actualizar indices
          for (let a = ind; a < this.datasourcePri.length; a++) {
            this.datasourcePri[a].orden = this.datasourcePri[a].orden - 1;
          }
          this.CalcularTabla();   
        }
      }
  }
  Usafila(vbusq: any) {
    let exis = false;
    for (let row of this.datasourcePri) {
      if ((row.formula ?? '') != '') {
        const arregloResultado = this.convertirAArray(row.formula);
        for (let a = 0; a < arregloResultado.length; a++) {
          const operadores = arregloResultado[a].match(/[+\-*()/]/g);
          if (!operadores) {
            if (arregloResultado[a] == vbusq) {
              exis = true;
              break;
            }
          }
        }
        if (exis) {
          break;
        }
      }
    }
    return exis;
  }

    public async guardarCambios() {
    try {
        this.mostrar_carga_todo = true;
        //ejemplos filas tabladetalle
        /* let obj1={
          id_proyecto:this.id_proyecto,
          indice:3,
          id_fila:1,
          item:null,
          descripcion:'titulo',
          unidad:null,
          incidencia:null,
          cantidad:null,
          tiempo:null,
          tarifa:null,
          total:'1000',
          orden:1,
          nivel:1,
          tipofila:0,
          formula:null
        }
        let obj2={
          id_proyecto:this.id_proyecto,
          indice:3,
          id_fila:2,
          item:null,
          descripcion:'detalle',
          unidad:'',
          incidencia:'1',
          cantidad:'2',
          tiempo:'2',
          tarifa:'250',
          total:'1000',
          orden:1,
          nivel:1,
          tipofila:0,
          formula:null
        }
        this.tablacambios.tabla2=[];
        this.tablacambios.tabla2.push(obj1)
        this.tablacambios.tabla2.push(obj2) */
        this.datasourcePri.forEach((item, index) => {
          item.indice = index + 1;
        })
        const tabla1 = JSON.stringify(this.datasourcePri);
        const tabla2 = JSON.stringify(this.datasourceDeta)
        const body = JSON.stringify({
          id_proyecto: this.id_proyecto,
          id_usuario: this.idUsuario,
          datos1: tabla1,
          datos2: tabla2,
        });
        let resp = await this.presuservice.GuardarCambiosPresIndir(body);
        this.mostrar_carga_todo = false;
        if (resp.id == '1') {
          this.toaster.success('Se guardó correctamente.', 'Correcto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        } else {
          this.toaster.error(resp.mensaje, 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
    }
  }
  myGroup = new UntypedFormGroup({
    descripcion: new UntypedFormControl(''),
    fecha_elaboracion: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
    plazo: new UntypedFormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(5000),
    ]),
    fecha_inicio: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
    fecha_culmina: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
  });
  get fecha_elaboracion(): UntypedFormControl {
    return this.myGroup.get('fecha_elaboracion') as UntypedFormControl;
  }
  get fecha_inicio(): UntypedFormControl {
    return this.myGroup.get('fecha_inicio') as UntypedFormControl;
  }
  get fecha_culmina(): UntypedFormControl {
    return this.myGroup.get('fecha_culmina') as UntypedFormControl;
  }
  fechaElaboracionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no aplicar validación
      }
      const fechaElaboracion = new Date(control.value);
      const fechaActual = new Date();
      // Calcular las fechas límites
      const fechaLimiteInferior = new Date(fechaActual);
      fechaLimiteInferior.setFullYear(fechaActual.getFullYear() - 25); // 25 años antes de la fecha actual
      const fechaLimiteSuperior = new Date(fechaActual);
      fechaLimiteSuperior.setFullYear(fechaActual.getFullYear() + 25); // 25 años después de la fecha actual
      // Validación: la fecha debe estar dentro del rango
      if (
        fechaElaboracion < fechaLimiteInferior ||
        fechaElaboracion > fechaLimiteSuperior
      ) {
        return {
          fechaInvalida:
            'La fecha debe estar entre 25 años antes y 25 años después de la fecha actual.',
        };
      }
      return null; // Si es válida
    };
  }
  calculandofecha = false;
  listaFeriados = [];
  arrayDiasNoLab = [];
  fechIniAlm: string;
  permiso: boolean;
  async CalculaFechaFin(valmod:any) {
    let datosProyecto=this.myGroup
    let fiform = datosProyecto.value.fecha_inicio!=''?moment(datosProyecto.value.fecha_inicio).format('YYYY-MM-DD'):'';
    let fcform = datosProyecto.value.fecha_culmina!=''?moment(datosProyecto.value.fecha_culmina).format('YYYY-MM-DD'):'';
    let plazoform = datosProyecto.value.plazo
    if(valmod==0){//plazo
      let plazores=!isNaN(Number(plazoform))?plazoform:1;
      if(plazores==null || plazores=='' || plazores==0){
        datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
        datosProyecto.get('plazo').setValue(1);
      }
      else{
        if(fiform){
          let fechaf=new Date(fiform);
          this.calculandofecha=true;
          fechaf.setDate(fechaf.getDate()+Number(plazores))
          this.calculandofecha=false;
          datosProyecto.get('fecha_culmina').setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    }else if(valmod==1){//inicio
      if(fiform){
        const nombDiaFi = moment(fiform).format('dddd').toUpperCase()
        const fechai = moment(fiform).format('YYYY-MM-DD')
 
        if(this.listaFeriados.includes(fechai) || this.arrayDiasNoLab.includes(nombDiaFi)) {
          datosProyecto.get('fecha_culmina').setValue(this.fechIniAlm)
          this.toaster.error('La fecha ingresada esta registrada como dia no laborable', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          return
        }

        let plazores=!isNaN(Number(plazoform))?plazoform:0;
        if(plazores==null || plazores==''){
          datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
        }
        else{
          let fechaf=new Date(fiform);
          this.calculandofecha=true;
          fechaf.setDate(fechaf.getDate()+Number(plazores))
          this.calculandofecha=false;
          datosProyecto.get('fecha_culmina').setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    }else if(valmod==2){//culmina
      if(fcform!=''){
        if(fiform!=''){
          //fecha culmina menor, error, asignar fecha actual plazo 1 dia
          let fechaa = moment(fiform);
          let fechab = moment(fcform);
          let difdias=fechab.diff(fechaa, 'days');
          if(difdias<0){
            this.toaster.error('La Fecha de Culminación no puede ser menor a la Fecha Inicial.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
            datosProyecto.get('plazo').setValue(1);
          }
          else{
            datosProyecto.get('plazo').setValue(difdias+1)
          }
        }
      }
    }
  }
  editar=false
  ver=false
  datos
  async openModal(datos = null, editar = null, ver = null) {
    this.editar=editar
    this.ver=ver
    if(!editar && !ver){
      this.formLinks.get('descripcion').setValue('')
      this.formLinks.get('link').setValue('')
      this.formLinks.get('observacion').setValue('')
    }else if(editar && !ver){
      this.datos=datos
      this.formLinks.get('descripcion').setValue(datos?.descripcion)
      this.formLinks.get('link').setValue(datos?.link)
      this.formLinks.get('observacion').setValue(datos?.observacion)
    }else{
      this.datos=datos
      this.formLinks.get('descripcion').setValue('')
      this.formLinks.get('link').setValue('')
      this.formLinks.get('observacion').setValue('')
    }
    this.modalLinks.show()
  }
  closeModal(){
    this.modalLinks.hide()
  }
  formLinks = new UntypedFormGroup({
      descripcion: new UntypedFormControl('', [Validators.required]),
      link: new UntypedFormControl('', [Validators.required]),
      observacion: new UntypedFormControl('', [Validators.required]),
    })
    get descripcion(): UntypedFormControl { return this.formLinks.get('descripcion') as UntypedFormControl }
    get link(): UntypedFormControl { return this.formLinks.get('link') as UntypedFormControl }
    get observacion(): UntypedFormControl { return this.formLinks.get('observacion') as UntypedFormControl }
  async almacenar(){
    if (!this.editar&&!this.ver) {
      await this.guardar(1)
    } else if(this.editar && !this.ver) {
      await this.actualizar()
    }else if(this.editar && this.ver){
      await this.guardar(2)
    }
  }
  id_fila
  async guardar(int) {
    const valor= int==1? '': this.datos.idfila 
    try {
      if (this.formLinks.invalid) {
        this.formLinks.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          idfila:this.id_fila,
          filaagru:valor,
          id_proyecto:this.id_proyecto,
          descripcion:this.formLinks.get('descripcion').value.toUpperCase(),
          link:this.formLinks.get('link').value,
          observacion:this.formLinks.get('observacion').value,
        }
        const respuesta = await this.principalService.guardarProyectoLinks(datos)
        console.log(respuesta)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarLinks()
          this.closeModal()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async actualizar() {
    try {
      if (this.formLinks.invalid) {
        this.formLinks.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          idfila:this.datos.idfila,
          id_proyecto:this.id_proyecto,
          descripcion:this.formLinks.get('descripcion').value.toUpperCase(),
          link:this.formLinks.get('link').value,
          observacion:this.formLinks.get('observacion').value,
        }
        const respuesta = await this.principalService.modificarProyectoLinks(datos)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarLinks()
          this.closeModal()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  toggleOff(indice) {
    const arra2= this.arreglomostrar
    arra2[indice].icomost=0
    for (let j=indice+1;j<arra2.length;j++){
      if(arra2[j].filaagru==null){
        break;
      }else{
        arra2[j].mostrar=0
      }
    }
  }
  toggleOn(indice) {
    const arra2= this.arreglomostrar
    arra2[indice].icomost=1
    for (let j=indice+1;j<arra2.length;j++){
      if(arra2[j].filaagru==null){
        break;
      }else{
        arra2[j].mostrar=1
      }
    }
  }
  maxtodo(){
    const arra2= this.arreglomostrar
    for (let j=0;j<arra2.length;j++){
      if(arra2[j].filaagru==null){
        arra2[j].icomost=1
      }else{
        arra2[j].mostrar=1
      }
    }
  }
  mintodo(){
    const arra2= this.arreglomostrar
    for (let j=0;j<arra2.length;j++){
      if(arra2[j].filaagru==null){
        arra2[j].icomost=0
      }else{
        arra2[j].mostrar=0
      }
    }
  }
  async eliminarLink(row){
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la fila selecionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarLink = {
          id_proyecto:this.id_proyecto,
          idfila: row.idfila
        }
        const respuesta = await this.principalService.eliminarProyectoLinks(eliminarLink)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          SwalService.success()
          await this.listarLinks()
        }else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }

  }

}
