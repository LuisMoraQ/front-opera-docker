import { PartidasSistemaComponent } from './partidas-sistema/partidas-sistema.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { CaracteristicasInsumoComponent } from './caracteristicas-insumo/caracteristicas-insumo.component';
import { LicenciasComponent } from './licencias/licencias.component';
import { DatainsumoComponent } from './datainsumo/datainsumo.component';
import { DetalleinsumoComponent } from './detalleinsumo/detalleinsumo.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipouserComponent } from './tipouser/tipouser.component';
import { ManteusuariosComponent } from '../configuraciones/manteusuarios/manteusuarios.component';
import { ProysistemaComponent } from '../proyectos/proysistema/proysistema.component';
import { MonpaisComponent } from '../configuraciones/monpais/monpais.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'tipouser',
        component: TipouserComponent
      },
      {
        path: 'detalleinsumo',
        component: DetalleinsumoComponent
      },
      {
        path: 'datainsumo',
        component: DatainsumoComponent
      },
      {
        path: 'mantuser',
        component : ManteusuariosComponent
      },
      {
        path: 'licencias',
        component : LicenciasComponent
      },
      {
        path: 'caracteristicas-insumo',
        component : CaracteristicasInsumoComponent
      },
      {
        path: 'proveedores',
        component : ProveedoresComponent
      },
      {
        path: 'partidas-sistema',
        component : PartidasSistemaComponent
      },
      {
        path: 'proysistem',
        component: ProysistemaComponent
      },
      {
        path: 'monedas',
        component: MonpaisComponent
      },
      {
        path: '**',
        redirectTo: 'principal/inicio',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
