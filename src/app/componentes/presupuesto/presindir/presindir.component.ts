import {Component,OnInit,Input,HostListener,ViewChild,  ElementRef,ChangeDetectorRef} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import * as math from 'mathjs';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';

export interface rowpri {
  id_proyecto: any;
  titulo: any;
  indice: any;
  orden: any;
  tipo_registro: string;
  abrev: any;
  descripcion: any;
  formula: any;
  monto: any;
  incluyefp: any;
  id_indice: any;
  id_usuario: any;
  aplicatit: any;
  editar1: any;
  editar2: any;
  editar3: any;
  editar4: any;
  editar5: any;
  accion: any; //0:nada,1:insertar,2:update , 3 eliminado esta en otra tabla
  //descant:any;
  //formulaincorrecta:any;//0 correcto, 1 incorrecto
}
export interface rowcambio {
  tabla: any;
  tabla2: any;
  ultindice: any;
}

@Component({
  selector: 'app-presindir',
  templateUrl: './presindir.component.html',
  styleUrls: ['./presindir.component.scss'],
})
export class PresindirComponent implements OnInit {
  @Input('height') height: number = 100;
  mostrar_carga_todo = false;
  mostrar_carga = false;
  vistagrande = true;
  expanded = false;
  id_proyecto = '';
  id_user: any;
  decima: any;
  solover = false;
  moneda = 'S/';
  simbolo='S/'
  plazoejec = '';
  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
    this.plazoejec = datosproy.get('plazo').value.toString();
    this.simbolo=datosrec.value.simbolo
  }

  //guardar
  ultindice = -1;
  buscando = false;
  datasourcePri = [];
  filaSel = -1;
  datasourceDeta = [];
  filaSeldet = -1;
  existetemp = false;
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_porc = 5;
  mask_porc = '0.5';
  listaIndices = [];
  listaTitulos = [];
  titsel = '0';
  tablacambios: rowcambio;

  constructor(
    private encriptadorService: EncriptadorService,
    private presuservice: PresupuestosService,
    private toaster: ToastrService,
    public formService: FormsService,
    public configuracionService: ConfiguracionService,
    public metradoService: MetradoService,
    public formsService: FormsService,
    private principalService: PrincipalService,
    private modalService: NgbModal,
    private cdRef:ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.mostrar_carga = true;
    this.buscando = true;
    var resto = 210;
    this.height = window.innerHeight - resto;
    this.id_user = await this.encriptadorService.recuperarlocalstory(
      'idusuario'
    );
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.id_proyecto,
      id_usuario: this.id_user,
    });
    if (datoaccs?.length > 0) {
      if (datoaccs[0].indir == 0) {
        this.solover = true;
      }
    }
    this.mostrar_carga = false;
    let decimales = this.decima;
    if (decimales?.toString().includes('|')) {
      let arrdec = decimales.split('|');
      this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
    }
    await this.listarIndicesUnificados();
    await this.listarTitulos(null);
    let presutemp = await this.presuservice.ListarIndirectoTemp({
      id_proyecto: this.id_proyecto,
      id_usuario: this.id_user,
    });
    if (presutemp.length > 0) {
      this.existetemp = true;
      if (presutemp[0].datatemp != '[]') {
        this.tablacambios = JSON.parse(presutemp[0].datatemp);
        this.listarPresupuesto();
      } else {
        this.toaster.error(
          'No se pudo cargar los cambios temporales.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
      }
    } else {
      this.buscando = true;
      let res = await this.presuservice.ListarPresuIndirecto({
        id_usuario: this.id_user,
        id_proyecto: this.id_proyecto,
        titulo: 0,
      });
      if (res.id == '1') {
        let tabs = JSON.parse(res.tabla);
        this.datasourcePri = tabs[0];
        this.datasourceDeta = tabs[1];
        this.ultindice = res.ultindice;
        if (res.observacion == '1') {
          this.CalcularTabla();
        }
      }
      await this.GetTabladetalles()
      this.auxindice=this.tablaDetalles[0]?.indice
      let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
      this.tablaSistema = resp[1].filter((item)=>item.indice==this.auxindice)
    }
    let elementoEncontrado = this.datasourcePri.find(item => item.tipo_registro === 3)
    this.abretotal=elementoEncontrado.abrev
    this.totaldir=elementoEncontrado.monto
    await this.IniciarestilosIndirectos()
    this.cambiarFuente('1');
    this.buscando = false;
    this.mostrar_carga = false;
  }
  private viewCheckedExecuted = false; 
  ngAfterViewChecked() {
    if (!this.viewCheckedExecuted && this.box2) {
      setTimeout(() => {
        this.CheckTamanio();
        this.viewCheckedExecuted = true; 
        this.cdRef.detectChanges(); 
      }, 0);
    }
  }

  async GetTabladetalles(){
    this.tablaDetalles = await this.datasourcePri.filter(
      (item) => item.tipo_registro === 4
    );
  }
  async IniciarestilosIndirectos(){
    const respt= await this.principalService.ListarEstilosProy({id_proyecto:this.id_proyecto})
    let array= respt[0].estilo_ind?respt[0].estilo_ind:'|||||'
    let array1=array.split('|')[0]
    let array2=array.split('|')[1]
    let array3=array.split('|')[2]
    let array4=array.split('|')[3]
    let array5=array.split('|')[4]
    let array6= array.split('|')[5]
    this.stilosTit=array1? { color: array1.split(';')[0], alineamiento:array1.split(';')[1], tipo:array1.split(';')[2], size:array1.split(';')[3]}:{ color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
    this.stilosMet=array2? { color: array2.split(';')[0], alineamiento:array2.split(';')[1], tipo:array2.split(';')[2], size:array2.split(';')[3]}:{ color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
    this.stilosSubM=array3? { color: array3.split(';')[0], alineamiento:array3.split(';')[1], tipo:array3.split(';')[2], size:array3.split(';')[3]}:{ color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
    this.stilosTexto=array4? { color: array4.split(';')[0], alineamiento:array4.split(';')[1], tipo:array4.split(';')[2], size:array4.split(';')[3]}:{ color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
    this.stilosTexto2=array5? { color: array5.split(';')[0], alineamiento:array5.split(';')[1], tipo:array5.split(';')[2], size:array5.split(';')[3]}:{ color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
    this.dec_indirectos = array6? array6:2
    this.CompletarTablaSistema()
  }
  @HostListener('window:resize', ['$event'])
  async onResize() {
    var resto = 210;
    this.height = window.innerHeight - resto;
    if (document.body.clientWidth <= 768) {
      this.vistagrande = false;
      //this.mostrarModal = true;
    } else {
      //this.mostrarModal = false;
      this.vistagrande = true;
      if (!this.expanded) {
        //this.cerrarModal()
      }
    }
   await this.CheckTamanio()
  }
  async CheckTamanio(){
    setTimeout(() => {
      if (this.box2) {
        const wBotones = this.box2.nativeElement.clientWidth;
        if (wBotones < 800) {
          this.scrollbut = true;
        } else {
          this.scrollbut = false;
        }
      }
    }, 0);
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async listarPresupuesto() {
    //buscar en cambios, sino cargar de bd
    this.buscando = true;
    this.datasourcePri = [];
    if (this.tablacambios && this.titsel == '0') {
      this.datasourcePri = this.tablacambios.tabla;
      this.datasourceDeta=this.tablacambios.tabla2
      this.tablaDetalles = await this.datasourcePri.filter(
        (item) => item.tipo_registro === 4
      );
      this.auxindice=this.tablaDetalles[0]?.indice
      this.tablaSistema = this.tablacambios.tabla2.filter((item)=>item.indice==this.auxindice);
      this.ultindice = this.tablacambios.ultindice;
    } else {
      if (this.titsel == '0') {
        let res = await this.presuservice.ListarPresuIndirecto({
          id_usuario: this.id_user,
          id_proyecto: this.id_proyecto,
          titulo: this.titsel,
        });
        if (res.id == '1') {
          let tabs = JSON.parse(res.tabla);
          this.datasourcePri = tabs[0];
          this.datasourceDeta = tabs[1];
          this.ultindice = res.ultindice;
          this.CalcularTabla();
          //}
        }
      } else {
        let tabcalc = [];
        if (this.tablacambios) {
          tabcalc = JSON.parse(JSON.stringify(this.tablacambios.tabla));
        } else {
          let res = await this.presuservice.ListarPresuIndirecto({
            id_usuario: this.id_user,
            id_proyecto: this.id_proyecto,
            titulo: this.titsel,
          });
          if (res.id == '1') {
            let tabs = JSON.parse(res.tabla);
            tabcalc = tabs[0];  
          }
        }
        let titulo = this.listaTitulos.find((ele) => ele.item == this.titsel);
        let costotit = 0;
        let valprop = 1;
        let sumtot = 0;
        for (let rowf of this.listaTitulos) {
          sumtot += Number(rowf.parcial);
        }
        for (let a = 0; a < tabcalc.length; a++) {
          if (tabcalc[a].tipo_registro == 3) {
            //costo directo
            tabcalc[a].monto = titulo.parcial;
            costotit = Number(titulo.parcial);
            valprop = costotit / sumtot;
          } else {
            tabcalc[a].monto = this.formService.redondeo(
              Number(tabcalc[a].monto) * valprop,
              this.dec_parcial
            );
          }
          if (tabcalc[a].aplicatit == 0) {
            tabcalc.splice(a, 1);
            a--;
          }
        }
        this.datasourcePri = tabcalc;
        //this.CalcularTabla();
      }
    }
    await this.GetTabladetalles()
    this.auxindice=this.tablaDetalles[0]?.indice
    this.buscando = false;
  }
  async listarIndicesUnificados() {
    try {
      this.listaIndices = [];
      this.listaIndices =
        await this.configuracionService.listarIndiceUnificados();
    } catch (e) {
      SwalService.error();
    }
  }
  async listarTitulos(inicio) {
    const response = await this.metradoService.listarTitulosDeMetrados({
      id_proyecto: this.id_proyecto,
    });
    if (response) {
      this.listaTitulos = response;
    }
  }
  async cambindiceselpresu(ind: any, compara = false) {
    if (ind != this.filaSel || compara) {
      this.filaSel = ind;
    }
  }
  agregarFila() {
    if (this.titsel == '0') {
      let indins = -1;
      let maxorden = -1;
      if (this.filaSel == -1 || this.filaSel == this.datasourcePri.length - 1) {
        //fin
        indins = this.datasourcePri.length;
        maxorden = this.datasourcePri[this.datasourcePri.length - 1].orden + 1;
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
        incluyefp: 0,
        id_indice: null,
        id_usuario: this.id_user,
        aplicatit: 1,
        editar1: 0,
        editar2: 0,
        editar3: 0,
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
      //this.inserta.push(filaagrega);
      //this.cambindiceselpresu(indini);
      //this.EditarDesc(indini);
      this.actualizarTemp(4);
    }
  }
  actualizarTemp(ind) {
    //temporal en bd como midiumtext
    //actualizar cambios en la tablacambios
    if (this.tablacambios) {
      this.tablacambios.tabla = this.datasourcePri;
      this.tablacambios.tabla2 = this.datasourceDeta;
      this.tablacambios.ultindice = this.ultindice;
    } else {
      let agrega: rowcambio = {
        tabla: this.datasourcePri,
        tabla2: this.datasourceDeta,
        ultindice: this.ultindice,
      };
      this.tablacambios = agrega;
    }
    const tabla1 = JSON.stringify(this.tablacambios);
    this.presuservice.GuardarIndirectoTemp({
      id_proyecto: this.id_proyecto,
      id_usuario: this.id_user,
      datatemp: tabla1,
    });
    this.existetemp = true;
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
        this.actualizarTemp(8);
      }
    }
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
      this.actualizarTemp(8);
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
  /* Editar3(ind:any){
    if(this.datasourcePri[ind].tipo_registro==1){
      this.datasourcePri[ind].editar3 = 1;
    }
  }
  async caneditar3(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].porcentaje)
    this.datasourcePri[ind2].editar3 = 0;
    if (valor != actual) {
      this.datasourcePri[ind2].porcentaje=Number(this.formService.redondeo(valor, this.dec_porc));
      //this.calculartotalpadres(ind2);//calcular todas las formulas donde aparece,tambien usar al inicio si el presupuesto directo cambia

      this.actualizarTemp(9);
    }
  }
  presenter3(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditar3(this.datasourcePri[ind2].porcentaje,ind2)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
            event.target.blur();
            this.datasourcePri[i].editar3 = 1;
            break;
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {
        for (let i = ind2 - 1; i >= 0; i--) {
            event.target.blur();
            this.datasourcePri[i].editar3 = 1;
            break;
        }
      }
    }
  } */
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
  caneditar4(eve: any, ind2: any) {
    let vpas = eve ? eve.toString() : '';
    var valor = vpas.toUpperCase().replace(/\s+/g, '');
    var actual = this.datasourcePri[ind2].formula ?? '';
    this.datasourcePri[ind2].editar4 = 0;
    if (valor !== actual) {
      //validar formula antes de agregar
      if (valor == '') {
        this.datasourcePri[ind2].formula = valor.toUpperCase();
        this.datasourcePri[ind2].monto = this.formService.redondeo(
          0,
          this.dec_parcial
        );
        this.CalcularTabla();
        this.actualizarTemp(8);
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
                arregloResultado[a] = row.monto;
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
          this.datasourcePri[ind2].monto = this.formService.redondeo(
            result,
            this.dec_parcial
          );
          //volver a calcular el total de celda, y los totales de la tabla
          this.CalcularTabla();
          this.actualizarTemp(8);
        }
      }
    }
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
      this.datasourcePri[ind].tipo_registro == 1 &&
      this.titsel == '0' &&
      !this.solover
    ) {
      this.datasourcePri[ind].editar5 = 1;
    }
  }
  caneditar5(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].monto);
    this.datasourcePri[ind2].editar5 = 0;
    if (valor !== actual) {
      //verificar que no se duplique la abreviatura
      this.datasourcePri[ind2].monto = Number(
        this.formService.redondeo(valor, this.dec_parcial)
      );
      this.datasourcePri[ind2].formula = null;
      this.CalcularTabla();
      this.actualizarTemp(8);
    }
  }
  presenter5(event: any, ind2: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditar5(this.datasourcePri[ind2].monto, ind2); //el primer parametro es el valor de la celda a editar
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
  totaldir
  abretotal
  async CalcularTabla() {
    //calcular en nueva tabla, si no existe el valor dependiente se mueve al final
    let arraux = JSON.parse(JSON.stringify(this.datasourcePri));
    for (let a = 0; a < arraux.length; a++) {
      if(arraux[a].tipo_registro==4){
        arraux[a].formula=null
        if(this.existetemp){
          if (this.tablacambios && this.titsel == '0'){
            let res = this.tablacambios.tabla2.filter((item)=>item.indice==arraux[a].indice)
            arraux[a].monto= this.calcularTotal(res)
          }
        }else{
          let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
            let res = resp[1].filter((item)=>item.indice==arraux[a].indice)
            arraux[a].monto= this.calcularTotal(res)
        }
      }
      let formula = arraux[a].formula == null||arraux[a].tipo_registro==4 ? '' : arraux[a].formula;
      if (formula == '') {
        arraux[a].calculado = 1;
      } else {
        arraux[a].calculado = 0;
      }
      arraux[a].indice = a;
    }
    for (let b = 0; b < arraux.length; b++) {
      if (arraux[b].calculado == 0) {
        let continua = true;
        const arregloResultado = this.convertirAArray(arraux[b].formula);
        for (let a = 0; a < arregloResultado.length; a++) {
          const operadores = arregloResultado[a].toString().match(/[+\-*()/]/g);
          // Si no hay operadores, devolver el arreglo con el string completo
          if (!operadores) {
            for (let row of arraux) {
              // if (!isNaN(row.abrev)) {
              //   continue;
              // }
              if (row.abrev == arregloResultado[a]) {
                if (row.calculado == 1) {
                  arregloResultado[a] = row.monto;
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
            arraux[b].monto = 0;
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
            arraux[b].monto = this.formService.redondeo(
              result,
              this.dec_parcial
            );
            arraux[b].calculado = 1;
          }
        }
      }
    }
    for (let filas of arraux) {
      this.datasourcePri[filas.indice].monto = filas.monto;
    }
  }
  Cambioincluyefp(row: any) {
    if (this.titsel == '0') {
      row.incluyefp = row.incluyefp == 0 ? 1 : 0;
      if (row.incluyefp == 0) {
        row.id_indice = null;
      } else {
        row.id_indice = 39;
      }
      this.actualizarTemp(12);
    }
  }
  CambIndunif(value: any, row: any) {
    row.id_indice = value;
    this.actualizarTemp(12);
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
        let respu
        if(this.datasourcePri[ind].tipo_registro==4){
           respu = await SwalService.confirm(
            'Se eliminaran los costos desagregados, Esta seguro que desea Eliminar ?',
            ''
          );
        }else{
           respu = await SwalService.confirm(
            'Esta seguro que desea Eliminar?',
            ''
          );
        }
        if (!respu.isConfirmed) {
          return;
        }
        if(this.datasourcePri[ind].tipo_registro==4){
          this.datasourceDeta = this.datasourceDeta.filter(item => item.indice !== this.datasourcePri[ind].indice);
        }
        this.datasourcePri.splice(ind, 1);
        //actualizar indices
        for (let a = ind; a < this.datasourcePri.length; a++) {
          this.datasourcePri[a].orden = this.datasourcePri[a].orden - 1;
        }
        await this.GetTabladetalles()
        //calcular totales, si no existe se borra la formula?eliminar elemento de formulas
        this.CalcularTabla();
        this.actualizarTemp(11); //crear otro actualizar y eliminar la abrev de la formula
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
      if (!this.existetemp) {
        this.mostrarInfo('No hay Cambios para Guardar.', 'Información',5000)
      } else {
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
        const tabla1 = JSON.stringify(this.tablacambios.tabla);
        const tabla2 = JSON.stringify(this.tablacambios.tabla2)
        const body = JSON.stringify({
          id_proyecto: this.id_proyecto,
          id_usuario: this.id_user,
          datos1: tabla1,
          datos2: tabla2,
        });
        let resp = await this.presuservice.GuardarCambiosPresIndir(body);
        this.mostrar_carga_todo = false;
        if (resp.id == '1') {
          this.tablacambios = null;
          await this.listarPresupuesto();
          this.existetemp = false;
          let elementoEncontrado = this.datasourcePri.find(item => item.tipo_registro === 3)
          this.abretotal=elementoEncontrado.abrev
          this.totaldir=elementoEncontrado.monto
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
  async descartaCambios() {
    try {
      if (!this.existetemp) {
        this.mostrarInfo('No hay Cambios para Descartar.', 'Información',5000)
      } else {
        const respu = await SwalService.confirm(
          'Esta seguro que desea Descartar los Cambios que no Guardó?',
          ''
        );
        if (respu.isConfirmed) {
          this.mostrar_carga = true;
          await this.presuservice.DescartarCambiosIndirecto({
            id_proyecto: this.id_proyecto,
            id_usuario: this.id_user,
          }); //descomentar al implementar
          this.toaster.success(
            'Los cambios se descartaron correctamente.',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
          this.tablacambios = null;
          this.existetemp = false;
          await this.listarPresupuesto();
          await this.VerDetalles(this.auxindice,true)
          this.cambindiceselpresu(-1);
          this.mostrar_carga = false;
        }
      }
    } catch (e) {
      this.mostrar_carga = false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
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
              this.actualizarTemp(10);
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
              this.actualizarTemp(11);
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
  
  async CambTiporeg(value, indice) {
    if(this.datasourcePri[indice].tipo_registro =='4'){
      let indice2=this.datasourcePri[indice].indice
      if(this.existetemp){
        if (this.tablacambios && this.titsel == '0'){
          let res = this.tablacambios.tabla2.filter((item)=>item.indice==indice2)
          if(res.length>0){
            this.mostrarError('Limpie la tabla de Desagregados','',2000)
            return;
          }
        }
      }else{
        let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
        let res = resp[1].filter((item)=>item.indice==indice2)
        if(res.length>0){
          this.mostrarError('Limpie la tabla de Desagregados','',2000)
          return;
        }
      }
    }
    this.datasourcePri[indice].tipo_registro = value;
    if (value == 2) {
      this.datasourcePri[indice].monto = 0;
    }else if(value==4){
      this.datasourcePri[indice].formula = '';
      this.datasourcePri[indice].monto = 0;
    }
    await this.GetTabladetalles()
    this.CalcularTabla();
    this.actualizarTemp(12);
  }
  cambiarTitulo(item) {
    this.titsel = item;
    this.listarPresupuesto();
  }
  cambioseltpri(row) {
    if (row.aplicatit == 0) {
      row.aplicatit = 1;
    } else {
      row.aplicatit = 0;
    }
    this.actualizarTemp(13);
  }
  //metodo usar para listar de proyectos existentes
  async listIndirectoProy(objpas) {
    // let objpas = {
    //   id_proyecto: '3',
    // };
    let res = await this.presuservice.ListarIndirDetalleProy(objpas); //tabla con filas tipo 'Detalle' y los detalles para agregar a otros proyectos
    return res;
  }
  activetab = 1
  dec_indirectos
  auxindice
  auxidfila
  tablaDetalles = [];
  tablaSistema = [];
  filaSel2=null;
  metradoSeleccionado = null;
  mostrarColrs: boolean = false;
  ultiCelda: any;
  archivoText = null;
  seleccionCelda: any;
  bloquearBotones = false;
  copiadoCeldas: boolean = false;
  editable = false;
  habilitarMultipleSelect = false;
  inicioCeldaCopiado = null;
  finCeldaCopiado = null;
  habilitadoCopiar = false;
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('p2') public popover2: NgbPopover;
  @ViewChild('p3') public popover3: NgbPopover;
  @ViewChild('p4') public popover4: NgbPopover;
  stilosTit = { color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
  stilosMet = { color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
  stilosSubM = { color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
  stilosTexto = { color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
  stilosTexto2 = { color: '#415764', alineamiento: 'left', tipo: '1', size: '10' };
  tipoletra = [
    { id: '1', nombre: 'Normal' },
    { id: '2', nombre: 'Cursiva' },
    { id: '3', nombre: 'Negrita' },
    { id: '4', nombre: 'Cursiva Negrita' },
  ];
  tamanioletra = [
    { id: '6', nombre: '6' },
    { id: '7', nombre: '7' },
    { id: '8', nombre: '8' },
    { id: '9', nombre: '9' },
    { id: '10', nombre: '10' },
    { id: '11', nombre: '11' },
    { id: '12', nombre: '12' },
    { id: '13', nombre: '13' },
    { id: '14', nombre: '14' },
    { id: '15', nombre: '15' },
  ];
  alineamiento = [
    { id: 'left', nombre: 'Izquierda' },
    { id: 'center', nombre: 'Centro' },
    { id: 'right', nombre: 'derecha' },
  ];
  ultStilos: any;
  cantidadFilasTabla = 25;
  @ViewChild('modalEstilos') modalEstilos: ModalBasicComponent;
  @ViewChild('modalTotale') modalTotale: ModalBasicComponent;
  @ViewChild('modalProyecto') modalProyecto: ModalBasicComponent;
  cambiarcolor(valor, fila, columna) {
    this[fila][columna] = valor;
  }
  async onNavChange(event) {
    if (event.nextId == 1) {
    } else if (event.nextId == 2) {
      this.activetab = 2;
      this.auxindice=this.tablaDetalles[0]?.indice
      this.VerDetalles(this.auxindice,true)
      this.filaSel2 = null;
      this.metradoSeleccionado=null
    }
  }
  async cambioVista(ind){
    if(this.tablaDetalles.some((item)=>item.indice==this.datasourcePri[ind].indice)==true){
      this.activetab = 2;
      this.VerDetalles(this.datasourcePri[ind].indice)
    }else{
      this.mostrarInfo('Para crear y acceder a la tabla desagreado','Guardar Configuracion',4000)
    }
  }
  CompletarTablaSistema(){
    for(let row of this.tablaSistema){
      row.incidencia=row.incidencia==null||row.incidencia==''?'':row.incidencia
      row.cantidad=row.cantidad==null||row.cantidad==''?'':row.cantidad
      row.tiempo=row.tiempo==null||row.tiempo==''?'':row.tiempo
      row.total=row.total==null||row.total==''?'':row.total
      row.tarifa=row.tarifa==null||row.tarifa==''?'':row.tarifa
      row.mostrar= 1
      row.icomost=row.tipofila<5?0:1
    }
    this.auxidfila=this.tablaSistema.length
    if (this.tablaSistema.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - this.tablaSistema.length;
      for (let i = 0; i < faltantes; i++) {
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1
        };
        this.tablaSistema.push(filaagrega)
      }
    }
  }
  async VerDetalles(value=null,cond=false){
    this.mostrar_carga = true;
    this.auxindice=JSON.parse(JSON.stringify(value))
    this.tablaSistema=[]
    if(this.existetemp){
      if (this.tablacambios && this.titsel == '0'){
        this.tablaSistema = this.tablacambios.tabla2.filter((item)=>item.indice==value)
        this.CompletarTablaSistema()
      }
    }else{
      let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
      this.tablaSistema = await resp[1].filter((item)=>item.indice==value)
      this.CompletarTablaSistema()
    }
    this.actuaTablaSistema(cond)
    this.mostrar_carga = false
  }
  async seleccionRow(i) {
    this.filaSel2 = i
    this.mostrarColrs = false
    this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
    // this.stiloFormula()
  }
  async cerrarModal() {
    if (this.ultStilos) {
      this.stilosTit = this.ultStilos.stilosTit
      this.stilosMet = this.ultStilos.stilosMet
      this.stilosSubM = this.ultStilos.stilosSubM
      this.stilosTexto = this.ultStilos.stilosTexto
      this.stilosTexto2 = this.ultStilos.stilosTexto2
    }
    this.modalEstilos.hide();
  }
  async cerrarModalproyecto() {
    this.modalProyecto.hide()
  }
  async cerrarModal3(){
    this.modalTotale.hide();
    this.formulario1.get('agregarsubtitulos').setValue(false)
  }
  CambiarDecimales(value){
    this.dec_indirectos=value
  }
  async actualizarEstilosProyecto() {
    this.mostrar_carga_todo = true;
    const data= this.stilosTit.color+';'+this.stilosTit.alineamiento+';'+this.stilosTit.tipo+';'+this.stilosTit.size+'|'+
    this.stilosMet.color+';'+this.stilosMet.alineamiento+';'+this.stilosMet.tipo+';'+this.stilosMet.size+'|'+
    this.stilosSubM.color+';'+this.stilosSubM.alineamiento+';'+this.stilosSubM.tipo+';'+this.stilosSubM.size+'|'+
    this.stilosTexto.color+';'+this.stilosTexto.alineamiento+';'+this.stilosTexto.tipo+';'+this.stilosTexto.size+'|'+
    this.stilosTexto2.color+';'+this.stilosTexto2.alineamiento+';'+this.stilosTexto2.tipo+';'+this.stilosTexto2.size+'|'+
    this.dec_indirectos
    const response = await this.principalService.ModificarEstiloProy({id_proyecto:this.id_proyecto,estilo:data,donde:0})
    this.mostrar_carga_todo = false;
    if (response[0].id !== '1') {
      this.toaster.error('No se pudo guardar los cambios', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      })
    } else {
      for(let row of this.tablaSistema){
        row.total=row.total==null||row.total==''?'':this.formService.redondeo(row.total,this.dec_indirectos)
      }

      let auxilia= this.QuitarComas(this.auxtotal.replaceAll("'",""))
      this.auxtotal= this.FormatoTotal(this.formsService.redondeo(auxilia,this.dec_indirectos))
      this.modalEstilos.hide();
      this.toaster.success('Se guardo correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    }
  }
  habilitarEditarSistema(celda, rowIndex) {
    // if (this.solover ||this.bloquearBotones||!this.editable) {
    //   return;
    // }
    if (this.bloquearBotones &&this.tablaSistema[rowIndex].id_fila == null) {
      return;
    }
    if (!this.seleccionCelda && !this.copiadoCeldas) {
      this.filaSel2 = rowIndex;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      this.tablaSistema[rowIndex]['editar' + celda] = 1;
    } else {
      if (this.seleccionCelda) {
      } else {
        this.metradoSeleccionado = null;
        this.filaSel2 = null;
        const array = [
          'item',
          'descripcion',
          'unidad',
          'incidencia',
          'cantidad',
          'tiempo',
          'tarifa',
        ];
        if (!this.inicioCeldaCopiado && !this.finCeldaCopiado) {
          const ind = array.indexOf(celda);
          this.inicioCeldaCopiado = {
            fila: JSON.parse(JSON.stringify(rowIndex)),
            columna: ind == -1 ? null : ind,
            colname: celda,
          };
        } else if (this.inicioCeldaCopiado && !this.finCeldaCopiado) {
          const ind = array.indexOf(celda);
          this.finCeldaCopiado = {
            fila: JSON.parse(JSON.stringify(rowIndex)),
            columna: ind == -1 ? null : ind,
            colname: celda,
          };
        } else {
          this.inicioCeldaCopiado = null;
          this.finCeldaCopiado = null;
        }
      }
    }
  }
  alineamientoTexto(row) {
    let alineamiento = '';
    if (row.id_fila !== null) {
      if (row.tipofila == 1) {
        alineamiento = this.stilosTit.alineamiento
          ? this.stilosTit.alineamiento + '!important'
          : 'left';
      } else if (row.tipofila == 2) {
        alineamiento = this.stilosMet.alineamiento
          ? this.stilosMet.alineamiento + '!important'
          : 'left';
      } else if (row.tipofila == 3) {
        alineamiento = this.stilosSubM.alineamiento
          ? this.stilosSubM.alineamiento + '!important'
          : 'left';
      } else if (row.tipofila == 4) {
        alineamiento = this.stilosTexto.alineamiento
          ? this.stilosTexto.alineamiento + '!important'
          : 'left';
      } else {
        alineamiento = this.stilosTexto2.alineamiento
          ? this.stilosTexto2.alineamiento + '!important'
          : 'left';
      }
    }
    return alineamiento;
  }
  async modalEstilosDetalle() {
    const obj = {
      stilosTit: this.stilosTit,
      stilosMet: this.stilosMet,
      stilosSubM: this.stilosSubM,
      stilosTexto: this.stilosTexto,
      stilosTexto2: this.stilosTexto2,
    };
    this.ultStilos = JSON.parse(JSON.stringify(obj));
    this.modalEstilos.show();
  }
  arraytotales=[]
  auxtotal
  async modalTotales() {
    this.arraytotales= this.tablaSistema.filter((item)=>{
      if (item.tipofila == 2||item.tipofila==1) {
        return true;
    }})
    this.modalTotale.show();
  }
  mostrarError(mensaje, titulo,tiempo) {
    this.toaster.error(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarInfo(mensaje, titulo,tiempo) {
    this.toaster.info(mensaje,titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarAdvertencia(mensaje, titulo) {
    this.toaster.warning(mensaje,titulo,
      {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      }
    );
  }
  determinarDecimales(value: number, dec_indirectos: number) {
    let valueStr = value.toString();
    let decimales = 0;
    if (valueStr.includes(".")) {
        decimales = valueStr.split(".")[1].length;
    }
    let decimalesFinales = 0;
    if (decimales <=2) {
        decimalesFinales = 2; 
    } else if (decimales === 3) {
        decimalesFinales = 3; 
    } else if (decimales >= 4) {
        decimalesFinales = 4; 
    }
    if (dec_indirectos > decimalesFinales) {
        decimalesFinales = dec_indirectos;
    }
    return this.formsService.redondeo(value, decimalesFinales)
  }
  async blurInputSistema(event, i, input) {
    this.modificandofila = true
    this.saltardescripcion = false
    let value = event.target.value
    this.tablaSistema[i]['editar' + input] = 0;
    if (!isNaN(value) && value.trim() !== '') {
      const partes = value.split('.');
      if (partes[0].length > 8) {
        this.mostrarAdvertencia('El valor excede al maximo de 8 caracteres en la parte entera','Advertencia')
        return
      }
      if (((partes.length > 1 && partes[1].length > this.dec_indirectos)||(partes.length==1))&&(input!='item'&&input!='descripcion'&&input!="unidad")) {
        value =  this.determinarDecimales(value,this.dec_indirectos)
      }
    } else {
      const cantLimite = input == 'descripcion' ? 200 : 80;
      if (value.length > cantLimite) {
        this.mostrarAdvertencia('El valor excede al maximo de ' +cantLimite +' caracteres para texto','Advertencia')
        return;
      }
    }
    if (this.tablaSistema[i][input] == value ||value == undefined ||value == null) {
      this.modificandofila = false;
      return;
    }
    let modificado = 0;
    if (this.tablaSistema[i].id_fila !== null) {
      if (value == undefined || value == null) {
        this.modificandofila = false;
        return;
      }
      if ((this.tablaSistema[i][input] == null? '' : this.tablaSistema[i][input]) !== value) {
        const spliteado = value.split('.');
        if (spliteado.length == 2 &&!isNaN(Number(spliteado[1])) &&!spliteado[0]) {
          value = '0.' + spliteado[1];
        }
        if(input!=='item'&&input!=='descripcion'&&input!=='unidad'&&!value.includes('%')&&this.isNumber(value.replaceAll(',','').replaceAll('.',''))){
          this.tablaSistema[i][input] =   this.determinarDecimales(this.QuitarComas(value),this.dec_indirectos)
          modificado = 1
        }else{
          this.tablaSistema[i][input] = value
          modificado = 1
        }
      }
    } else {
      if (this.tablaSistema[i].id_fila == null) {
        if (value !== '' && value !== undefined && value !== null) {
          const spliteado = value.split('.');
          if (spliteado.length == 2 &&!isNaN(Number(spliteado[1])) &&!spliteado[0]) {
            value = '0.' + spliteado[1];
          }
          let filaagrega = {
            id_proyecto: this.id_proyecto,
            indice:this.auxindice,
            cantidad:'',
            id_fila: this.auxidfila+1,
            incidencia: '',
            item: '',
            nivel: '',
            formula: '',
            orden: '',
            tiempo: '',
            tipofila: 4,
            unidad: '',
            descripcion:'',
            tarifa:'',
            mostrar:1,
            icomost:0
          };
          this.tablaSistema[i] = filaagrega
          if (input == 'descripcion') {
            this.tablaSistema[i].total = this.formsService.redondeo( 0, this.dec_indirectos);
          }
          if(input!=='item'&&input!=='descripcion'&&input!=='unidad'&&!value.includes('%')&&this.isNumber(value.replaceAll(',','').replaceAll('.',''))){
            this.tablaSistema[i][input] = this.determinarDecimales(this.QuitarComas(value),this.dec_indirectos)
            modificado = 1
          }else{
            this.tablaSistema[i][input] = value
            modificado = 1
          }
          this.auxidfila++
        }
      } else {
        if (value !== undefined && value !== null) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }
          if(input!=='item'&&input!=='descripcion'&&input!=='unidad'&&!value.includes('%')&&this.isNumber(value.replaceAll(',','').replaceAll('.',''))){
            this.tablaSistema[i][input] = this.determinarDecimales(this.QuitarComas(value),this.dec_indirectos)
            modificado = 1
          }else{
            this.tablaSistema[i][input] = value
            modificado = 1
          }
        }
      }
    }
    if(this.habilitadoItem && input=='item'){
      this.CrearItem(i,value)
    }
    if (modificado) {
      await this.PrimerTitulo()
      await this.actuaTablaSistema();
      this.modificandofila = false;
    }
  }
  formulario1 = new UntypedFormGroup({
    agregarsubtitulos:new UntypedFormControl(false),
  })
  FormatoTotal(numero: any,){
    if (typeof numero !== 'string') {
        return numero;
    }
    let numeroFloat = parseFloat(numero);
    if (isNaN(numeroFloat)) {
        return numero;
    }
    let [parteEntera, parteDecimal] = numero.split('.')
    parteEntera  = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    let ultimaComillaIndex = parteEntera.lastIndexOf("'");
    if (ultimaComillaIndex !== -1) {
        let nuevaExpresion = parteEntera.substring(0, ultimaComillaIndex) + "," + parteEntera.substring(ultimaComillaIndex + 1);
        return `${nuevaExpresion}.${parteDecimal}`
    }else {
        let auxiliar= parteDecimal===undefined? numero:`${parteEntera}.${parteDecimal}`
        return auxiliar
    }
  }
  ChangeOption(){
    if(this.formulario1.get('agregarsubtitulos').value){
      this.arraytotales= this.tablaSistema.filter((item)=>{
        if (item.tipofila == 2||item.tipofila == 3||item.tipofila == 1) {  
          return true;
      }})
    }else{
      this.arraytotales= this.tablaSistema.filter((item)=>{
        if (item.tipofila == 2||item.tipofila == 1) {
          return true;
      }})
    }
  }
  CrearItem(index,value){
    let aux2
    let auxiliar
    let incremento =value
    let nuevo
    let extra=''
    let extraceros=''
    let prueba=value.replaceAll('.','')
    if(value.includes('.')){
      if(this.isNumber(prueba)){
        extraceros = prueba.match(/^0+/)
        const ultimaPosicion = value.lastIndexOf('.');
        extra = value.substring(0, ultimaPosicion + 1); 
        incremento = value.substring(ultimaPosicion + 1);
        nuevo="1"
      }else{
        const ultimaPosicion = value.lastIndexOf('.');
        extra = value.substring(0, ultimaPosicion + 1); 
        incremento = value.substring(ultimaPosicion + 1);
        nuevo =(/[A-Z]/.test(value) ? 'A' : 'a')
      }
    }else{
       nuevo = this.isNumber(prueba) ? "1" : (/[A-Z]/.test(value) ? 'A' : 'a');
    }
    let aux=this.tablaSistema[index].tipofila
    let auxiliar1=nuevo
    let auxiliar2=nuevo
    let auxiliar3=nuevo
    for(let k=index+1;k<this.tablaSistema.length;k++){
      if(this.tablaSistema[k].id_fila!==''&&this.tablaSistema[k].id_fila!==null&&this.tablaSistema[k].editarCopiar&&this.tablaSistema[k].tipofila<5){
        if(aux==parseInt(this.tablaSistema[k].tipofila)){
          auxiliar=this.incrementarValor(incremento);
          this.tablaSistema[k].item=extra+(extraceros ?? '') +auxiliar
          if(extraceros?.length+1>auxiliar.length&&this.isNumber(auxiliar)){
            incremento=extraceros+auxiliar
          }else{
            incremento=auxiliar
          }
          auxiliar1=nuevo
          auxiliar2=nuevo
          auxiliar3=nuevo
          aux2=4
        }else if(aux==parseInt(this.tablaSistema[k].tipofila)-1){
          if(aux2==2||aux2==3||aux2==1){
            auxiliar1=this.incrementarValor(auxiliar1)
          }
          this.tablaSistema[k].item=extra+ incremento+'.'+(extraceros ?? '') +auxiliar1
          auxiliar2=nuevo
          auxiliar3=nuevo
          aux2=3
        }else if(aux==parseInt(this.tablaSistema[k].tipofila)-2){
          if(aux2==1||aux2==2){
            auxiliar2=this.incrementarValor(auxiliar2)
          }
          this.tablaSistema[k].item=extra+ incremento+'.'+(extraceros ?? '') +auxiliar1+'.'+(extraceros ?? '') +auxiliar2
          auxiliar3=nuevo
          aux2=2
        }
        else if(aux==parseInt(this.tablaSistema[k].tipofila)-3){
          this.tablaSistema[k].item=extra+ incremento+'.'+(extraceros ?? '') +auxiliar1+'.'+(extraceros ?? '') +auxiliar2+'.'+(extraceros ?? '') +auxiliar3
          auxiliar3=this.incrementarValor(auxiliar3)
          aux2=1
        }
      }
    }
  }
  incrementarValor(valor: string): string {
      if(this.isNumber(valor)){
        return (parseInt(valor) + 1).toString();
      }
      if(this.isLetter(valor)){
        return this.incrementarLetra(valor);
      }
  }
  isNumber(value: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(value);
  }
  isLetter(value: string): boolean {
    return /^[A-Za-z]+$/.test(value); 
  }
  incrementarLetra(letra: string): string {
    let result = '';
    let auxi=''
    let carry = true;
    for (let i = letra.length - 1; i >= 0; i--) {
      let currentChar = letra[i];
      if (carry) {
        if (currentChar === 'Z') {
          result = 'A' + result;
          auxi='A' 
        }else if(currentChar === 'z') {
          result = 'a' + result;
          auxi='a' 
        } else {
          result = String.fromCharCode(currentChar.charCodeAt(0) + 1) + result; 
          carry = false; 
        }
      } else {
        result = currentChar + result; 
      }
    }
    if (carry) {
      result = auxi + result;
    }
    return result;
  }
  async mostrarColores(row) {
    this.metradoSeleccionado=row
    if (!this.seleccionCelda) {
      if (
        this.metradoSeleccionado?.id_fila !== null &&
        this.metradoSeleccionado?.id_fila !== '' &&
        this.metradoSeleccionado?.tipofila==4
      ) {
        if (this.mostrarColrs) {
          this.mostrarColrs = false;
        } else {
          this.mostrarColrs = true;
        }
      } else {
        this.mostrarColrs = false;
      }
    }
  }
  async moverArribaTablaSistema(value, columna, i) {
    if (this.filaSel2 > 0) {
      value.target.blur();
      const index = i - 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      // this.stiloFormula();
      if (index == 1) {
        value.target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } else {
      return;
    }
  }
  sgteColumna(columna, derecha) {
    let sgte = null;
    switch (columna) {
      case 'item':
        sgte = !derecha ? 'item' : 'descripcion';
        return sgte;
      case 'descripcion':
        sgte = !derecha ? 'item' : 'unidad';
        return sgte;
      case 'unidad':
        sgte = !derecha ? 'descripcion' : 'incidencia';
        return sgte;
      case 'incidencia':
        sgte = !derecha ? 'unidad' : 'cantidad';
        return sgte;
      case 'cantidad':
        sgte = !derecha ? 'incidencia' : 'tiempo';
        return sgte;
      case 'tiempo':
        sgte = !derecha ? 'cantidad' : 'tarifa';
        return sgte;
      case 'tarifa':
        sgte = !derecha ? 'tiempo' : 'tarifa';
        return sgte;
      default:
        return sgte;
    }
  }
  async moverDerechaTablaSistema(event, columna, index) {
    if (columna == 'descripcion'||columna=='item') {
      const inputElement = event.target as HTMLInputElement;
      const valueLength = inputElement.value.length;

      if (inputElement.selectionStart === valueLength) {
        if (this.saltardescripcion) {
          event.target.blur();
          const element = this.sgteColumna(columna, true);
          this.tablaSistema[index]['editar' + element] = 1;
        } else {
          this.saltardescripcion = true;
        }
      } else {
        this.saltardescripcion = false;
      }
    } else if (columna !== 'tarifa') {
      this.saltardescripcion = false;
      event.target.blur();
      const element = this.sgteColumna(columna, true);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }
  async moverIzquierdaTablaSistema(event, columna, index) {
    if (columna == 'descripcion'||columna=='item') {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.selectionStart === 0) {
        if (this.saltardescripcion) {
          event.target.blur();
          const element = this.sgteColumna(columna, false);
          this.tablaSistema[index]['editar' + element] = 1;
        } else {
          this.saltardescripcion = true;
        }
      } else {
        this.saltardescripcion = false;
      }
    } else {
      event.target.blur();
      const element = this.sgteColumna(columna, false);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }
  async moverAbajoTablaSistema(value, columna, i) {
    if (this.filaSel2 < this.tablaSistema.length - 1) {
      value.target.blur();
      const index = i + 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      // this.stiloFormula();
    }else if (this.filaSel2 == this.tablaSistema.length - 1) {
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        indice:this.auxindice,
        cantidad: '',
        id_fila: null,
        incidencia: '',
        item: '',
        nivel: '',
        formula: '',
        orden: '',
        tiempo: '',
        tipofila: '',
        total: '',
        unidad: '',
        descripcion:'',
        tarifa:'',
        mostrar:1,
      };
      this.tablaSistema.push(filaagrega);
      value.target.blur();
      const index = i + 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      // this.stiloFormula();
    }
    else {
      return;
    }
  }
  handleKeyDown(event: KeyboardEvent, index: number, columna: string) {
    if (event.key === 'ArrowUp') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverArribaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverAbajoTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowRight') {
      this.moverDerechaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowLeft') {
      this.moverIzquierdaTablaSistema(event, columna, index);
    }
  }
  async agregarTituloMetrado(multiple = false) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    this.mostrarColrs = false
    if (this.metradoSeleccionado) {
      let indice = null;
      if (this.metradoSeleccionado.id_fila !== null) {
        indice = filaSel2 + 1;
      } else {
        indice = filaSel2;
      }
      this.auxidfila++
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        indice:this.auxindice,
        cantidad: '',
        id_fila: this.auxidfila,
        incidencia: '',
        item: '',
        nivel: '',
        formula: '',
        orden: '',
        tiempo: '',
        tipofila: 2,
        total: '',
        unidad: '',
        descripcion:'',
        tarifa:'',
        mostrar:1,
        icomost:0
      };
      this.tablaSistema.splice(indice, 0, filaagrega);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    if (!multiple) {
      // this.stiloFormula();
    }
  }
  async agregarMetrado(multiple = false) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    this.mostrarColrs = false
    if (this.metradoSeleccionado) {
      let indice = null;
      if (this.metradoSeleccionado.id_fila !== null) {
        indice = filaSel2 + 1;
      } else {
        indice = filaSel2;
      }
      this.auxidfila++
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        indice: this.auxindice,
        cantidad: '',
        id_fila: this.auxidfila,
        incidencia: '',
        item: '',
        nivel: '',
        formula: '',
        orden: '',
        tiempo: '',
        tipofila: 3,
        total: '',
        unidad: '',
        descripcion:'',
        tarifa:'',
        mostrar:1,
        icomost:0
      };
      this.tablaSistema.splice(indice, 0, filaagrega);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    if (!multiple) {
      // this.stiloFormula();
    }
  }
  async agregarSubmetrado(multiple = false, idx = null) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    this.mostrarColrs = false
    if (this.metradoSeleccionado) {
      let index = null;
      if (idx == null) {
        index =
          this.metradoSeleccionado?.id_fila !== null
            ? filaSel2 + 1
            : filaSel2;
      } else {
        index = idx;
      }
      this.auxidfila++
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        indice:this.auxindice,
        cantidad: '',
        id_fila: this.auxidfila,
        incidencia: '',
        item: '',
        nivel: '',
        formula: '',
        orden: '',
        tiempo: '',
        tipofila: 4,
        total: '',
        unidad: '',
        descripcion:'',
        tarifa:'',
        mostrar:1,
        icomost:0
      };
      this.tablaSistema.splice(index, 0, filaagrega);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
      if (!multiple) {
      
        //   await this.calculoMontosSistema();
        //   await this.actualizarDataPrincipal();
        // this.stiloFormula();
        //   this.guardarTablaTemporal('agregarMEtrado');
      }
      // this.stiloFormula();
    } else {
      this.mostrarError('Ninguna fila seleccionada','',2000)
      return;
    }
  }
  async agregarMultipleTituloMetrado(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      await this.agregarTituloMetrado(true);
    }
    if (cantidad > 0) {
      this.popover4.close();
      // this.stiloFormula();
    }
  }
  async agregarMultipleMetrado(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      await this.agregarMetrado(true);
    }
    if (cantidad > 0) {
      this.popover.close();
      // this.stiloFormula();
    }
  }
  async agregarMultipleSubmetrado(cantidad) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.popover2.isOpen()) {
      this.popover2.close();
    }
    if (this.metradoSeleccionado) {
      if (this.metradoSeleccionado.tipofila == 1) {
        this.mostrarError('No se puede agregar debajo de un título', 'Error',3000)
        return;
      }
      const inicio =
        this.metradoSeleccionado.id_fila !== null ? filaSel2 + 1 : filaSel2;
      for (let i = 0; i < cantidad; i++) {
        const a = inicio + i;
        await this.agregarSubmetrado(true, a);
      }
      // await this.calculoMontosSistema();
      // await this.actualizarDataPrincipal();
      // this.stiloFormula();
      // this.guardarTablaTemporal('agregarMultipleSubmetrado');
    } else {
      this.mostrarError('Ninguna fila Seleccionada', '',2000)
      return;
    }
  }
  async EncontrarTituloAfter(){
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    for(let k=filaSel2+1;k<this.tablaSistema.length-1;k++){
      if(this.tablaSistema[k].tipofila==1){
        continue;
      }else if(this.tablaSistema[k].tipofila==2){
        return true
      }else if(this.tablaSistema[k].tipofila>2){
        return false
      }
    }
  }
  async convertirFilaATitulo() {
    let cambio = 0;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado?.id_fila !== null) {
         const nue= await this.EncontrarTituloAfter()
         if (nue){
          this.tablaSistema[filaSel2].tipofila = 1; 
          cambio = 1;
         }else{
          this.tablaSistema[filaSel2].tipofila = 1; 
          this.tablaSistema[filaSel2+1].tipofila = 2; 
          cambio = 1;
         }
      } else {
          const texto =
            filaSel2 == null
              ? 'Ningun elemento Seleccionado'
              : 'No se puede convertir a titulo';
          this.mostrarError(texto, 'Error',2000)
          return;
      }
      if (cambio) {
        this.actuaTablaSistema()
      }
  }
  async convertirFilaATitulo2() {
    let cambio = 0;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado?.id_fila !== null) {
          this.tablaSistema[filaSel2].tipofila = 2; 
          cambio = 1;
      } else {
          const texto =
            filaSel2 == null
              ? 'Ningun elemento Seleccionado'
              : 'No se puede convertir a titulo';
          this.mostrarError(texto, 'Error',2000)
          return;
      }
      if (cambio) {
        this.actuaTablaSistema()
      }
  }
  async convertirFilaASubtitulo(){
    let cambio = 0;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado?.id_fila !== null) {
          if(this.metradoSeleccionado.tipofila<3){
            const cons=await this.EncontrarTitulo()
            if(cons){
              this.tablaSistema[filaSel2].tipofila = 3; 
              cambio = 1;
            }else{
              this.mostrarError('No existe un Titulo superior', 'Error',2000) 
            }
          }else{
            this.tablaSistema[filaSel2].tipofila = 3; 
            cambio = 1;
          }
      } else {
          const texto =
            filaSel2 == null
              ? 'Ningun elemento Seleccionado'
              : 'No se puede convertir a titulo';
          this.mostrarError(texto, 'Error',2000)
          return;
      }
      if (cambio) {
        this.actuaTablaSistema()
      }
  }

  async convertirFilaATexto() {
    let cambio = 0;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado?.id_fila !== null) {
        if(this.metradoSeleccionado.tipofila<3){
          const cons=await this.EncontrarTitulo()
          if(cons){
            this.tablaSistema[filaSel2].tipofila = 5; 
            cambio = 1;
          }else{
            this.mostrarError('No existe un Titulo superior', 'Error',2000) 
          }
        }else{
          this.tablaSistema[filaSel2].tipofila = 5; 
          cambio = 1;
        }
      } else {
        this.mostrarInfo('Ningun Fila seleccionada', '',4000)
        return;
      }
      if (cambio) {
        this.actuaTablaSistema()
      }   
  }
  async agregarFilaSel(arriba = false) {
    let desplazar = arriba ? 0 : 1;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado) {
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1,
          icomost:0
        };
        this.tablaSistema.splice(filaSel2 + desplazar, 0, filaagrega);
        this.filaSel2 = filaSel2 + (arriba ? 1 : 0);
        this.metradoSeleccionado = this.tablaSistema[filaSel2];
      } else {
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1,
          icomost:0
        };
        this.tablaSistema.push(filaagrega);
      }
  }
  cantFil: any = 0;
  async agregarFilas(arriba = false) {
    const cantidad = this.cantFil
    for (let i = 0; i < cantidad; i++) {
      await this.agregarFilaSel(arriba)
    }
    this.popover3.close()
  }
  @HostListener('document:keydown.control.arrowup', ['$event'])
  async moverArriba() {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado?.id_fila == null) {
        this.mostrarError('No se puede mover', 'Error',2000);
        return;
      }  else if (this.metradoSeleccionado.tipofila===1 ) {//TITULO
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(filaSel2 - 1,1);
        if (!anteriorValido.antExistente) {
          this.mostrarError('No se puede mover', 'Error',2000);
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if ((row.tipofila>1) ||!row.tipofila) {
              array.push(row);
            } else if (row.tipofila == 1) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaSistema[this.filaSel2])
          );
          array2.push(obj);
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i);
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.tipofila || row.tipofila> 1) {
                array2.push(row);
              } else {
                if (row.id_fila !== null && row.tipofila==1) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel2 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
        }
      } else if (this.metradoSeleccionado.tipofila===2) {//TITULO METRADO
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(filaSel2 - 1,2);
        if (!anteriorValido.antExistente) {
          this.mostrarError('No se puede mover', 'Error',2000);
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if ((row.tipofila>2) ||!row.tipofila) {
              array.push(row);
            } else if (row.tipofila == 2) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(JSON.stringify(this.tablaSistema[this.filaSel2]))
          array2.push(obj)
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i)
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]))
              if (!row.tipofila ||row.tipofila>2) {
                array2.push(row)
              } else {
                if (row.id_fila !== null && row.tipofila==2) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel2 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
        }
      }else if (this.metradoSeleccionado.tipofila===3) {//METRADO
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(filaSel2 - 1,3);
        if (!anteriorValido || anteriorValido?.antExistente?.tipofila!==3) {
          this.mostrarError('No se puede mover', 'Error',2000);
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = this.tablaSistema[i];
            if (!row.tipofila ||row.tipofila>3) {
              array.push(row);
            } else if (row.tipofila==3 && row.id_fila !== null) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(JSON.stringify(this.tablaSistema[filaSel2]));
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i);
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.tipofila||(row.tipofila>3)) {
                array2.push(row);
              } else {
                if (row.id_fila !== null&&row.tipofila==3) {
                  break;
                } else {
                 break;
                }
              }
            } else {
              break;
            }
          }
          array2.unshift(obj);
          this.filaSel2 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2]
          // this.stiloFormula();
        }
      }else if (this.metradoSeleccionado.tipofila===4) {//SUBMETRADO
        const anterior = await this.anteValido(filaSel2 - 1,4);
        if (!anterior || anterior?.antExistente?.tipofila!==4) {
          this.mostrarError('No se puede mover', 'Error',2000);
          return;
        } else {
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
          this.tablaSistema[anterior.index] = ele;
          this.tablaSistema[inx] = anterior.antExistente;
          this.filaSel2 = anterior.index;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
        }
      }
  }
  async anteValido(indice,tipofila) {
    let antExistente = null;
    let index = null;
    if(tipofila==1){
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }
      }
    }else if(tipofila==2){
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && row.tipofila ==1){
          break;
        }
      }
    }else if(tipofila==3){
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && (row.tipofila ==1||row.tipofila==2)){
          break;
        }
      }
    }else if(tipofila==4){
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && (row.tipofila ==1||row.tipofila==2||row.tipofila==3)){
          break;
        }
      }
    }
    return { antExistente: antExistente, index: index };
  }
  async sgteexistente(ind) {
    let existe = false;
    for (let i = ind; i < this.tablaSistema.length; i++) {
      const element = this.tablaSistema[i];
      if (element.id_fila !== null) {
        existe = true;
        break;
      }
    }
    return existe;
  }
  async sgteValido(indice) {
    let sgteExistente = null;
    let index = null;
    for (let i = indice; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      if (row.idfila!== null && row.tipofila) {
        sgteExistente = row;
        index = i;
        break;
      }
    }
    return { sgteExistente: sgteExistente, index: index };
  }
  async sgtValido(indice,tipofila) {
    let antExistente = null;
    let index = null;
    if(tipofila==1){
      for (let i = indice; i <this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }
      }
    }else if(tipofila==2){
      for (let i = indice; i <this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && row.tipofila ==1){
          break;
        }
      }
    }else if(tipofila==3){
      for (let i = indice; i <this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && (row.tipofila ==1||row.tipofila==2)){
          break;
        }
      }
    }else if(tipofila==4){
      for (let i = indice; i <this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }else if(row.id_fila !== null && (row.tipofila ==1||row.tipofila==2||row.tipofila==3)){
          break;
        }
      }
    }
    return { antExistente: antExistente, index: index };
  }
  @HostListener('document:keydown.control.arrowdown', ['$event'])
  async moverAbajo() {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      if (this.metradoSeleccionado.id_fila == null) {
        this.mostrarError('No se puede mover', 'Error',2000);
        return;
      }else if(this.metradoSeleccionado.tipofila<5){
        const nuevo2=(await this.sgtValido(filaSel2+1,this.metradoSeleccionado.tipofila)).index
        if(nuevo2){
          const nuevo3= await this.BuscarSiguiente2(nuevo2+1,this.metradoSeleccionado.tipofila)
          if(nuevo3){
            let array1=[]
            let array2=[]
            array1.push(this.tablaSistema[filaSel2]) 
            for(let i = filaSel2 + 1; i <nuevo2; i++){
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]))
              array1.push(row)
            }
            for(let i = nuevo2; i <nuevo3; i++){
              if(this.tablaSistema[i].id_fila!==null&&this.tablaSistema[i].id_fila!==''){
                const row2 = JSON.parse(JSON.stringify(this.tablaSistema[i]))
                array2.push(row2)
              }
            }
            this.tablaSistema.splice(filaSel2, nuevo3-filaSel2); 
            this.tablaSistema.splice(filaSel2, 0, ...array2);
            this.tablaSistema.splice(filaSel2 + array2.length, 0, ...array1);
            this.CompletarTablaSistema()
            this.filaSel2 = filaSel2+array2.length
            this.metradoSeleccionado = this.tablaSistema[this.filaSel2]
          }else{
            this.mostrarError('No se puede mover', 'Error',2000);
            return;
          }
        }else{
          this.mostrarError('No se puede mover', 'Error',2000);
          return;
        }
      }
  }
  async desplazarArriba() {
    if (this.metradoSeleccionado?.id_fila !== null && this.filaSel2 > 0) {
      const dataMetrado = JSON.parse(
        JSON.stringify(this.metradoSeleccionado)
      );
      const indAnterior = this.filaSel2 - 1;
      if (this.tablaSistema[indAnterior]?.id_fila == null) {
        this.tablaSistema[indAnterior] = dataMetrado;
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1
        }
        this.tablaSistema[this.filaSel2] = filaagrega
        this.metradoSeleccionado = this.tablaSistema[indAnterior];
        this.filaSel2 = indAnterior;
      } else {
        this.mostrarError('No se puede desplazar elemento', 'Error',2000)
        return;
      }
    } else {
      this.mostrarError('No se puede desplazar elemento', 'Error',2000)
      return;
    }
  }
  async desplazarAbajo() {
    if (this.metradoSeleccionado?.id_fila !== null) {
      const dataMetrado = JSON.parse(
        JSON.stringify(this.metradoSeleccionado)
      );
      const indSgte = this.filaSel2 + 1;
      if ( this.tablaSistema[indSgte]?.id_fila == null &&indSgte < this.tablaSistema.length) {
        this.tablaSistema[indSgte] = dataMetrado;
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1
        };
        this.tablaSistema[this.filaSel2] = filaagrega
        this.metradoSeleccionado = this.tablaSistema[indSgte];
        this.filaSel2 = indSgte;
        // await this.actualizarTablaCompleta();
      } else {
        this.mostrarError('No se puede desplazar elemento', 'Error',2000)
        return;
      }
    } else {
      this.mostrarError('No se puede desplazar elemento', 'Error',2000)
      return;
    }

  }
  @HostListener('document:keydown.control.arrowleft', ['$event'])
  async subirNivelfila(e?: KeyboardEvent) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2))
        if (this.metradoSeleccionado.id_fila !== null) {
          if (this.metradoSeleccionado.tipofila!==1) {
              if(this.metradoSeleccionado.tipofila==2){
                const nue =await this.EncontrarTituloAfter()
                if(nue){
                  this.tablaSistema[filaSel2].tipofila=1
                }else{
                  this.tablaSistema[filaSel2].tipofila=1
                  this.tablaSistema[filaSel2+1].tipofila=2
                }
              }else{
                let nuevo =parseInt(this.metradoSeleccionado.tipofila)-1
                this.tablaSistema[filaSel2].tipofila=nuevo
              }
          } else {
            this.mostrarError('Fila seleccionada no valida', 'Error',2000)
          }
        }
        this.actuaTablaSistema()
        this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  }
  @HostListener('document:keydown.control.arrowright', ['$event'])
  async bajarNivel(e?: KeyboardEvent) {
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila!==5) {
        const compr= await this.EncontrarTitulo()
        if(compr||(this.tablaSistema[filaSel2-1]?.tipofila==1&&this.tablaSistema[filaSel2].tipofila==1)){
          let nuevo =parseInt(this.metradoSeleccionado.tipofila)+1
          this.tablaSistema[filaSel2].tipofila=nuevo
        }else{
          this.mostrarError('No existe un Titulo Superior', 'Error',2000)
        }
      } else {
        this.mostrarError('Fila seleccionada no valida', 'Error',2000)
      }
    }
    this.actuaTablaSistema()
    this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  }
  async EncontrarTitulo(){
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if(filaSel2==0&&this.metradoSeleccionado.tipofila<2){
      return true
    }
    for(let k=filaSel2-1;k>=0;k--){
      if(this.tablaSistema[k].tipofila==2){
        return true
      }else if(this.tablaSistema[k].tipofila==1){
        return false
      }
    }
  }
  async eliminarRow() {
    let arrayEliminar = [];
    if (this.habilitadoCopiar) {
      this.tablaSistema.map((ele, index) => {
        if ((ele.editarEliminar || ele.editarCopiar)&&ele.id_fila!==null&&ele.id_fila!=='') {
          arrayEliminar.push(index);
          ele.editarEliminar = false;
          ele.editarCopiar = false;
        }
      });
      this.habilitadoCopiar = false;
      this.todosCheck = false;
    } else {
      arrayEliminar.push(this.filaSel2);
    }
    if (!arrayEliminar.length) {
      this.mostrarError('Ninguna fila seleccionada', '',2000)
      return;
    }
    arrayEliminar.sort((a, b) => b - a);
    for (let indice of arrayEliminar) {
      this.tablaSistema.splice(indice, 1);
    }
    await this.ComprobarFilas()
    // let hayTipoFila2 = false;
    // let primerTipoFila3o4Index = -1;

    // for (let i = 0; i < this.tablaSistema.length-1; i++) {
    //   if (this.tablaSistema[i].tipofila === 2) {
    //     hayTipoFila2 = true;
    //   }
    //   if (this.tablaSistema[i].tipofila > 2 && primerTipoFila3o4Index === -1) {
    //     primerTipoFila3o4Index = i;
    //   }
    //   if ( this.tablaSistema[i].tipofila === 1 && i + 1 < this.tablaSistema.length && this.tablaSistema[i + 1].tipofila > 3) {
    //     this.tablaSistema[i + 1].tipofila = 2;
    //   }
    // }
    // if (!hayTipoFila2 && primerTipoFila3o4Index !== -1) {
    //   this.tablaSistema[primerTipoFila3o4Index].tipofila = 2;
    // }

    this.actuaTablaSistema()
    this.metradoSeleccionado = null;
    this.mostrarColrs = false;
    this.tempFormula = [];
    this.filaSel2 = null;
    this.CompletarTablaSistema()
  }
  PrimerTitulo(){
    let hayTipoFila2 = false;
    let primerTipoFila3o4Index = -1;
    for (let i = 0; i < this.tablaSistema.length; i++) {
      if (this.tablaSistema[i].tipofila == 2) {
        hayTipoFila2 = true;
        break;
      }
      if ((this.tablaSistema[i].tipofila >2) && primerTipoFila3o4Index === -1) {
        primerTipoFila3o4Index = i;
        break;
      }
    }
    if (!hayTipoFila2 && primerTipoFila3o4Index !== -1) {
      this.tablaSistema[primerTipoFila3o4Index].tipofila = 2;
    }
  }
  async ComprobarFilas(){
    await this.PrimerTitulo()
    for (let i = 0; i < this.tablaSistema.length; i++) {
      if (this.tablaSistema[i].tipofila == 1&&this.tablaSistema[i+1].tipofila>3) {
        this.tablaSistema[i + 1].tipofila = 2
      }
    }
  }

  async limpiarTabla() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminará todos los registros de la tabla hoja de metrado sistema'
    );
    if (sw.isConfirmed) {
      this.buscando = true;
      let indOrdenado = this.tablaSistema.filter((ele) => ele.id_fila !== null).map((ele) => ele.id_fila);
      indOrdenado.sort((a, b) => b - a);
      this.tablaSistema = [];
      for (let i = 0; i < this.cantidadFilasTabla - 1; i++) {
        let filaagrega = {
          id_proyecto: this.id_proyecto,
          indice:this.auxindice,
          cantidad: '',
          id_fila: null,
          incidencia: '',
          item: '',
          nivel: '',
          formula: '',
          orden: '',
          tiempo: '',
          tipofila: '',
          total: '',
          unidad: '',
          descripcion:'',
          tarifa:'',
          mostrar:1
        };
        this.tablaSistema.push(filaagrega);
      }
      this.filaSel2 = null;
      this.metradoSeleccionado = null;
      this.tempFormula = [];
      this.habilitadoCopiar = false;
      // this.actualizarTemp();
      this.buscando = false;
    }
    this.actuaTablaSistema()
  }
  async copiarFila() {
    this.arrayCopiadosMetrado = [];
    if (this.metradoSeleccionado?.id_fila !== null) {
      this.arrayCopiadosMetrado.push(
        JSON.parse(JSON.stringify(this.metradoSeleccionado))
      );
      this.mostrarColrs = false;
      this.tempFormula = [];
      this.mostrarInfo('', 'Copiado',2000)
      return;
    } else {
      this.mostrarError('Ninguna Fila Seleccionada', '',2000)
      return;
    }
  }
  habilitadoItem = false;
  async habilitarMultiple(value) {
    this.filaSel2 = null;
    this.metradoSeleccionado = null;
    this.mostrarColrs = false;
    this.tempFormula = [];
    this.todosCheck = false;
    if(value=='checkbox'){
      this.habilitadoCopiar = true;
    }else{
      this.habilitadoItem=true
    }
  }
  BuscarSiguiente(indice,tipofila){
    for(let i=indice;i<=this.tablaSistema.length;i++){
      const row = this.tablaSistema[i];
      if(tipofila==1){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==2){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila==1)||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==3){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2))||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==4){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2||row?.tipofila==3))||(i==this.tablaSistema.length-1)){
          return i
        }
      }
    }
  }
  BuscarSiguiente2(indice,tipofila){
    var aux =indice
    for(let i=indice;i<this.tablaSistema.length;i++){
      const row = this.tablaSistema[i];
      if(tipofila==1){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)){
          return i
        }else if(row?.id_fila!==''&&row?.id_fila!==null){
          aux = i
        }
      }else if(tipofila==2){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila==1)){
          return i
        }else if(row?.id_fila!==''&&row?.id_fila!==null){
          aux = i
        }
      }else if(tipofila==3){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2))){
          return i
        }else if(row?.id_fila!==''&&row?.id_fila!==null){
          aux = i
        }
      }else if(tipofila==4){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2||row?.tipofila==3))){
          return i
        }else if(row?.id_fila!==''&&row?.id_fila!==null){
          aux = i
        }
      }
    }
    if(aux==indice){
      return aux
    }else{
      return aux+1
    }
  }
  async cambioCheckboxTodos() {
    if (this.todosCheck) {
      this.tablaSistema.map((ele) => {
        if (ele.id_fila !== null) {
          ele.editarCopiar = true;
        }
      });
    } else {
      this.tablaSistema.map((ele) => {
        if (ele.id_fila !== null) {
          ele.editarCopiar = false;
        }
      });
    }
  }
  async copiarFilaMultiple() {
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = [];
      let i = 0;
      this.tablaSistema.map((ele, index) => {
        if (ele.editarCopiar && ele.id_fila !== null) {
          i++;
          ele.editarCopiar = false;
          this.arrayCopiadosMetrado.push(JSON.parse(JSON.stringify(ele)));
          this.tablaSistema[index].editarCopiar = false;
        }
        ele.editarCopiar = false;
      });
      if (!this.arrayCopiadosMetrado.length) {
        this.mostrarError('Ninguna fila seleccionada', '',2000)
      } else {
        this.habilitadoCopiar = false;
        this.todosCheck = false;
        this.filaSel2 = null;
        this.metradoSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.mostrarInfo('', 'Copiado',2000)
      }
  }
  async copiarFraccionTabla() {
    this.copiadoCeldas = true;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.filaSel2 = null;
  }
  async guardarSeleccionadosCeldas(limpiar = false) {
    let iniciox = null;
    let inicioy = null;
    let finx = null;
    let finy = null;
    let arrayCopiar = [];
    if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
      if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
        inicioy = this.finCeldaCopiado.columna;
        finy = this.inicioCeldaCopiado.columna;
      } else {
        finy = this.finCeldaCopiado.columna;
        inicioy = this.inicioCeldaCopiado.columna;
      }
      if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
        iniciox = this.finCeldaCopiado.fila;
        finx = this.inicioCeldaCopiado.fila;
      } else {
        finx = this.finCeldaCopiado.fila;
        iniciox = this.inicioCeldaCopiado.fila;
      }
      const array = ['item','descripcion','unidad','incidencia','cantidad','tiempo','tarifa'];
      let validos = [];
      if (inicioy == finy) {
        validos = [array[inicioy]];
      } else {
        validos = array.slice(inicioy, finy + 1);
      }
      for (let i = iniciox; i <= finx; i++) {
        let obj = [];
        const row = this.tablaSistema[i];
        for (const key of validos) {
          obj.push(row[key]);
          if (limpiar) {
            row[key] = '';
          }
        }
        arrayCopiar.push(obj);
      }
    } else if (
      this.copiadoCeldas &&
      this.inicioCeldaCopiado &&
      !this.finCeldaCopiado
    ) {
      const valor =
        this.tablaSistema[this.inicioCeldaCopiado.fila][
          this.inicioCeldaCopiado.colname
        ];
      const arr = [valor];
      arrayCopiar.push(arr);
    } else {
      this.mostrarError('Ninguna celda seleccionada', '',2000)
      return;
    }
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = arrayCopiar;
  }
  async limpiarCopiados() {
    if (this.formulaCopiada !== null) {
      this.formulaCopiada = null;
    }
    this.habilitadoCopiar = false;
    this.habilitadoItem=false;
    this.arrayCopiadosMetrado = [];
    this.CancelarCopiarFraccionTabla();
    this.tablaSistema = this.tablaSistema.map((ele) => {
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      return ele;
    });
    this.todosCheck = false;
  }
  async CancelarCopiarFraccionTabla() {
    this.copiadoCeldas = false;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.filaSel2 = null;
    this.todosCheck = false;
  }  
  evaluarPintadoCelda(fila, columna) {
    let pintar = false;
    let iniciox = null;
    let inicioy = null;
    let finx = null;
    let finy = null;
    if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
      if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
        inicioy = this.finCeldaCopiado.columna;
        finy = this.inicioCeldaCopiado.columna;
      } else {
        finy = this.finCeldaCopiado.columna;
        inicioy = this.inicioCeldaCopiado.columna;
      }
      if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
        iniciox = this.finCeldaCopiado.fila;
        finx = this.inicioCeldaCopiado.fila;
      } else {
        finx = this.finCeldaCopiado.fila;
        iniciox = this.inicioCeldaCopiado.fila;
      }
      if (iniciox <= fila &&fila <= finx &&inicioy <= columna &&columna <= finy) {
        pintar = true;
      }
    } else if (this.copiadoCeldas &&this.inicioCeldaCopiado &&!this.finCeldaCopiado) {
      if (fila == this.inicioCeldaCopiado.fila &&columna == this.inicioCeldaCopiado.columna) {
        pintar = true
      }
    }
    return pintar
  }
  @HostListener('document:keydown.control', ['$event'])
  async handleKey(event: KeyboardEvent) {
    const clipboardValido = !!navigator.clipboard;
    this.valorCopiado = null;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (filaSel2 !== null) {
      const metCopia = JSON.parse(JSON.stringify(this.tablaSistema[filaSel2]));
      const array = [
        'editaritem',
        'editardescripcion',
        'editarunidad',
        'editarincidencia',
        'editarcantidad',
        'editartiempo',
        'editartarifa',
      ];
      const array2 = ['item','descripcion','unidad','incidencia','cantidad','tiempo','tarifa']
      this.celdaFocus = null;
      if (filaSel2 !== null) {
        let i = 0;
        for (const element of array) {
          if (metCopia[element]) {
            this.celdaFocus = array2[i];
            break;
          }
          i++;
        }
      }
      if (!clipboardValido) {
        const input = document.getElementById('copiado');
        setTimeout(() => {
          if (input) {
            input.focus();
          }
        }, 0);
      }
    }
  }
 
  async sgteValido2(indice) {
    let sgteExistente = null;
    let index = null;
    for (let i = indice; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      if (row.id_fila !== null && row.tipofila !==null&&row.tipofila!=='') {
        sgteExistente = row;
        index = i;
        break;
      }
    }
    return { sgteExistente: sgteExistente, index: index };
  }
  @HostListener('document:paste', ['$event'])
  async handlePaste(event: ClipboardEvent) {
    const clipboardValido = !!navigator.clipboard;
    if (this.filaSel2 == null) {
      this.valorCopiado = null;
      this.mostrarError( 'Seleccione una fila de la tabla hoja de metrado para pegar','Error',4000)
      return;
    } 
    this.mostrar_carga_todo = true;
    if (!clipboardValido) {
      const string = 'copiado'
      const input = document.getElementById(string);
      setTimeout(async () => {
        input.blur();
        var c = (<HTMLInputElement>document.getElementById(string)).value;
        const paracopiar = JSON.parse(JSON.stringify(c));
        this.valorCopiado = null;
        await this.textoCopSplit(paracopiar, true);
        }, 10);
    } else {
      event.preventDefault();
      const text = await navigator.clipboard
        ?.readText()
        ?.then((copiedText) => {
          return copiedText;
        })
        .catch((e) => {
          return null;
        });
        this.textoCopSplit(text, true);
    }
  }
  async pegarCopiados() {
    if (this.filaSel2 == null) {
      this.mostrarError( 'Seleccione una fila o celda valida para pegar','',3000)
      return;
    } else {
      const array = ['item','descripcion','unidad','incidencia','cantidad','tiempo','tarifa',]
      if (this.celdasCopiadosMetrado.length) {
        const idx = array.indexOf(this.ultiCelda);
        const arrayValidos =
        idx == -1 ? array : array.slice(idx, array.length);
        let ind = JSON.parse(JSON.stringify(this.filaSel2));
        for (const iterator of this.celdasCopiadosMetrado) {
          this.auxidfila++
          if (ind >= this.tablaSistema.length) {
            let metrado = {
              id_proyecto: this.id_proyecto,
              indice:this.auxindice,
              cantidad: '',
              id_fila:this.auxidfila,
              incidencia: '',
              item: '',
              nivel: '',
              formula: '',
              orden: '',
              tiempo: '',
              tipofila: 4,
              total: '',
              unidad: '',
              descripcion:'',
              tarifa:'',
              mostrar:1,
              icomost:0
            };
            for (let i = 0; i < iterator.length; i++) {
              metrado[arrayValidos[i]] = iterator[i];
            }
            this.tablaSistema.push(metrado);
          } else {
            let metrado = this.tablaSistema[ind];
              metrado.id_fila = this.auxidfila;
              metrado.indice = this.auxindice;
              metrado.tipofila= metrado.tipofila!==''&&metrado.tipofila!==null?metrado.tipofila:4
              metrado.icomost=0
            for (let i = 0; i < iterator.length; i++) {
              metrado[arrayValidos[i]] = iterator[i];
            }
          }
          ind++;
        }
      } else if (this.arrayCopiadosMetrado.length) {
        let ind = JSON.parse(JSON.stringify(this.filaSel2));
        let celdasEspecificas = [];
        if (this.ultiCelda) {
          const idx = array.indexOf(this.ultiCelda);
          celdasEspecificas =
            idx == -1 ? array : array.slice(idx, array.length);
        }
        for (let iterator of this.arrayCopiadosMetrado) {
          if (ind > this.tablaSistema.length) {
            if (!celdasEspecificas.length) {
              this.tablaSistema.push(iterator);
            } else {
              this.auxidfila++
              let filaagrega = {
                id_proyecto: this.id_proyecto,
                indice:this.auxindice,
                cantidad: '',
                id_fila: this.auxidfila,
                incidencia: '',
                item: '',
                nivel: '',
                formula: '',
                orden: '',
                tiempo: '',
                tipofila:2,
                total: '',
                unidad: '',
                descripcion:'',
                tarifa:'',
                mostrar:1,
                icomost:0
              };
              let k = 0;
              for (const key of celdasEspecificas) {
                filaagrega[key] = iterator[array[k]];
                k++;
              }
              this.tablaSistema.push(filaagrega);
            }
          } else {
            if (!celdasEspecificas.length) {
              this.auxidfila++
              iterator.id_fila =this.auxidfila ;
              this.tablaSistema[ind] = iterator;
            } else {
              let metrado = this.tablaSistema[ind];
              let k = 0;
              if (!metrado) {
                this.auxidfila++
                let metrado = {
                  id_proyecto: this.id_proyecto,
                  indice:this.auxindice,
                  id_fila: this.auxidfila,
                  formula: '',
                  tipofila: 2,
                  total: '',
                  icomost:0,
                  mostrar:1,
                };
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                this.tablaSistema.push(metrado);
              } else {
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                metrado.id_fila = this.auxidfila;
                metrado.tipofila = 2;
                metrado.mostrar=1,
                metrado.icomost=0,
                this.tablaSistema[ind] = metrado;
              }
            }
          }
          ind++;
        }
        this.ultiCelda = null;
      } else {
        this.mostrarInfo('Ningun dato  copiada', '',2000)
        return;
      }
    }
    this.ultiCelda = null;
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = [];
    await this.actuaTablaSistema()
  }
  async cortarSeleccionados() {
    let arrayCortados = [];
      let indicesEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaSistema = this.tablaSistema.map((ele) => {
          if (ele.editarCopiar) {
            indicesEliminar.push(ele.ind);
            ele.id_fila = null;
            ele.editarCopiar = false;
            arrayCortados.push(JSON.parse(JSON.stringify(ele)));
            let filaagrega = {
              id_proyecto: this.id_proyecto,
              indice:this.auxindice,
              cantidad: '',
              id_fila: null,
              incidencia: '',
              item: '',
              nivel: '',
              formula: '',
              orden: '',
              tiempo: '',
              tipofila: null,
              total: '',
              unidad: '',
              descripcion:'',
              tarifa:'',
              mostrar:1
            };
            ele = filaagrega;
          }
          return ele;
        });
      } else {
        if (this.copiadoCeldas) {
          await this.guardarSeleccionadosCeldas(true);
          this.copiadoCeldas = false;
        } else {
          indicesEliminar.push(this.metradoSeleccionado.ind);
          let filaagrega = {
            id_proyecto: this.id_proyecto,
            indice:this.auxindice,
            cantidad: '',
            id_fila: null,
            incidencia: '',
            item: '',
            nivel: '',
            formula: '',
            orden: '',
            tiempo: '',
            tipofila: null,
            total: '',
            unidad: '',
            descripcion:'',
            tarifa:'',
            mostrar:1
          };
          this.metradoSeleccionado.editarCopiar = false;
          arrayCortados.push(
            JSON.parse(JSON.stringify(this.metradoSeleccionado))
          );
          this.metradoSeleccionado = null;
          this.tablaSistema[this.filaSel2] = filaagrega;
        }
        this.habilitadoCopiar = false;
      }
      this.arrayCopiadosMetrado = arrayCortados;
      indicesEliminar.sort((a, b) => b - a);
      this.ultiCelda = null;
      this.habilitadoCopiar = false;
  }  
  async EliminarSelecionado(){
    if (this.copiadoCeldas) {
      await this.guardarSeleccionadosCeldas(true);
      this.limpiarCopiados()
      this.arrayCopiadosMetrado=[]
      this.celdasCopiadosMetrado=[]
    }
    this.actuaTablaSistema()
  }
  toggleOnSistema(index) {
    this.tablaSistema[index].icomost = 0;
    const total= this.tablaSistema.length
    if(this.tablaSistema[index].tipofila<4 && total-1>index ){
      const resp =this.BuscarSiguiente(index+1,this.tablaSistema[index].tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = index + 1; i < nuevo  ; i++) {
        const row = this.tablaSistema[i];
          row.mostrar = 1
          if(row.icomost==1){
            row.icomost=0
          }
      }
    }
  }
  async cambioCheckboxCopiar(valor, index) {
    if (!valor) {
      this.todosCheck = false;
    }
      const row = this.tablaSistema[index];
      this.tablaSistema[index].editarCopiar = valor;
      if (row.tipofila<5) {
        const resp =this.BuscarSiguiente(index+1,row.tipofila)
        let nuevo = resp==this.tablaSistema.length-1? resp+1:resp
        for (let i = index + 1; i < nuevo  ; i++) {
          this.tablaSistema[i].editarCopiar = true
        }
      }
  }
  async toggleOffSistema(index) {
    const total= this.tablaSistema.length
    this.tablaSistema[index].icomost = 1;
    if(this.tablaSistema[index].tipofila<4 && total-1>index){
      const resp =this.BuscarSiguiente(index+1,this.tablaSistema[index].tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = index + 1; i < nuevo  ; i++) {
        const row = this.tablaSistema[i];
          if(row.id_fila!=null&&row.id_fila!=''){
            row.mostrar = 0
          }
      }
    }
  }
  teclaFormula(value) {
    if (!this.habEditFormula) {
      this.tempFormula = [];
      return;
    }
    this.tempFormula = this.convertirAArray(value.toUpperCase());
  }
  async evaluarFormula(texto) {
    this.habEditFormula = false;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2))
    setTimeout(async () => {
      if (this.metradoSeleccionado !== null&&texto!='E*F*G*H') {
        texto = texto.toString().toUpperCase().replace(/\s+/g, '');
        const spliteado = this.convertirAArray2(texto, true);
        let arrayCorrecto = [];
        const respuesta = await this.previaPruebaFormula(spliteado);
        if (!respuesta.valido) {
          this.mostrarError('Formula no Valida', 'Error',3000)
          // this.stiloFormula();
          return;
        } else {
          arrayCorrecto = respuesta.arrayCorrecto
        }
        const formula = arrayCorrecto.join('');
        if (formula !== this.tablaSistema[filaSel2].formula) {
          this.tablaSistema[filaSel2].formula = formula;
          // this.stiloFormula();
        }
        this.actuaTablaSistema()
        // this.stiloFormula();
      } else {
        // this.stiloFormula();
        return;
      }
    }, 50);
  }
  // stiloFormula() {
  //   let result = '';
  //   if (
  //     this.metradoSeleccionado &&
  //     this.metradoSeleccionado?.id_fila !== null &&
  //     this.metradoSeleccionado?.id_fila !==''&&
  //     this.metradoSeleccionado?.tipofila==4
  //   ) {
  //     let letras = {
  //       E: '#60407b',
  //       F: '#3b9061',
  //       G: '#b352a4',
  //       H: '#459ab8',
  //     };
  //     let palabra =
  //       this.metradoSeleccionado.formula == null||this.metradoSeleccionado.formula==''
  //         ? 'E*F*G*H'
  //         : this.metradoSeleccionado.formula;
  //     for (let i = 0; i < palabra.length; i++) {
  //       // Letra actual
  //       let letra = palabra[i];
  //       let indice = letra.toUpperCase();
  //       if (letras.hasOwnProperty(indice)) {
  //         const color = letras[indice];
  //         result += `<span style="color:${color}">${letra}</span>`;
  //       } else {
  //         result += letra;
  //       }
  //     }
  //     // var span = document.getElementById('spanformula');
  //     // if (span) {
  //     //   span.innerHTML = result;
  //     // }
  //   } else {
  //     // var span = document.getElementById('spanformula');
  //     // if (span) {
  //     //   span.innerHTML = result;
  //     // }
  //   }
  // }
  existeEdicion(fila) {
    let valido = false;
    if (!this.habEditFormula) {
      this.tempFormula = [];
    }
    this.tempFormula.map((ele) => {
      if (ele.toString().includes(fila)) {
        valido = true;
      }
    });
    return valido;
  }
  pintarCelda(letra) {
    let valido = false;
    if (this.metradoSeleccionado.id_fila !== null&&this.metradoSeleccionado.id_fila!=='') {
      const formula =
        this.metradoSeleccionado.formula == null||this.metradoSeleccionado.formula==''
          ? 'E*F*G*H'
          : this.metradoSeleccionado.formula;
      const spliteado = formula.split(/[/+*-]+/);
      spliteado.map((ele) => {
        if (ele.includes(letra)) {
          valido = true;
        }
      });
    }
    return valido;
  }
  verificarHabForm() {
    this.tempFormula = [];
    this.mostrarColrs = false;
    if (this.solover) {
      return;
    }
    if (this.filaSel2 !== null) {
      if (this.tablaSistema[this.filaSel2].tipofila!=4) {
        this.mostrarError('Formula no editable', null,3000)
        return;
      }
      this.habEditFormula = true;
      // this.mostrarColrs = true
      this.teclaFormula(
        this.metradoSeleccionado.formula == null||this.metradoSeleccionado.formula==''
          ? 'E*F*G*H'
          : this.metradoSeleccionado.formula
      );
    } else {
      this.mostrarError('Ninguna fila seleccionada de la tabla', null,3000)
      this.mostrarColrs = false;
      this.habEditFormula = false;
      return;
    }
  }
  async reiniciarFormula() {
    if (this.metradoSeleccionado &&this.metradoSeleccionado?.id_fila !== null&&this.metradoSeleccionado?.id_fila !== '') {
      const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      let arrayIndices = []
      if (this.metradoSeleccionado.tipofila==3) {
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = this.tablaSistema[i];
          if (row.id_fila !== null&&row.id_fila !== '') {
            if (row.tipofila==1||row.tipofila==2||row.tipofila==3) {
              break;
            } else if (row.tipofila==4) {
              arrayIndices.push(i);
            }
          }
        }
        if (arrayIndices.length) {
          const sw = await SwalService.confirm(
            'Estas seguro?',
            'Se reiniciara la formula de todas las filas relacionadas al metrado'
          );
          if (sw.isConfirmed) {
            arrayIndices.unshift(filaSel2);
          } else {
            return;
          }
        } else if (this.metradoSeleccionado.tipofila==4) {
          arrayIndices.push(filaSel2);
        }
      } else if (this.metradoSeleccionado.tipofila==1||this.metradoSeleccionado.tipofila==2) {
        return;
      } else if (
        this.metradoSeleccionado.tipofila==4
      ) {
        arrayIndices.push(filaSel2);
      }
      if (arrayIndices.length) {
        for (const iterator of arrayIndices) {
          this.tablaSistema[iterator].formula = '';
        }
        await this.actuaTablaSistema();
      }
    }
  }
  calcularformula2(texto) {
    try {
      const valor = math.evaluate(texto);
      const parteEntera = Math.floor(valor).toString()
      if (parteEntera.length > 8) {
        return null;
      }
      return valor;
      // return math.evaluate(texto);
    } catch {
      return null;
    }
  }
  async previaPruebaFormula(texto) {
    const columnas = ['E', 'F', 'G', 'H'];
    let nuevoString = [];
    let formula = [];
    let valido = true;
    for (const iterator of texto) {
      if (iterator.length > 1) {
        const numero = parseFloat(iterator);
        if (isNaN(numero)) {
          valido = false;
          break;
        } else {
          const texto = iterator.slice(numero.toString().length);
          if (!texto && !isNaN(numero)) {
            nuevoString.push(numero);
            formula.push(iterator);
          } else {
            if (columnas.includes(texto)) {
              nuevoString.push(numero);
              nuevoString.push('*');
              nuevoString.push(1);
              formula.push(iterator);
            } else {
              valido = false;
              break;
            }
          }
        }
      } else {
        if (columnas.includes(iterator)) {
          nuevoString.push(1);
          formula.push(iterator);
        } else {
          nuevoString.push(iterator);
          formula.push(iterator);
        }
      }
    }
    valido = await this.calcularformula(nuevoString.join(''));
    return { valido: valido, arrayCorrecto: formula };
  }
  convertirAArray2(expresion: string, tipo = false): string[] {
    let array = [];
    const partes = expresion.split(/([\+\-\*/\(\)])/)
    let resultado = partes.filter((elemento) => elemento !== '')
    if (tipo) {
      array = resultado.map((ele) => {
        return ele
      });
    } else {
      for (const ele of resultado) {
        const valorNumerico = parseFloat(ele);
        if (
          !isNaN(valorNumerico) &&
          valorNumerico.toString().length !== ele.length
        ) {
          const texto = ele.slice(valorNumerico.toString().length);
          array.push(valorNumerico)
          array.push('*')
          array.push(texto)
        } else {
          array.push(ele)
        }
      }
    }
    return array
  }
  calcularformula(texto) {
    try {
      return math.evaluate(texto);
    } catch {
      return null;
    }
  }
  async copiarFormula() {
    if (this.metradoSeleccionado &&this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila!==4) {
        this.mostrarError('Fila seleccionada no valida', '',2000)
        return;
      } else {
        this.formulaCopiada = this.metradoSeleccionado.formula == null|| this.metradoSeleccionado.formula ==''
            ? 'E*F*G*H'
            : this.metradoSeleccionado.formula;
        this.mostrarInfo('Formula Copiada', '',2000)
      }
    } else {
      this.mostrarError('Ninguna fila seleccionada', '',2000)
      return;
    }
  }
  async pegarFormula() {
    if (this.metradoSeleccionado.tipofila==4) {
      if (this.habilitadoCopiar) {
        const encontrados = this.tablaSistema.filter((ele) => ele.editarCopiar)
        for (const iterator of encontrados) {
          if (iterator.tipofila==4) {
            iterator.formula = this.formulaCopiada
            iterator.editarCopiar = false
          }
        }
        this.habilitadoCopiar = false
      } else {
        this.metradoSeleccionado.formula = this.formulaCopiada
      }
      await this.actuaTablaSistema()
    } else {
      this.mostrarError('No se puede pegar en la fila seleccionada', 'Error',2000)
      return
    }
  }
  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/)
    const resultado = partes.filter((elemento) => elemento !== '')
    return resultado
  }
  habEditFormula = false;
  modificandofila = false
  todosCheck = false
  saltardescripcion: boolean
  arrayCopiadosMetrado = []
  tempFormula: any[] = []
  celdasCopiadosMetrado = []
  formulaCopiada: string = null
  valorCopiado: string = null
  celdaFocus = null
  async actuaTablaSistema(valor=false){  
    for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if (row.tipofila === 4) {
        let total = 0;
        const { incidencia, cantidad, tiempo, tarifa } = row;
        const convertirPorcentaje = (valor) => {
          if (typeof valor === 'string' && valor.includes('%')) {
            return parseFloat(valor.replace('%', '')) / 100;
          }
          return parseFloat(valor); 
        };
        if (row.formula == null || row.formula == '') {
          const valoresNumericos = [
            convertirPorcentaje(incidencia),
            convertirPorcentaje(cantidad),
            convertirPorcentaje(tiempo),
            convertirPorcentaje(tarifa)
          ].filter(val => !isNaN(val) && String(val) !== '');
    
          if (valoresNumericos.length > 0) {
            total = valoresNumericos[0];
            for (let j = 1; j < valoresNumericos.length; j++) {
              total *= valoresNumericos[j];
            }
            row.total = total == 0 ? null : this.formsService.redondeo(total, this.dec_indirectos);
          } else {
            row.total = null;
          }
        } else {
          const array2 = [
            { key: incidencia, value: 'E' },
            { key: cantidad, value: 'F' },
            { key: tiempo, value: 'G' },
            { key: tarifa, value: 'H' },
          ];
          let formula = row.formula;
          array2.forEach(item => {
            const regex = new RegExp(item.value, 'g');
            const valor = item.key === '' || item.key == null ? 0 : convertirPorcentaje(item.key);
            formula = formula.replace(regex, valor);
          });
    
          try {
            
            formula = formula.replace(/[^0-9+\-*/(). ]/g, ''); 
            total = eval(formula);
            row.total = total == 0 ? null : this.formsService.redondeo(total, this.dec_indirectos);
          } catch (e) {
            row.total = null; 
          }
        }
      }
    }
    let auxili=0
    var total =0
    var totalsup=0
    let auxiliar
     for  (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if (row.tipofila === 4 && row.total) {
        total=total +parseFloat(row.total)
        auxiliar='fila4'
      }else if(row.tipofila == 3){
        row.total= this.esCero(total)?null:this.formsService.redondeo(total, this.dec_indirectos)
        totalsup=total+totalsup
        auxiliar='fila3'
        total=0
      }else if (row.tipofila==2||(row.tipofila==1&&auxiliar!=='')){
        if(auxiliar=='fila3'){
          auxili= auxili+totalsup
          row.total=this.esCero(totalsup)?null:this.formsService.redondeo(totalsup, this.dec_indirectos)
          totalsup=0
          auxiliar=''
        }else if(auxiliar=='fila4'){
          totalsup=total+totalsup
          auxili= auxili+totalsup
          row.total=this.esCero(totalsup)?null:this.formsService.redondeo(totalsup, this.dec_indirectos)
          totalsup=0
          total=0
          auxiliar=''
        }else if((auxiliar==''||!auxiliar)&&(this.esCero(total)||this.esCero(totalsup))){
          row.total=null
        }
      }else if(row.tipofila==1||row.tipofila==5){
        row.total=null
      }
    }
    const filteredData  =await JSON.parse(JSON.stringify(this.tablaSistema.filter(item => item.indice !== null && item.indice !== '' && item.id_fila !== null&&item.id_fila !=='')))
    filteredData.forEach((item, index) => {
      item.id_fila = index + 1
    })
    const filterdata2 =  await this.datasourceDeta.filter(item => item.indice != this.auxindice.toString());
    this.datasourceDeta =  [...filterdata2, ...filteredData]
    this.auxtotal= this.FormatoTotal(this.formsService.redondeo(auxili,this.dec_indirectos))
    if(!valor){
      this.actualizarTemp(8)
    }
    this.CalcularTabla()
  }
  esCero = (valor: any): boolean => {
    return parseFloat(valor) === 0;
  };
  @HostListener('document:copy', ['$event'])
  handleCopy(event: ClipboardEvent): void {
    const clipboardValido = !!navigator.clipboard;
    if (!clipboardValido) {
      if (this.celdaFocus) {
        let valorcopiado = null;
        if (this.filaSel2 !== null) {
          valorcopiado = this.tablaSistema[this.filaSel2][this.celdaFocus];
        }
        if (valorcopiado) {
          // Usar un elemento oculto para copiar el texto
          const textArea = document.createElement('textarea');
          textArea.value = valorcopiado;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            this.celdaFocus = null; // Resetea celdaFocus después de copiar
          } catch (err) {
            console.error('Error al copiar el texto: ', err);
          } finally {
            document.body.removeChild(textArea); // Elimina el textarea
          }
        }
      }
    } else {
    }
  }
  manejarPegar(event: ClipboardEvent): void {
    const textoPegado = event.clipboardData?.getData('text') || '';
    if (this.archivoText.length + textoPegado.length > 50) {
      event.preventDefault();
      const espacioRestante = 50 - this.archivoText.length;
      this.archivoText += textoPegado.slice(0, espacioRestante);
    }
  }
  QuitarComas(value){
    const splitPunto =value ?value.split(',') : [];
    let valor = null;
    if (splitPunto.length > 1) {
      if (!isNaN(Number(splitPunto[0])) &&!isNaN(Number(splitPunto[1]))) {
        valor =value.replaceAll(',','');
      } else {
        valor =value;
      }
    } else {
      valor =value;
    }
    const splitPunto2 =value ?value.split('.') : [];
    if (splitPunto2.length > 2) {
      let numeroEntero = splitPunto2.slice(0, -1).join('');
      let numeroFinal = numeroEntero + '.' + splitPunto2[splitPunto2.length - 1];
      if (this.isNumber(numeroFinal)) {
          valor = numeroFinal;
      } else {
          valor =value;
      }
    }else{
      valor= valor!==value? valor:value
    }
    return valor
  }

  async textoCopSplit(text, tipo = false) {
    try {
      const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
        let opciones = [];
        let opcion = null;
        const array = ['item','descripcion','unidad','incidencia','cantidad','tiempo','tarifa',];
        if (!this.celdaFocus) {
          if (this.metradoSeleccionado.id_fila !== null&&this.metradoSeleccionado.id_fila!=='') {
            if (this.metradoSeleccionado.tipofila==2||this.metradoSeleccionado.tipofila==3) {
              opciones = [
                'Bajo la agrupacion seleccionada',
                'Reemplazar seleccionado',
              ];
            } else {
              opciones = ['Bajo la agrupacion seleccionada'];
            }
            const sw = await SwalService.optionokcancel(
              opciones,
              'Opción pegado',
              '0'
            );
            if (sw !== undefined) {
              opcion = Number(sw);
            } else {
              this.valorCopiado = null;
              this.mostrar_carga_todo = false;
              return;
            }
          } else {
            opcion = 0;
          }
        } else {
          opcion = Number(1);
        }
        let arrayStructura = [];
        let completo = [];
        const celda = this.celdaFocus ? this.celdaFocus : 'item';
        const idx = array.indexOf(celda);
        const arrayValidos = array.slice(idx == -1 ? 0 : idx, array.length);
        if (tipo) {
          const a = text.split(/(\n\r|\n|\r)/gm);
          const splitText = text.split('\n');
          splitText.map((ele) => {
            if (ele !== '') {
              const sp = ele.split('\t');
              const arrayLimpio = sp.map(item => item?.trim());
              completo.push(arrayLimpio);
            }
          });
        } else {
          completo = text.split('	');
        }
        let msjRecorte = false;
        for (const iterator of completo) {
          var fila = {};
          let i = 0;
          for (const key of arrayValidos) {
            if (
              iterator[i] !== null &&
              iterator[i] !== undefined &&
              iterator[i] !== ''
            ) {
              if (!isNaN(iterator[i]) && iterator[i].trim() !== '') {
                const partes = iterator[i].split('.');
                if (partes[0].length > 8) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              } else {
                const cantLimite = (key == 'descripcion' ? 200 : 80) 
                if (iterator[i].length > cantLimite) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              }
            }
            fila[key] = key=='item'?iterator[i]:await this.QuitarComas(iterator[i]);
            i++;
          }
          arrayStructura.push(fila);
        }
        let indice = null;
        const valido = await this.sgteValido2(filaSel2 + 1);
        if (opcion) {
          indice = JSON.parse(JSON.stringify(filaSel2));
        } else {
          if (valido.index !== null) {
            let inicio = filaSel2 !== -1 ? filaSel2 : 0;
            if (this.metradoSeleccionado.id_fila == null||this.metradoSeleccionado.id_fila=='') {
              inicio = JSON.parse(JSON.stringify(filaSel2));
            }
            for (let i = inicio + 1; i < this.tablaSistema.length; i++) {
              let row = this.tablaSistema[i];
              if ((row.id_fila !== null && row.id_fila!=='')&& (row.tipofila==1||row.tipofila==2)) {
                if (indice == null) {
                  indice = i;
                }
                break;
              } else if ( row.id_fila!==null&&row.id_fila!==''&&row.tipofila!=1&&row.tipofila!=2) {
                indice = i + 1;
              } else if ((row.id_fila == null||row.id_fila == '') && indice == null) {
                indice = i;
              }
            }
          } else {
            indice = JSON.parse(JSON.stringify(filaSel2));
          }
        }
        let k = 0;
        for (const row of arrayStructura) {
          let metrado = null;
          if (opcion) {
            let omitir = false;
            if (
              this.tablaSistema[indice + k] &&
              (this.tablaSistema[indice + k]?.id_fila !== null &&this.tablaSistema[indice + k]?.idfila !== '')&&
              indice + k <= this.tablaSistema.length
            ) {
              metrado = JSON.parse(
                JSON.stringify(this.tablaSistema[indice + k])
              );
              if (metrado.id_fila !== null) {
                omitir = true;
              }
            } else {
              metrado = {
                id_proyecto: this.id_proyecto,
                indice:this.auxindice,
                cantidad: '',
                id_fila: this.auxidfila+1,
                incidencia: '',
                item: '',
                nivel: '',
                formula: '',
                orden: '',
                tiempo: '',
                tipofila: 4,
                total: '',
                unidad: '',
                descripcion:'',
                tarifa:'',
                mostrar:1,
                icomost:0
              };
            }
            let arromitir = ['id_fila', 'indice'];
            for (let key in row) {
              if (omitir && arromitir.includes(key)) {
              } else {
                if (row[key] !== undefined) {
                  if((key=='cantidad'||key=='incidencia'||key=='tiempo'||key=='tarifa')&&row[key]!==''&&this.isNumber(row[key])){
                    metrado[key] =   this.determinarDecimales(row[key],this.dec_indirectos) 
                  }else{
                    metrado[key] = row[key]
                  }
                }
              }
            }

            if (indice + k <= this.tablaSistema.length) {
              this.tablaSistema[indice + k] = metrado;
            } else {
              this.tablaSistema.push(metrado);
            }
          } else {
            metrado = {
              id_proyecto: this.id_proyecto,
              indice:this.auxindice,
              cantidad: '',
              id_fila: this.auxidfila+1,
              incidencia: '',
              item: '',
              nivel: '',
              formula: '',
              orden: '',
              tiempo: '',
              tipofila: 4,
              total: '',
              unidad: '',
              descripcion:'',
              tarifa:'',
              mostrar:1,
              icomost:0
            };
            let j = 0;
            for (let key in row) {
              if (row[key] !== undefined) {
                  if((key=='cantidad'||key=='incidencia'||key=='tiempo'||key=='tarifa')&&row[key]!==''&&this.isNumber(row[key])){
                    metrado[key] = this.determinarDecimales(row[key],this.dec_indirectos) 
                  }else{
                    metrado[key] = row[key]
                  }
                }
              }
              metrado.tipofila = 4;
            if (indice + k <= this.tablaSistema.length) {
              this.tablaSistema.splice(indice + k, 0, metrado);
            } else {
              this.tablaSistema.push(metrado);
            }
          }
          k++;
        }
        await this.ComprobarFilas()
        await this.actuaTablaSistema()
        if (msjRecorte) {
          this.toaster.warning(
            'Se omitieron valores (textos mayores a 50 caracteres 0 numericos con la parte entera mayores a 8 digitos)',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 7000,
            }
          );
        }
      
      this.seleccionCelda = false;
      this.mostrar_carga_todo= false;
      this.celdaFocus = null;;
    } catch (e) {
      SwalService.error(e);
      console.log(e);
      this.mostrar_carga_todo= false;
    }
  }
  totalproyectos
  async OpenmodaddData(){
      this.nomtabsel="tab1"
      this.modalProyecto.show()
  }
  vista1=true;
  busqueda=''
  @Input() tipoProy=[];
  nomtabsel='';
  limpiarfiltro() {
    this.busqueda = '';
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
  }
  FormConf = new UntypedFormGroup({
    seltipoproy: new UntypedFormControl(''),
  })
  get seltipoproy(): UntypedFormControl { return this.FormConf.get('seltipoproy') as UntypedFormControl }
  fila_sel=-1
  tiposel='';
  fuentesel=0;
  Databusqueda=[]
  async cambiarTipoProy(idtipo: any){
    this.fila_sel=-1;
    this.tiposel=this.seltipoproy.value;
    if(this.fuentesel.toString()=="3"){
      this.buscando=true;
      this.Databusqueda=[];
      let rproyectos = await this.principalService.ListarProyCompartidos({id_usuario:this.id_user});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          this.Databusqueda.push(row);
        }
      }
      this.buscando=false;
    }
    else{
      this.buscando=true;
      this.Databusqueda=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.id_user,fuente:this.fuentesel,tipo_proy:this.tiposel,id_proyecto:this.id_proyecto });//fuente 1 proyectos usuario
      this.Databusqueda=rproyectos;
      this.buscando=false;
    }
  }
  async cambiarFuente(idfuente:any){
    this.fuentesel=idfuente;
    if(idfuente=="3"){
      this.buscando=true;
      this.Databusqueda=[];
      let rproyectos = await this.principalService.ListarProyCompartidos({id_usuario:this.id_user});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          let resp = await this.listIndirectoProy({id_proyecto:row.id_proyecto})
          row.existeaux= resp[1].length
          this.Databusqueda.push(row)
        }
      }
      this.buscando=false;
    }
    else{
      this.buscando=true;
      this.Databusqueda=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.id_user,fuente:idfuente,tipo_proy:this.tiposel,id_proyecto:this.id_proyecto });
      this.Databusqueda=rproyectos;
      this.Databusqueda.map(async (item)=>{
        if(item.id_proyecto!==''){
          let resp = await this.listIndirectoProy({id_proyecto: item.id_proyecto})
          item.existeaux=resp[1].length
        }else{
          item.existeaux=''
        }
      })
     
      this.buscando=false;
    }
  }
  cambindicesel(row:any,ind: any) {
    if (row.nro == "") {
      if (ind == this.fila_sel)
        this.fila_sel = -1;
      else
        this.fila_sel = row.id_proyecto;
    }
  }
  toggleOn10(id: string) {
    for (let row of this.Databusqueda) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff10(id: string) {
    for (let row of this.Databusqueda) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  Regresar(){
    this.vista1=true;
  }
  datasourcePresu=[]
  datasourcePri2=[]
  idproysel:any;
  nomproysel:any;
  monedabusq='S/';
  busqueda2 = '';
  fila_sel2=-1;
  auxindice2
  Tabletablaaux=[]
  async Siguiente(){
    if(this.fila_sel>-1){
      let rowsel;
      for(let row of this.Databusqueda){
        if(row.id_proyecto==this.fila_sel){
          rowsel=row;
          break;
        }
      }
      if(rowsel){
        if(rowsel.nro==''){
          this.mostrar_carga_todo=true
          if(this.idproysel!=rowsel.id_proyecto){
            this.idproysel=rowsel.id_proyecto
            this.nomproysel=rowsel.descripcion
            this.monedabusq=this.simbolo?this.simbolo:'S/'
            let auxili = await this.presuservice.ListarPresuIndirecto({
              id_usuario: this.id_user,
              id_proyecto: this.idproysel,
              titulo: 0,
            });
            if (auxili.id == '1') {
              let tabs = JSON.parse(auxili.tabla);
              this.datasourcePri2 = tabs[0];
            }
             this.Tabletablaaux = await this.datasourcePri2.filter(
              (item) => item.tipo_registro === 4
            );
            this.auxindice2=this.Tabletablaaux[0]?.indice
            let res= await this.listIndirectoProy({id_proyecto:this.idproysel})
            this.datasourcePresu=res[1].filter((item)=>item.indice==this.auxindice2)
            for(let row of this.datasourcePresu){
              row.incidencia=row.incidencia==null||row.incidencia==''?'':row.incidencia
              row.cantidad=row.cantidad==null||row.cantidad==''?'':row.cantidad
              row.tiempo=row.tiempo==null||row.tiempo==''?'':row.tiempo
              row.total=row.total==null||row.total==''?'':row.total
              row.tarifa=row.tarifa==null||row.tarifa==''?'':row.tarifa
              row.mostrar= 1
              row.icomost=row.tipofila<5?1:0
              row.seleccion=0
            }
          }
          this.mostrar_carga_todo=false
          this.vista1=false
        }
        else{
          this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else{
      this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  toggleOnpresu(index) {
    this.datasourcePresu[index].icomost = 1
    const total= this.datasourcePresu.length
    if(this.datasourcePresu[index].tipofila<4 && total-1>index ){
      const resp =this.BuscarSiguientepresu(index+1,this.datasourcePresu[index].tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = index + 1; i < nuevo  ; i++) {
        const row = this.datasourcePresu[i];
          row.mostrar = 1
          if(row.icomost==0){
            row.icomost=1
          }
      }
    }
  }

  BuscarSiguientepresu(indice,tipofila){
    for(let i=indice;i<=this.datasourcePresu.length;i++){
      const row = this.datasourcePresu[i];
      if(tipofila==1){
        if((row.id_fila !== null && row.tipofila == tipofila)||(i==this.datasourcePresu.length-1)){
          return i
        }
      }else if(tipofila==2){
        if((row.id_fila !== null && row.tipofila == tipofila)||(i==this.datasourcePresu.length-1)||(row.id_fila !== null && row.tipofila==1)){
          return i
        }
      }else if(tipofila==3){
        if((row.id_fila !== null && row.tipofila == tipofila)||(i==this.datasourcePresu.length-1)||(row.id_fila !== null && (row.tipofila==1||row.tipofila==2))){
          return i
        }
      }else if(tipofila==4){
        if((row.id_fila !== null && row.tipofila == tipofila)||(i==this.datasourcePresu.length-1)||(row.id_fila !== null && (row.tipofila==1||row.tipofila==2||row.tipofila==3))){
          return i
        }
      }
    }
  }
  async cambindiceselpresu2(ind: any) {
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }
  async toggleOffpresu(index) {
    const total= this.datasourcePresu.length
    this.datasourcePresu[index].icomost = 0;
    if(this.datasourcePresu[index].tipofila<4 && total-1>index){
      const resp =this.BuscarSiguientepresu(index+1,this.datasourcePresu[index].tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = index + 1; i < nuevo  ; i++) {
        const row = this.datasourcePresu[i];
          if(row.id_fila!=null&&row.id_fila!=''){
            row.mostrar = 0
          }
      }
    }
  }
  Cambioseltpri2(row,ind){
    const total= this.datasourcePresu.length
    const resp =this.BuscarSiguientepresu(ind+1,row.tipofila)
    let nuevo=resp==total-1? resp+1:resp 
    if(row.seleccion==0){
      row.seleccion=1;
      for (let i = ind + 1; i < nuevo  ; i++) {
        const row = this.datasourcePresu[i];
          if(row.id_fila!=null&&row.id_fila!=''){
            row.seleccion = 1
          }
      }
    }else{
      row.seleccion=0;
      for (let i = ind + 1; i < nuevo  ; i++) {
        const row = this.datasourcePresu[i];
          if(row.id_fila!=null&&row.id_fila!=''){
            row.seleccion = 0
          }
      }
    }
  }
  async seleccionar(){
    let datosextras=[]
    datosextras = await this.datasourcePresu.filter((item) => item.seleccion === 1).map((item) => {
      return {
        ...item, 
        id_proyecto:this.id_proyecto,  
        indice:this.auxindice,  
        icomost:item.tipofila<5?0:1
      };
    });
    if(datosextras.length>0){
      this.mostrar_carga_todo=true;
      if(this.filaSel2){
        this.tablaSistema.splice(this.filaSel2+1, 0, ...datosextras);
        this.CompletarTablaSistema()
      }else{
        this.tablaSistema = this.tablaSistema.filter((item) => item.id_fila !== null && item.id_fila !== '');
        this.tablaSistema.push(...datosextras)
        this.CompletarTablaSistema()
      }
      datosextras=[]
      this.vista1=true;
      this.ComprobarFilas()
      this.actuaTablaSistema()
      this.modalProyecto.hide()
      this.mostrar_carga_todo=false;
     }else{
      this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
     }
  }
  async VerDetalles2(value){
    this.auxindice2=value
    let res= await this.listIndirectoProy({id_proyecto:this.idproysel})
    this.datasourcePresu=res[1].filter((item)=>item.indice==value)
    for(let row of this.datasourcePresu){
      row.incidencia=row.incidencia==null||row.incidencia==''?'':row.incidencia
      row.cantidad=row.cantidad==null||row.cantidad==''?'':row.cantidad
      row.tiempo=row.tiempo==null||row.tiempo==''?'':row.tiempo
      row.total=row.total==null||row.total==''?'':row.total
      row.tarifa=row.tarifa==null||row.tarifa==''?'':row.tarifa
      row.mostrar= 1
      row.icomost=row.tipofila<5?1:0
      row.seleccion=0
    } 
  }
  async enviarDataImpresion() {
    let presutemp = await this.presuservice.ListarIndirectoTemp({
      id_proyecto: this.id_proyecto,
      id_usuario: this.id_user,
    });
    try {
      this.mostrar_carga_todo = true;
      if (this.existetemp || presutemp.length) {
        let msj = '';
        if (this.existetemp && presutemp.length) {
          msj = 'Existen cambios sin guardar';
        } else if (!this.existetemp && presutemp.length) {
          msj = 'Existen cambios sin guardar';
        } else if (this.existetemp && !presutemp.length) {
          msj = 'Existen cambios sin guardar';
        }
        this.mostrar_carga_todo = false;
        this.mostrarError(msj,'',3000)
        return;
      } else {
        const detalleProyecto = await this.principalService.recuperarDatosProyecto({
          id_proyecto: this.id_proyecto,
        });
        const arralig=['center','left','center','center','center','center','center','right']
        const keys_body=['item','descripcion','unidad','incidencia','cantidad','tiempo','tarifa','total']
        const keys_dec=[null,null,null,this.dec_indirectos,this.dec_indirectos,this.dec_indirectos,this.dec_indirectos,this.dec_indirectos]
        const arrayHeader=['N°','DESCRIPCION','UNIDAD','INCIDENCIA','CANTIDAD','TIEMPO','TARIFA','VALOR TOTAL']
        let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
        const tablaCompleta = resp[1].map((item)=>{
          let nuevoItem = { ...item };
          switch(nuevoItem .tipofila) {
            case 1:
              nuevoItem.tipoletra = this.stilosTit.tipo;  
              nuevoItem.color = this.stilosTit.color;       
              nuevoItem.alinea = this.stilosTit.alineamiento; 
              break;
            case 2:
              nuevoItem.tipoletra = this.stilosMet.tipo;  
              nuevoItem.color = this.stilosMet.color;       
              nuevoItem.alinea = this.stilosMet.alineamiento; 
              break;
            case 3:
              nuevoItem.tipoletra = this.stilosSubM.tipo;  
              nuevoItem.color = this.stilosSubM.color;       
              nuevoItem.alinea = this.stilosSubM.alineamiento; 
              break;
            case 4:
              nuevoItem.tipoletra = this.stilosTexto.tipo;  
              nuevoItem.color = this.stilosTexto.color;       
              nuevoItem.alinea = this.stilosTexto.alineamiento; 
              break;
            case 5:
              nuevoItem.tipoletra = this.stilosTexto2.tipo;  
              nuevoItem.color = this.stilosTexto2.color;       
              nuevoItem.alinea = this.stilosTexto2.alineamiento; 
              break;
            default:
               nuevoItem.tipoletra = '';  
              nuevoItem.color = '';       
              nuevoItem.alinea = '';
              break;
          }
          return nuevoItem;
        })
        let datos = {
          datos_proyecto:detalleProyecto,
          header: arrayHeader,
          keys_body: keys_body,
          keys_dec: keys_dec,
          col_alig: arralig,
          tabla: tablaCompleta,
          concat_tabla2: false,
          tipo_reporte: 7,
          orientacion: '',
          moneda: this.simbolo, // condicionar
          titulo: 'COSTOS INDIRECTOS',
          actual:this.auxindice
        };
        const modalRef = this.modalService.open(ReportesComponent, {
          size: 'lg modalgrande',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false,
        });
        modalRef.componentInstance.datos = datos;
        const result = await modalRef.result;
        this.mostrar_carga_todo = false;
      }
    }catch(e){
      this.mostrar_carga_todo = false;
        SwalService.error();
        console.log(e);  
    }
  }
  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    this.datasourcePresu[this.fila_sel2].icomost = 1
    const total= this.datasourcePresu.length
    let row=this.datasourcePresu[this.fila_sel2];
    if(row.tipofila<4&&total-1>this.fila_sel2){
      const resp = this.BuscarSiguientepresu(this.fila_sel2+1,row.tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = this.fila_sel2 + 1; i < nuevo  ; i++) {
        const row2 = this.datasourcePresu[i];
          row2.mostrar = 1
          if(row2.icomost==0){
            row2.icomost=1
          }
      }
    }  
  }
  ContraeTodo(){
    const total= this.datasourcePresu.length
    let row=this.datasourcePresu[this.fila_sel2];
    if(row.tipofila<4&&total-1>this.fila_sel2){
      const resp = this.BuscarSiguientepresu(this.fila_sel2+1,row.tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = this.fila_sel2 + 1; i < nuevo  ; i++) {
        const row2 = this.datasourcePresu[i];
         if(row2.tipofila==row.tipofila+1){
            row2.icomost=0
         }else{
            row2.icomost=0
            row2.mostrar=0
         }
      }
    }  
  }
  calcularTotal(array){
    let total=0
    for (let k=0;k<array.length;k++){
      if(array[k].tipofila==2&&array[k].total!==''&&array[k].total!==null){
        total=total+ parseFloat(array[k].total)
      }
    }
    return total
  }
  findabrev(input){
    let encontrado= this.datasourcePri.find((item)=>item.abrev==input)
    if(encontrado){
      return encontrado.monto
    }else{
      return ''
    }
  }
  scrollbut: boolean = false;
  @ViewChild('box2', { static: false }) box2!: ElementRef;
  leftDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft += 15;
  }
  rigthDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft -= 15;
  }
  maxtodoMetrado(){
    for(let k=0;k<this.tablaSistema.length;k++){
      if(this.tablaSistema[k].icomost==1){
        this.tablaSistema[k].icomost=0
      }
      if(this.tablaSistema[k].mostrar==0){
        this.tablaSistema[k].mostrar=1
      }
    }
  }
  mintodoMetrado(){
    for(let k=0;k<this.tablaSistema.length;k++){
     if(this.tablaSistema[k].id_fila!=null&&this.tablaSistema[k].id_fila!==''){
      if(this.tablaSistema[k].tipofila<3){
        this.tablaSistema[k].icomost=0
      }else{
        this.tablaSistema[k].mostrar=0
      }
     }
    }
  }
}
