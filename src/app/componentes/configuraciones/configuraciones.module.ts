import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule} from '../../shared/shared.module';
import { ConfiguracionesRoutingModule } from './configuraciones-routing.module';
import { ParametrosComponent } from './parametros/parametros.component';
import { PerfilComponent } from './perfil/perfil.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox'
import { ToastyModule} from 'ng2-toasty';
import { MatTableModule} from '@angular/material/table';
import { MatSortModule} from '@angular/material/sort';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { MatTreeModule} from '@angular/material/tree';
import {MatDatepickerModule} from '@angular/material/datepicker'
import { TextMaskModule } from 'angular2-text-mask';
import { ModalMantusuarioComponent } from 'src/app/componentes/configuraciones/manteusuarios/modal-mantusuario/modal-mantusuario.component';
import { ManteusuariosComponent } from './manteusuarios/manteusuarios.component';
import { UsuariosecComponent } from './perfil/usuariosec/usuariosec.component';
import { IndiceuniflectComponent } from './indiceuniflect/indiceuniflect.component';
import { ProyectosModule } from '../proyectos/proyectos.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MonpaisComponent } from './monpais/monpais.component';
import { AnchocolModule } from 'src/app/directivas/anchocol.module';

@NgModule({
  declarations: [ParametrosComponent, PerfilComponent,  ModalMantusuarioComponent, ManteusuariosComponent, UsuariosecComponent, IndiceuniflectComponent,MonpaisComponent],
  imports: [
    AnchocolModule,
    CommonModule,
    ConfiguracionesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    NgbModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    ToastyModule,
    MatDatepickerModule,
    TextMaskModule,
    ProyectosModule,
    PdfViewerModule
    
  ]
})
export class ConfiguracionesModule { }
