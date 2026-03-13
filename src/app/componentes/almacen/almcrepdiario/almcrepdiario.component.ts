import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-almcrepdiario',
  templateUrl: './almcrepdiario.component.html',
  styleUrls: ['./almcrepdiario.component.scss']
})
export class AlmcrepdiarioComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  enviUrl = '';
  solover=false
  id_reg:any
  id_proyecto:any
  iduser:any
  uidadmin:any
  //dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;

  dataSource6=[]
  heighttmodal13:any;
  buscando6=false;
  fila6_sel=-1
  estadosel=0
  tipocontra=0
  detalledisgre=[]

  prov1
  prov2
  prov3
  provsel=0//1,2,3

  busqueda = '';
  buscando = false
  dataProv=[]
  fila_sel=-1
  editarp=false;
  fechagana
  nroorden

  datasol=[]
  totalsol
  filasol_sel=-1
  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;
  fechaac:any;
  vence1=false
  vence2=false
  vence3=false
  imagenPreview
  nomempresa

  constructor() { }

  ngOnInit(): void {
  }

}
