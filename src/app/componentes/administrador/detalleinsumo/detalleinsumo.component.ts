import { Component, OnInit, Output } from '@angular/core';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';

@Component({
  selector: 'app-detalleinsumo',
  templateUrl: './detalleinsumo.component.html',
  styleUrls: ['./detalleinsumo.component.scss']
})
export class DetalleinsumoComponent implements OnInit {
  cargando: boolean = false
  cargando2: boolean = false
  expandirUnidad : boolean = false
  expandirIndice : boolean = false
  constructor(private configuracionService: ConfiguracionService) { }
  
  async ngOnInit() {
    try {

    } catch(e) {
      console.log(e);
      
    }
  }

  activarBloqueoPantalla(e) {
    this.cargando = e      
  }

  activarBloqueoPantalla2(e) {
    this.cargando2 = e      
  }

  expandir(indice , unidad) {
    this.expandirUnidad = unidad
    this.expandirIndice = indice
  }
}
