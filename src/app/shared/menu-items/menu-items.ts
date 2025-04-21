import {Injectable} from '@angular/core';
import { LoginService } from './../../servicios/login.service';
import { MantenimientosService } from './../../servicios/mantenimientos.service';
import {EncriptadorService} from './../../servicios/encriptador.service';
import { PromesasService } from 'src/app/servicios/promesas.service';
import { SwalService } from 'src/app/servicios/swal.service';
export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  target?: boolean;
  name: string;
  type?: string;
  children?: ChildrenItems[];
}

export interface MainMenuItems {
  state: string;
  short_label?: string;
  main_state?: string;
  target?: boolean;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

export interface Menu {
  label: string;
  main: MainMenuItems[];
  state: string;
}
/* 
const MENUITEMS = [
  {
    label: 'Navigation',
    state: 'configs',
    main: [
      {
        state: 'simple-page',
        short_label: 'S',
        name: 'Sample Page',
        type: 'link',
        icon: 'icon-layout-sidebar-left'
      },
      {
        state: 'confparam',
        short_label: 'S',
        name: 'Parametros',
        type: 'link',
        icon: 'icon-layout-sidebar-left'
      },
      {
        state: 'tipouser',
        short_label: 'S',
        name: 'Tipos de Usuario',
        type: 'link',
        icon: 'icon-layout-sidebar-left'
      },
      {
        state: 'ejemplo',
        short_label: 'M',
        name: 'Menu Levels',
        type: 'sub',
        icon: 'icon-direction-alt',
        children: [
          {
            state: 'confparam',
            name: 'Menu Level 2.1',
          }, {
            state: '',
            name: 'Menu Level 2.2',
            type: 'sub',
            children: [
              {
                state: '',
                name: 'Menu Level 2.2.1',
                target: true
              },
              {
                state: '',
                name: 'Menu Level 2.2.2',
                target: true
              }
            ]
          }, {
            state: '',
            name: 'Menu Level 2.3',
            target: true
          }, {
            state: '',
            name: 'Menu Level 2.4',
            type: 'sub',
            children: [
              {
                state: '',
                name: 'Menu Level 2.4.1',
                target: true
              },
              {
                state: '',
                name: 'Menu Level 2.4.2',
                target: true
              }
            ]
          }
        ]
      }
    ]
  }
]; */
@Injectable()
export class MenuItems {
  MENUITEMS2: Menu[] = []

  constructor(
      public _LoginService:LoginService,
      public _MantenimientosService:MantenimientosService,
      public _EncriptadorService:EncriptadorService,
      private promesasService: PromesasService
    ){
    this.lateral();
  }
  
  getAll(): Menu[] {
    return this.MENUITEMS2;
  }
  lateral(){
    this.MENUITEMS2 =[]
    let idusuario = this._EncriptadorService.recuperarlocalstory('idusuario')
    if(idusuario!=null){
      this._LoginService.lateral(idusuario).subscribe(
        data => {
          this.MENUITEMS2 = JSON.parse(data[0].res);
        }
      )
    }
  }
}

