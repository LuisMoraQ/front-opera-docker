import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-ficha-tecnica',
  templateUrl: './ficha-tecnica.component.html',
  styleUrls: ['./ficha-tecnica.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FichaTecnicaComponent implements OnInit {
  ficha = null
  @Input() set fichaTecnica(value: any) {
    this.ficha = value
    this.convertirTexto(this.ficha)
  }
  constructor() { }

  ngOnInit() {
  }
  convertirTexto(str) {
    var aux = str;
    document.getElementById("demo").innerHTML = aux;
  };

}
