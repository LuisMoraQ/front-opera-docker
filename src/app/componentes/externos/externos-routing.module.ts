import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { NodispoComponent } from './nodispo/nodispo.component';

const routes: Routes = [
  // {path: '',
  //   component:PortadaComponent,
  //   children: [
  //     {path:'', component : LoginComponent},
  //     {path:'nosotros', component : NosotrosComponent},
  //     {path: 'modulos',component :ModulosComponent},
  //     {path: 'planes',component :PlanesComponent},
  //     {path: 'ventajas',component :VentajasComponent},
  //     {path: 'contacto',component :ContactosComponent},
  //     {path: 'pasarela',component :PasarelaComponent},
  //     {
  //       path: '**',
  //       redirectTo: '',
  //       pathMatch: 'full'
  //     }
  //   ]/* ,canActivate: [RutapriGuard] */
  // },
  {path: '',
    component:NodispoComponent,
  },
  {path: 'error/:valor',
    component:NodispoComponent,
  },
  {path: 'cotizacion/:key',
    component:CotizacionComponent,
    /* ,canActivate: [RutapriGuard] */
  },
  // {path: 'cotizacion',//comentar o quitar si se requiere siempre el key
  //   component:CotizacionComponent,
  //   /* ,canActivate: [RutapriGuard] */
  // },
  {path: '**',redirectTo: '',pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternosRoutingModule { }
