import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carinsumo-usuario',
  templateUrl: './carinsumo-usuario.component.html',
  styleUrls: ['./carinsumo-usuario.component.scss']
})
export class CarinsumoUsuarioComponent implements OnInit {
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
