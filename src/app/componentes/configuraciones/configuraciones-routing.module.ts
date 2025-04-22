import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametrosComponent } from '../configuraciones/parametros/parametros.component';
import { PerfilComponent } from '../configuraciones/perfil/perfil.component';
import { ProveedoresComponent } from '../administrador/proveedores/proveedores.component';
import { IndiceuniflectComponent } from './indiceuniflect/indiceuniflect.component';
import { ManualusComponent } from '../administrador/manualus/manualus.component';
import { MonpaisComponent } from './monpais/monpais.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
          path: 'confparam',
          component : ParametrosComponent
      },
      {
          path: 'ejemplo/confparam',
          component : ParametrosComponent
      },
      {
        path: 'confperfil',
        component : PerfilComponent
      },
      {
        path: 'manuser',
        component: ManualusComponent
      },
      {
        path: 'proveedlect',
        component : ProveedoresComponent
      },
      {
        path: 'indiunif',
        component : IndiceuniflectComponent
      },
      {
        path: 'monedas',
        component : MonpaisComponent,
      },
      {
          path: '**',
          redirectTo: 'principal/inicio',
          pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionesRoutingModule { }
