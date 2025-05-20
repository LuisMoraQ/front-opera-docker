import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panelprocura',
  templateUrl: './panelprocura.component.html',
  styleUrls: ['./panelprocura.component.scss']
})
export class PanelprocuraComponent implements OnInit {
  mostrar_carga=false;
  mostrar_carga_todo=false;

  constructor() { }

  ngOnInit(): void {
  }

}
