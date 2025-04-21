import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-caracteristicas-insumo',
  templateUrl: './caracteristicas-insumo.component.html',
  styleUrls: ['./caracteristicas-insumo.component.scss']
})
export class CaracteristicasInsumoComponent implements OnInit {
  cargando = false;
  cargando2 = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  expandirTipo : boolean = false
  expandirClasificacion : boolean = false
  constructor() { }

  ngOnInit(): void {
  }


  expandir(tipo , clasificacion) {
    this.expandirTipo = tipo
    this.expandirClasificacion = clasificacion
  }
}
