import { Component, Input, OnInit } from '@angular/core';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';

@Component({
  selector: 'app-registro-informacion',
  templateUrl: './registro-informacion.component.html',
  styleUrls: ['./registro-informacion.component.scss']
})
export class RegistroInformacionComponent implements OnInit {
  activetab = 1
  datasourcePri = []
  @Input() tabproyecto = null 
  constructor(private presuservice: PresupuestosService) { }

  ngOnInit() {
    console.log('tabproyecto', this.tabproyecto)
  }
  onNavChange(e) {
    console.log('e', e)
  }


  listarPresInd() {
    // let res = await this.presuservice.ListarPresuIndirecto({
    //   id_usuario: this.id_user,
    //   id_proyecto: this.id_proyecto,
    //   titulo: 0,
    // });
    // if (res.id == '1') {
    //   let tabs = JSON.parse(res.tabla);
    //   this.datasourcePri = tabs[0];
    }
  }
