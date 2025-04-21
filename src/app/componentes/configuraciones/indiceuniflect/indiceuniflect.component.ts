import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MatSort } from '@angular/material/sort';
import { SwalService } from 'src/app/servicios/swal.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
export interface documentoPdf {
  nombre: any;
  url: any;
}

@Component({
  selector: 'app-indiceuniflect',
  templateUrl: './indiceuniflect.component.html',
  styleUrls: ['./indiceuniflect.component.scss']
})

export class IndiceuniflectComponent implements OnInit {
  @Input('height') height: number = 200;
  @Output() cargaCompleta2 = new EventEmitter<boolean>()
  buscando = false;
  documentopdf:any;
  mostrar_carga_todo: boolean = false;
  documentoSeleccionado = null;
  arrayNombresDocs: documentoPdf[] = [];
  displayedColumn: string[] = ['id_indice', 'desc_indice','abrev'];
  fila_sel: any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  zoom=0.8
  constructor(private configuracionService: ConfiguracionService,
    private principalService: PrincipalService, private _sanitizer: DomSanitizer
  ) { };
  busqueda = '';
  maximizar = false
  @Output() expanded  = new EventEmitter<boolean>()
  
  async ngOnInit() {
    try {
      /* this.cargaCompleta2.emit(true); */
      this.dataSource.data = [];
      await this.asignarbody()
      await this.listarIndicesUnificados()
      this.dataSource.sort = this.sort;
      /* this.cargaCompleta2.emit(false); */
      await this.descargarDocumento();
    } catch (e) {
      console.log(e);
    }
  }
  async asignarbody() {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
      if (document.body.clientWidth <= 768) {
        this.height = (window.innerHeight - resto) / 2;
      } else {
        this.height = window.innerHeight - resto;
      }
    } else {
      this.height = window.innerHeight - resto;
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
      if (document.body.clientWidth <= 768) {
        this.height = (window.innerHeight - resto) / 2;
      } else {
        this.height = window.innerHeight - resto;
      }
    } else {
      this.height = window.innerHeight - resto;
    }
  }
  async listarIndicesUnificados() {
    this.buscando = true;
    this.dataSource.data = [];
    this.dataSource.data = await this.configuracionService.listarIndiceUnificados()
    this.buscando = false;
  }
  applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustResourceUrl(v);
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
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  async expandir() {
    this.maximizar = !this.maximizar
    this.expanded.emit(this.maximizar)
  } 
  async descargarDocumento() {
    try {
      this.mostrar_carga_todo = true
      const inputDescargar = {
        nombre: 'INDICES-UNIFICADOS.pdf',
        subc: ''
      }
      const response = await this.principalService.descargarDocumento(inputDescargar)
      if (response.nombre.toString().includes('.pdf')) {
        //const source = `data:application/pdf;base64,${response.archivo}`;
        //this.documentopdf=  source;
        let pdfbytes = await this._base64ToArrayBuffer(response.archivo)
        this.documentopdf=  pdfbytes;
      }
      this.mostrar_carga_todo = false
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async _base64ToArrayBuffer(base64) {
    var binary_string = base64.replace(/\\n/g, '');
    binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  zoomIn() {
    if (this.zoom > 3) return;
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    if (this.zoom < 0.1) return;
    this.zoom = this.zoom - 0.1;
  }
}
