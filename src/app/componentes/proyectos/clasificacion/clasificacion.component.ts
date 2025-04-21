import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { SwalService } from '../../../servicios/swal.service'
import { MatSort } from '@angular/material/sort';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { UntypedFormControl, UntypedFormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-clasificacion',
  templateUrl: './clasificacion.component.html',
  styleUrls: ['./clasificacion.component.scss']
})
export class ClasificacionComponent implements OnInit {
  displayedColumn: string[] = ['id_clasificacion', 'descripcion', 'abr_clasi', 'icono', 'observacion', 'activo', 'acciones'];
  dataSource = new MatTableDataSource();
  fila_sel: any;
  @ViewChild('table1', { read: MatSort, static: true }) sort1: MatSort;
  @ViewChild("modalAddClasi") modalClasi: ModalBasicComponent;
  @ViewChild("modalVerClasi") modalvClasi: ModalBasicComponent;
  @Input('height') height: number = 100;
  //varibles
  mostrar_carga: boolean = false;
  mostrar_carga_todo: boolean = false;
  buscando1 = false;
  busqueda = '';
  id_clasi: string;
  desc: string;
  abr: string;
  obs: string;
  iconover: any;
  mensaje_res: string;
  titmodalcar: string;
  roleUser='';
  public iconos = [
    { id: '&#61464;', fa: 'fa-road', nombre: 'Carretera' },
    { id: '&#61852;', fa: 'fa-institution', nombre: 'Edificacion' },
    { id: '&#61688;', fa: 'fa-hospital-o', nombre: 'Hospital' },
    { id: '&#61926;', fa: 'fa-plug', nombre: 'Enchufe' },
    { id: '&#61632;', fa: 'fa-group', nombre: 'Grupo' },
    { id: '&#61507;', fa: 'fa fa-tint', nombre: 'Agua' },
    { id: '&#62112;', fa: 'fa-volume-control-phone', nombre: 'Telefono' },
    { id: '&#61781;', fa: 'fa-usd', nombre: 'Dolar' },
    { id: '&#61461;', fa: 'fa-home', nombre: 'Casa' },
    { id: '&#61978;', fa: 'fa-ship', nombre: 'Barco' },
    { id: '&#62008;', fa: 'fa-train', nombre: 'Tren' },
    { id: '&#61649;', fa: 'fa-truck', nombre: 'Camion' },
    { id: '&#61554;', fa: 'fa-plane', nombre: 'Avion' },
    { id: '&#61485;', fa: 'fa-book', nombre: 'Libro' },
  ];
  nuevoClasi = new UntypedFormGroup({
    id_clasificacion: new UntypedFormControl('', Validators.required),
    descripcion: new UntypedFormControl('', Validators.required),
    abr_clasi: new UntypedFormControl('', Validators.required),
    observacion: new UntypedFormControl(''),
    icono: new UntypedFormControl(''),
    activo: new UntypedFormControl(true, Validators.required)
  })
  constructor(
    private router: Router,
    private _ClasificacionService: ClasificacionService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService) { }

