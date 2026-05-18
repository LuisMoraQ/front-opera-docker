import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { transition, trigger, style, animate } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from './../../servicios/login.service';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { EncriptadorService } from './../../servicios/encriptador.service';
import { PrincipalService } from './../../servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
export interface tablacui {
  cui: string;
  descripcion: string;
}

const ELEMENT_DATA: tablacui[] = [
  { cui: '', descripcion: '' }]

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  mostrar_carga_todo: boolean;
  displayedColumns2: string[] = ['cui', 'descripcion'];
  dataSource2 = ELEMENT_DATA
  @ViewChild("modRecupera") modalRecupera: ModalBasicComponent;
  position = 'bottom-right';
  public loginF: UntypedFormGroup;
  usuario: string = "";
  clave: string = "";
  submitted: boolean;
  message: string;
  esError: boolean;
  nombres: string;
  selectRow: string;
  cui: string;
  descripcion: string;
  errorcorreo='';
  formUsuario = new UntypedFormGroup({
    Rlogin: new UntypedFormControl('', [Validators.required]),
    Rcorreo: new UntypedFormControl('', [Validators.required, Validators.pattern(`${this.formService.RE_EMAIL}`)]),
  })
  get rlogin(): UntypedFormControl { return this.formUsuario.get('Rlogin') as UntypedFormControl }
  get rcorreo(): UntypedFormControl { return this.formUsuario.get('Rcorreo') as UntypedFormControl }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private _EncriptadorService: EncriptadorService,
    private principalService:PrincipalService,
    private servicioLogin: LoginService,
    public formService: FormsService,
    private ruta: Router,
    public menuItems: MenuItems,
    private toaster: ToastrService,
    private configuracionService: ConfiguracionService,
  ) { }

  ngOnInit(): void {
    document.querySelector('body').classList.remove('dark');
    document.querySelector('body').setAttribute('themebg-pattern', 'theme1');//cambiar login
    this.loginF = this.formBuilder.group({
      login: ['', Validators.required],
      clave: ['', Validators.required]
    });
    this.servicioLogin.getIdUser().subscribe(data => {
      if(localStorage.length>0){
        let token= this._EncriptadorService.recuperarlocalstory('token')
        if(token){
          if(JSON.parse(token??null)==data[0]?.xtoken){//misma conexion de usuario
            //verificar fecha caduca
            let fechaa = moment(data[0].fechaserv);
            let fechab = moment(data[0].fechacul);
            let difdias=(fechab.diff(fechaa, 'days'));
            if(difdias<0){
              this.mostrar_carga_todo=false;
              SwalService.error('Advertencia','Su membresia ya venció. Renueve su membresia para acceder al sistema.')
              /* this.toaster.error('Su membresia ya venció. Renueve su membresia para acceder al sistema.', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 }) */
              localStorage.clear()
              return;
            }
            else if(difdias<=6){
              this.toaster.error('Su membresia vencerá en '+ (difdias) +' días. Renueve su membresia o perderá el acceso al sistema.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
            }
            let nomusuario = this._EncriptadorService.recuperarlocalstory('nombre');
            SwalService.informative('Bienvenido', nomusuario)
            this.menuItems.lateral();
            setTimeout(this.navigateToPrinc.bind(this), 100);
            return true;
          }
          else{
            console.log('logincomponent3')
            localStorage.clear()
            //this.ruta.navigate(['/login']);
            return false;
          }
        }
        else{
          console.log('logincomponent1')
          localStorage.clear()
          //this.ruta.navigate(['/login']);
          return false;
        }
      }
      if (data[0].res == 'false') {
        console.log('logincomponent2')
        localStorage.clear()
        //this.ruta.navigate(['/login']);
        return false;
      }
      else {
        
      }
    })
    document.getElementById('inlogin').focus();
  }
  navigateToPrinc() {
    this.ruta.navigate(['/principal/inicio']);
  }
  get f() { return this.loginF.controls; }

  async onLogin() {
    try{
      this.submitted = true;
      if (this.loginF.invalid) {
        if (this.f.login.value == '' || this.f.clave.value == '') {
          let msj = ''
          if (this.f.login.valid && !this.f.clave.valid) {
            msj = 'la CONTRASEÑA'
          } else if (!this.f.login.valid && this.f.clave.valid) {
            msj = 'el USUARIO'
          } else {
            msj = 'el USUARIO y CONTRASEÑA'
          }
          const swa = await SwalService.error('', 'Ingrese ' + msj + ' porfavor')
          if (swa.isConfirmed) {
            window.setTimeout(function () {
              document.getElementById('inlogin').focus();
            }, 350);
          }
        }
        this.loginF.markAllAsTouched();
        return;
      }
      this.mostrar_carga_todo = true;
      await this.servicioLogin.loginUsuario(this.f.login.value, this.f.clave.value).subscribe(async data => {
        let datos = data[0]
        if (datos != undefined) {
          let fechaa = moment(datos.fechaserv);
          let fechab = moment(datos.fechacul);
          let difdias=(fechab.diff(fechaa, 'days'));
          if(difdias<0){
            this.mostrar_carga_todo=false;
            this.servicioLogin.ActuEstUser({id_usuario:datos.id_usuario,estado:2});
            SwalService.error('Advertencia','Su membresia ya venció. Renueve su membresia para acceder al sistema.')
            /* this.toaster.error('Su membresia ya venció. Renueve su membresia para acceder al sistema.', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 }) */
            return;
          }
          else if(difdias<=6){
            this.toaster.error('Su membresia <strong>vencerá en '+ (difdias) +' días</strong>. Renueve su membresia o perderá el acceso al sistema.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000,enableHtml: true })
          }
          if(datos.estado==2){
            this.mostrar_carga_todo=false;
            SwalService.error('Advertencia','No tiene acceso al sistema. Comuniquese con un administrador.')
            return;
          }
          if(!datos.conex){
            console.log('datos', datos)
            this._EncriptadorService.guardarlocalstory('idusuario', JSON.stringify(datos.id_usuario));
            this._EncriptadorService.guardarlocalstory('role', JSON.stringify(datos.role));
            this._EncriptadorService.guardarlocalstory('nombre', JSON.stringify(datos.nombres));
            this._EncriptadorService.guardarlocalstory('token', JSON.stringify(datos.token));
            this._EncriptadorService.guardarlocalstory('accesos', JSON.stringify(datos.arbol));
            this._EncriptadorService.guardarlocalstory('fechaact', JSON.stringify(datos.fechaact));
            this._EncriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(false));
            this._EncriptadorService.guardarlocalstory('id_admin', JSON.stringify(datos.id_admin));
            this._EncriptadorService.guardarlocalstory('menu_proy', JSON.stringify(datos.menu_proy));
            this._EncriptadorService.guardarlocalstory('maxproy', JSON.stringify(datos.nroproys??''));
            let res=await this.principalService.ListarAspectosProy({id_usuario:datos.id_admin});
            if(res!=null){
              let decimales=res.dec_metrado+"|"+res.dec_precio+"|"+res.dec_parcial+"|"+res.dec_cant;
              this._EncriptadorService.guardarlocalstory('decimales', decimales);
              let aspectos={
                colorPresupuesto:res.colorPresupuesto,
                letraPresupuesto:res.letraPresupuesto,
                tipoPresupuesto:res.tipoPresupuesto,
                colorCronograma:res.colorCronograma,
                letraCronograma:res.letraCronograma,
                tipoCronograma:res.tipoCronograma
              };
              this._EncriptadorService.guardarlocalstory('aspectostablas', JSON.stringify(aspectos));
            }
            else{
              let decimales="2|2|2|2";
              this._EncriptadorService.guardarlocalstory('decimales', decimales);
              let aspectos={
                colorPresupuesto:'',
                letraPresupuesto:'',
                tipoPresupuesto:'',
                colorCronograma:'',
                letraCronograma:'',
                tipoCronograma:''
              };
              this._EncriptadorService.guardarlocalstory('aspectostablas', JSON.stringify(aspectos));
            }
            localStorage.setItem('tabs', '[]')
            localStorage.setItem('configtema', datos.configtema),
            localStorage.setItem('principal', 'true')
            this.menuItems.lateral();
            this.mostrar_carga_todo = false;
            SwalService.informative('Bienvenido', datos.nombres)
            this.ruta.navigate(['/principal/inicio']);
          }
          else{
            this.mostrar_carga_todo = false;
            //const sw = await SwalService.info('EL usuario ya esta conectado.', 'Cierre sesion antes de volver a ingresar.')
            const sw = await SwalService.confirm('Existe un Sesión Activa!', 'Esta seguro que desea forzar el cierre de la Sesión Activa?')
            if (sw.isConfirmed) {
              this.mostrar_carga_todo = true;
              const respuesta = await this.servicioLogin.ForzarSes({id_usuario:datos.id_usuario,token:datos.token});
              if (respuesta?.id == "1") {
                this._EncriptadorService.guardarlocalstory('idusuario', JSON.stringify(datos.id_usuario));
                this._EncriptadorService.guardarlocalstory('role', JSON.stringify(datos.role));
                this._EncriptadorService.guardarlocalstory('nombre', JSON.stringify(datos.nombres));
                this._EncriptadorService.guardarlocalstory('token', JSON.stringify(datos.token));
                this._EncriptadorService.guardarlocalstory('accesos', JSON.stringify(datos.arbol));
                this._EncriptadorService.guardarlocalstory('fechaact', JSON.stringify(datos.fechaact));
                this._EncriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(false));
                this._EncriptadorService.guardarlocalstory('id_admin', JSON.stringify(datos.id_admin));
                this._EncriptadorService.guardarlocalstory('menu_proy', JSON.stringify(datos.menu_proy));
                this._EncriptadorService.guardarlocalstory('maxproy', JSON.stringify(datos.nroproys??''));
                let res=await this.principalService.ListarAspectosProy({id_usuario:datos.id_admin});
                if(res!=null){
                  let decimales=res.dec_metrado+"|"+res.dec_precio+"|"+res.dec_parcial+"|"+res.dec_cant;
                  this._EncriptadorService.guardarlocalstory('decimales', decimales);
                  let aspectos={
                    colorPresupuesto:res.colorPresupuesto,
                    letraPresupuesto:res.letraPresupuesto,
                    tipoPresupuesto:res.tipoPresupuesto,
                    colorCronograma:res.colorCronograma,
                    letraCronograma:res.letraCronograma,
                    tipoCronograma:res.tipoCronograma
                  };
                  this._EncriptadorService.guardarlocalstory('aspectostablas', JSON.stringify(aspectos));
                }
                else{
                  let decimales="2|2|2|2";
                  this._EncriptadorService.guardarlocalstory('decimales', decimales);
                  let aspectos={
                    colorPresupuesto:'',
                    letraPresupuesto:'',
                    tipoPresupuesto:'',
                    colorCronograma:'',
                    letraCronograma:'',
                    tipoCronograma:''
                  };
                  this._EncriptadorService.guardarlocalstory('aspectostablas', JSON.stringify(aspectos));
                }
                this.mostrar_carga_todo = false;
                localStorage.setItem('tabs', '[]')
                localStorage.setItem('configtema', datos.configtema),
                localStorage.setItem('principal', 'true')
                this.menuItems.lateral();
                this.mostrar_carga_todo = false;
                SwalService.informative('Bienvenido', datos.nombres)
                this.ruta.navigate(['/principal/inicio']);
              }
              else {
                SwalService.error('Advertencia', 'No se pudo realizar la operación.');
              }
            }
            else{
              document.getElementById('inlogin').focus();
            }
          }
        }
        else {
          this.mostrar_carga_todo = false;
          /* this.dangerSwal('Los datos ingresados son INCORRECTOS') */
          this.loginF = this.formBuilder.group({
            login: ['', Validators.required],
            clave: ['', Validators.required]
          });
          const swa = await SwalService.error('', 'El nombre de usuario o la contraseña que ingresó no son válidos.');
          if (swa.isConfirmed) {
            window.setTimeout(function () {
              document.getElementById('inlogin').focus();
            }, 350);
          }
        }
      },
      async error => {
        console.log(error)
        this.mostrar_carga_todo = false;
        /* this.dangerSwal('Ocurrio una excepción al momento de realizar la operación.') */
        const swa = await SwalService.error('', 'Ocurrio una excepción al momento de realizar la operación.')
        if (swa.isConfirmed) {
          window.setTimeout(function () {
            document.getElementById('inlogin').focus();
          }, 350);
        }
      });
    }
    catch(e){
      this.mostrar_carga_todo = false;
      console.log(e);
      const swa = await SwalService.error('', 'Ocurrio una excepción al momento de realizar la operación.')
    }
  }
  async openModRenovar(){
    this.modalRecupera.show();
    document.getElementById('logrec')?.focus();
  }
  
  cerrarModal2(){
    //limpiar valores
    this.rlogin.setValue('');
    this.rcorreo.setValue('');
    this.modalRecupera.hide();
  }
  verificarCorreo(){
    this.rcorreo.markAsTouched();
    if(this.rcorreo.value==''){
      this.errorcorreo='';
    }
    else{
      if(this.rcorreo.status=='INVALID'){
        this.errorcorreo='Formato de correo incorrecto.';
      }
      else{
        this.errorcorreo='';
      }
    }
  }
  async EnviaClave(){
    try{
      this.mostrar_carga_todo=true;
      let res = await this.configuracionService.RecuperarPassw(this.rlogin.value,this.rcorreo.value);
      this.mostrar_carga_todo=false;
      if(res.id=='1'){
        SwalService.success('Correcto',res.mensaje)
        this.cerrarModal2();
      }
      else{
        SwalService.error('Advertencia',res.mensaje)
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
    }
  }
}
