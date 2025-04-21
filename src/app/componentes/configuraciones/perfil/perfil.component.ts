import { Component, OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { UntypedFormGroup, Validators, UntypedFormBuilder, FormControl } from '@angular/forms';
import {Router} from '@angular/router';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from '../../../servicios/swal.service'
import { FormsService } from 'src/app/servicios/forms.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PerfilComponent implements OnInit {
  mostrar_carga:boolean;
  mostrar_carga_todo:boolean;
  //alertas
  position = 'top-right';
  title: string;
  msg: string;
  showClose = true;
  theme = 'bootstrap';
  type = 'default';
  closeOther = false;
  mensaje_res:string;
  fechahoy:any;
  id_usuario:any;
  idUadmin:any;
  esSecund:any;
  //datos
  nombres:any;
  tipo_usuario:any;
  licencia:any;
  codigo:any;
  fecha_asinga:any;
  fecha_culmi:any;
  tiempo_restante
  telefono:any;
  correo:any;
  nacionalidad:any;
  departamento:any;
  provincia:any;
  distrito:any;
  id_dep:any;
  id_prov:any;
  id_dist:any;
  direccion:any;
  genero:any;
  id_genero:any;
  login:any;
  //datos combo
  datadepa:[];
  dataprovi:[];
  datadistri:[];
  //editar
  es_editar1:any;

  public Editar1 :UntypedFormGroup;
  @ViewChild("camblogin") modalcamLog: ModalBasicComponent;
  @ViewChild("cambpass") modalcamPass: ModalBasicComponent;

  constructor(
    private _configuracionesService: ConfiguracionService,
    public _EncriptadorService:EncriptadorService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private toaster: ToastrService,
    public formService: FormsService,
  ) { }

  async ngOnInit() {
    try{
      this.Editar1 = this.formBuilder.group({
        Deptact: [''],
        Provact: [''],
        Distact:[''],
        Direccionact:[''],
        Genero:[''],
        Telefono:[''],
        Correo:['',[Validators.required, Validators.pattern(`${this.formService.RE_EMAIL}`)]],
      });
      $(".toggle-password").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") == "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
      $(".toggle-password1").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") == "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
      $(".toggle-password2").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") == "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
  
      this.id_usuario=this._EncriptadorService.recuperarlocalstory('idusuario');
      this.idUadmin = await this._EncriptadorService.recuperarlocalstory('id_admin');
      this.esSecund=this.id_usuario!=this.idUadmin?true:false;
      this.es_editar1=false;
      this.mostrar_carga=true
      let res=await this._EncriptadorService.FechaActualBack();
      if(res.id==1){
        this.fechahoy=new Date(res.mensaje);
      }
      this.listardepa();
      this.cargarDatos();
      this.mostrar_carga=false;
    }
    catch{
      this.toaster.error('No se pudo recuperar la información.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  //cargas iniciales
  async listardepa(){
    this.datadepa = await this._configuracionesService.Departamento()
  }
  async chdepa(value){
    if(value!='')
    {
      this.dataprovi = [];
      this.datadistri = [];
      this.Editar1.get("Provact").setValue("");
      this.Editar1.get("Distact").setValue("");
      this.Editar1.get("Provact").setValidators(Validators.required);
      this.Editar1.controls["Provact"].updateValueAndValidity();
      this.Editar1.get("Distact").setValidators(Validators.required);
      this.Editar1.controls["Distact"].updateValueAndValidity();
      this.dataprovi = await this._configuracionesService.Provincia(value);
    }
    else
    {
      this.dataprovi = [];
      this.datadistri = [];
      this.Editar1.get("Provact").setValue("");
      this.Editar1.get("Distact").setValue("");
      this.Editar1.get("Provact").clearValidators();
      this.Editar1.get("Distact").clearValidators();
      this.Editar1.get("Provact").updateValueAndValidity();
      this.Editar1.get("Distact").updateValueAndValidity();
    }
  }
  async chprovi(value){
    if(value!='')
    {
      this.datadistri = [];
      this.Editar1.get("Distact").setValue("");
      
      let valor = value.split("-");
      let valor1 = parseInt(valor[0]);
      let valor2 = parseInt(valor[1]);
      this.datadistri = await this._configuracionesService.Distrito(valor1,valor2);
    }
    else
    {
      this.datadistri = [];
    }
  }
  async cargarDatos(){
    try{
      this.mostrar_carga=true;
      let res1= await this._configuracionesService.VerDatosUsuario(this.id_usuario);
      if(res1.length>0)
      {
        this.nombres=res1[0].nombres;
        /* this.dni=res1[0].dni; */
        this.telefono=res1[0].telefono;
        this.correo=res1[0].correo;
        this.login=res1[0].login;
      }
      let res= await this._configuracionesService.VerDatosUsuarioDetalle(this.id_usuario);
      if(res.length>0)
      {
        this.tipo_usuario=res[0].nom_tipo;
        this.licencia=res[0].desc_licencia;
        var dia1=new Date(this.fechahoy.getUTCFullYear(),this.fechahoy.getMonth(),this.fechahoy.getDate(),0,0,1);
        if(res[0].fechacul){
          var fculm=new Date(res[0].fechacul);
          var dia2=new Date(fculm.getUTCFullYear(),fculm.getMonth(),fculm.getDate(),0,0,1);
          var Time = dia2.getTime() - dia1.getTime(); 
          var dif = Time / (1000 * 3600 * 24);
          this.tiempo_restante=dif;
        }
        else{
          this.tiempo_restante='Licencia Ilimitada';
        }
        this.codigo=res[0].codigo;
        this.fecha_asinga=res[0].fechaasig;
        this.fecha_culmi=res[0].fechacul;
        this.direccion=res[0].direccion;
        this.nacionalidad=res[0].nompais;
        this.departamento=res[0].deptact;
        this.id_dep=res[0].id_deptact!=null?res[0].id_deptact:'';
        this.provincia=res[0].provact;
        this.id_prov=res[0].id_provact!=null?res[0].id_provact:'';
        this.distrito=res[0].distact;
        this.id_dist=res[0].id_distact!=null?res[0].id_distact:'';
        this.genero=res[0].genero;
        this.id_genero=res[0].id_genero;
      }
      else
      {
        this.tipo_usuario='';
        this.licencia='';
        this.codigo='';
        this.fecha_asinga='';
        this.fecha_culmi='';
        this.direccion='';
        this.nacionalidad='';
        this.departamento='';
        this.id_dep='';
        this.provincia='';
        this.id_prov='';
        this.distrito='';
        this.id_dist='';
        this.genero='';
        this.id_genero='';
      }
      this.mostrar_carga=false;
    }
    catch{
      //agregar toast

    }
  }
  //acciones
  async cliceditar1(){
    try{
      this.mostrar_carga=true;
      //condicionar si existe departamento, siempre seleccionar provincia y distrito, sino es opcional
      if(this.id_dep!=''){
        this.dataprovi= await this._configuracionesService.Provincia(this.id_dep);
        this.datadistri= await this._configuracionesService.Distrito(this.id_dep,this.id_prov);
        var idprov=this.id_dep+"-"+this.id_prov;
        var iddist=this.id_dep+"-"+this.id_prov+"-"+this.id_dist;
        this.Editar1 = this.formBuilder.group({
          Deptact: [this.id_dep],
          Provact: [idprov],
          Distact:[iddist],
          Direccionact:[this.direccion],
          Genero:[this.genero=='Femenino'?'1':this.genero=='Masculino'?'2':''],
          Telefono:[this.telefono],
          Correo:[this.correo,[Validators.required, Validators.pattern(`${this.formService.RE_EMAIL}`)]],
        });
        this.mostrar_carga=false;
        this.es_editar1=true;
      }
      else{
        this.Editar1 = this.formBuilder.group({
          Deptact: [this.id_dep],
          Provact: [''],
          Distact:[''],
          Direccionact:[this.direccion],
          Genero:[this.genero=='Femenino'?'1':this.genero=='Masculino'?'2':''],
          Telefono:[this.telefono],
          Correo:[this.correo,[Validators.required, Validators.pattern(`${this.formService.RE_EMAIL}`)]],
        });
        this.mostrar_carga=false;
        this.es_editar1=true;
      }
    }
    catch{
      this.toaster.error('No se pudo recuperar la información.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  async Guardar1(){
    try{
      if(!this.Editar1.invalid){
        this.mostrar_carga_todo=true;
        let telef=this.Editar1.get('Telefono').value?this.Editar1.get('Telefono').value:'';
        let corr=this.Editar1.get('Correo').value?this.Editar1.get('Correo').value:'';
        let ubiact=this.Editar1.get('Distact').value;
        let direc=this.Editar1.get('Direccionact').value?this.Editar1.get('Direccionact').value:'';
        let genero=this.Editar1.get('Genero').value;
        let res= await this._configuracionesService.ModDatosPerfil(this.id_usuario,telef,corr,'',ubiact,direc,genero,this.id_usuario);
        this.mostrar_carga_todo=false;
        this.es_editar1=false;
        if(res.length>0)
        {
          if(res[0].res=='1'){
            this.cargarDatos();
            await SwalService.success('Exitoso','Los datos se actualizaron correctamente.');
          }
          else{
            await SwalService.error('Advertencia','No se encontro el id del usuario.');
          }
        }
      }
      else{
        this.Editar1.markAllAsTouched();
        this.toaster.error('Debe llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    catch{
      // Entra aquí si el servicio entrega un código http de error EJ: 404, 
      this.mostrar_carga_todo=false;
      this.es_editar1=false;
      /* this.addToast({title:'Advertencia', msg:'No se pudo guardar los cambios.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
      await SwalService.error('Advertencia','No se pudo guardar los cambios.');
      this.cargarDatos();
    }
  }
  cliccancelar1(){
    this.es_editar1=false;
  }
  CambiarPass(){
    this.modalcamPass.show();
  }
  cerrarModal2(){
    const input = document.getElementById("password-field-new");
    input.setAttribute("type", "password");
    const input2 = document.getElementById("password-field-ant");
    input2.setAttribute("type", "password");
    if($(".toggle-password").hasClass('fa-eye-slash'))
    {
      $(".toggle-password").toggleClass('fa-eye fa-eye-slash')
    }
    if($(".toggle-password1").hasClass('fa-eye-slash'))
    {
      $(".toggle-password1").toggleClass('fa-eye fa-eye-slash')
    }
    $("#password-field-ant").val('');
    $("#password-field-new").val('');
    this.modalcamPass.hide();
  }
  async confirmAlertGuardar2(){
    try{
      this.mostrar_carga_todo=true;
      var anterior=$("#password-field-ant").val();
      var nuevo=$("#password-field-new").val();
      if(anterior!="" && nuevo!="")
      {
        let res= await this._configuracionesService.CambiarContrasena(this.id_usuario,anterior,nuevo);
        this.mostrar_carga_todo=false;
        if(res.length>0)
        {
          if(res[0].res==1)
          {
            this.cerrarModal2();
            /* this.addToast({title:'Exitoso', msg:res[0].mensaje, timeout: 5000, theme:'default', position:'bottom-right', type:'success'}) */
            await SwalService.success('Exitoso',res[0].mensaje);
            this.cargarDatos();
          }
          else
          {
            /* this.addToast({title:'Advertencia', msg:res[0].mensaje, timeout: 5000, theme:'default', position:'bottom-right', type:'erro'}) */
            await SwalService.error('Advertencia',res[0].mensaje);
          }
        }
      }
      else
      {
        this.toaster.error('Llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    catch{
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo guardar los cambios.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      this.cargarDatos();
    }
    
  }
  CambiarLogin(){
    this.modalcamLog.show();
  }
  cerrarModal1(){
    const input2 = document.getElementById("password-field-con");
    input2.setAttribute("type", "password");
    if($(".toggle-password2").hasClass('fa-eye-slash'))
    {
      $(".toggle-password2").toggleClass('fa-eye fa-eye-slash')
    }
    $("#password-field-con").val('');
    $("#txt_lognew").val('');
    
    this.modalcamLog.hide();
  }
  async confirmAlertGuardar1(){
    try {
      this.mostrar_carga_todo=true;
      var lognew=$("#txt_lognew").val();
      var passcon=$("#password-field-con").val();
      if(lognew!="" && passcon!="")
      {
        let res= await this._configuracionesService.CambiarLoginUser(this.id_usuario,passcon,lognew);
        this.mostrar_carga_todo=false;
        if(res.length>0)
        {
          if(res[0].res==1)
          {
            this.cerrarModal1();
            await SwalService.success('Exitoso',res[0].mensaje);
            this.cargarDatos();
          }
          else
          {
            /* this.addToast({title:'Advertencia', msg:res[0].mensaje, timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
            await SwalService.error('Advertencia',res[0].mensaje);
          }
        }
      }
      else
      {
        this.toaster.error('Llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    catch{
      this.mostrar_carga_todo=false;
      /* this.addToast({title:'Advertencia', msg:'No se pudo guardar los cambios.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
      this.toaster.error('No se pudo guardar los cambios.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      this.cargarDatos();
    }
  }
  logout() {
    console.log('perfilcomponent')
    localStorage.clear();
    this.router.navigate(['/'])
  }
  //otros metodos
  quitarfoco(element:any){
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  activarBloqueoPantalla(e) {
    this.mostrar_carga = e      
  }
}