  ngOnInit(): void {
    let roleus = this.encriptadorService.recuperarlocalstory('role');
    if(roleus?.includes('ADMINISTRADOR')){
      this.roleUser='ADMIN';
    }
    var resto = 200;
    if (document.body.clientWidth <= 992)
      resto = 220;
    this.height = window.innerHeight - resto;
    this.onListar();
  }
  //recuperar datos
  async onListar() {
    try {
      this.dataSource.data = [];
      this.buscando1 = true;
      let res=await this._ClasificacionService.ListarClasificacion();
      this.dataSource.data=res;
      this.dataSource.sort = this.sort1;
      this.buscando1 = false;
    }
    catch {
      this.buscando1 = false;
    }
  }
  vericono(icono: string) {
    return String.fromCodePoint(Number(icono.slice(2, -1)))
  }
  openModalGuardar() {
    this.mostrar_carga = true;
    // formUsuario = new FormGroup({
    //   id_usuario: new FormControl('', []),
    let valor = this.dataSource.data.length;
    this.nuevoClasi.reset()
    this.nuevoClasi.get('id_clasificacion').setValue(valor + 1)
    this.nuevoClasi.get('descripcion').setValue('');
    this.nuevoClasi.get('abr_clasi').setValue('');
    this.nuevoClasi.get('observacion').setValue('');
    this.nuevoClasi.get('icono').setValue('');
    this.nuevoClasi.get('activo').setValue(true);
    this.titmodalcar = "Registro";
    // this.tabset.select('tab1');
    this.mostrar_carga = false;
    this.modalClasi.show();
  }
  async guardar() {
    if (!this.nuevoClasi.invalid) {
      this.mostrar_carga_todo = true;
      //obtener valor
      if (this.titmodalcar == "Registro")//guardar
      {
        try {
          let valor = this.nuevoClasi.get('icono').value;
          let objico = this.iconos.find(data => data.id == valor);
          let iconopas = objico ? objico.id + '|' + objico.fa + '|' + objico.nombre : '';
          let res = await this._ClasificacionService.GuardarClasificacion(this.nuevoClasi.get('descripcion').value.toUpperCase(), this.nuevoClasi.get('abr_clasi').value.trim().toUpperCase(), this.nuevoClasi.get('observacion').value, iconopas, this.nuevoClasi.get('activo').value ? '1' : '0');
          this.mensaje_res = res[0].mensaje;
          this.mostrar_carga_todo = false;
          this.cerrarModal();
          this.onListar();
          if (res[0].id == "1") {
            SwalService.success('', this.mensaje_res);
          }
          else {
            SwalService.error('', this.mensaje_res);
          }
        }
        catch {
          this.mostrar_carga_todo = false;
          this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else//modificar
      {
        try {
          let valor = this.nuevoClasi.get('icono').value;
          let objico = this.iconos.find(data => data.id == valor);
          let iconopas = objico ? objico.id + '|' + objico.fa + '|' + objico.nombre : '';
          let res = await this._ClasificacionService.ModificarClasificacion(this.nuevoClasi.get('id_clasificacion').value, this.nuevoClasi.get('descripcion').value.toUpperCase(), this.nuevoClasi.get('abr_clasi').value.trim().toUpperCase(), this.nuevoClasi.get('observacion').value, iconopas, this.nuevoClasi.get('activo').value ? '1' : '0');
          this.mensaje_res = res[0].mensaje;
          this.mostrar_carga_todo = false;
          this.cerrarModal();
          this.onListar();
          if (res[0].id == "1")
            SwalService.success('', this.mensaje_res);
          else
            SwalService.error('', this.mensaje_res);
        }
        catch {
          this.mostrar_carga_todo = false;
          this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    }
    else {
      this.nuevoClasi.get('descripcion').markAsTouched();
      this.toaster.error('Debe llenar el tipo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  openModalVer(row) {
    this.id_clasi = row.id_clasificacion;
    this.desc = row.descripcion;
    this.abr = row.abr_clasi;
    this.obs = row.observacion;
    this.iconover = row.icono?.toString().split('|')[1];

    this.modalvClasi.show();
  }
  cerrarModal() {
    //limpiar valores
    this.modalClasi.hide();
  }
  cerrarModal2() {
    this.id_clasi = "";
    this.desc = "";
    this.abr = "";
    this.obs = "";
    // this.id_tipo="";
    // this.nombre="";
    // this.abrev="";
    // this.estado=false;
    this.modalvClasi.hide();
  }
  openModalEditar(row) {
    this.mostrar_carga = true;
    this.nuevoClasi.reset()
    this.nuevoClasi.get('id_clasificacion').setValue(row.id_clasificacion);
    this.nuevoClasi.get('descripcion').setValue(row.descripcion);
    this.nuevoClasi.get('abr_clasi').setValue(row.abr_clasi);
    this.nuevoClasi.get('observacion').setValue(row.observacion ?? '');
    let iconosel = row.icono != null ? row.icono.split('|')[0] : '';
    this.nuevoClasi.get('icono').setValue(iconosel);
    this.nuevoClasi.get('activo').setValue(row.activo);
    this.titmodalcar = "Modificar";
    this.mostrar_carga = false;
    this.modalClasi.show();
  }
  async confirmAlert(row) {
    try {
      const respu = await SwalService.confirm('Esta seguro?', 'Una vez realizada la acción no se podra revertir los cambios!');
      if (respu.isConfirmed) {
        this.mostrar_carga_todo = true;
        let res = await this._ClasificacionService.EliminarClasificacion(row.id_clasificacion);
        this.mensaje_res = res[0].mensaje;
        this.mostrar_carga_todo = false;
        this.onListar();
        if (res[0].id == "1")
          SwalService.success('', this.mensaje_res);
        else
          SwalService.error('', this.mensaje_res);
      }
    } catch {
      this.mostrar_carga_todo = false;
      this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
    if (this.busqueda == '')
      this.dataSource.filter = "";
  }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  async irVistaReportes() {
    this.router.navigate(['principal/proyects/reportes'])
  }
}
