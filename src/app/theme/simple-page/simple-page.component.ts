import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'

export interface filaorg {
  id_tipo: string;
  nombre: string;
  abrev: string;
  seleccion: string;
  arbol: string;
  estado: any;
  fecha_ing: string;
  fecha_mod: string;
  most: any;
}

@Component({
  selector: 'app-simple-page',
  templateUrl: './simple-page.component.html',
  styleUrls: ['./simple-page.component.scss']
})

export class SimplePageComponent implements OnInit {
  displayedColumnorg: string[] = ['id_tipo', 'nombre', 'abrev', 'estado', 'fecha_ing', 'fecha_mod', 'acciones'];
  dataSourceorg = new MatTableDataSource<filaorg>();
  loginF = new UntypedFormGroup({
    login: new UntypedFormControl('', [Validators.required, Validators.minLength(1)])
  })
  constructor() { }

  ngOnInit() {
  }

}
