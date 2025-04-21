import { Component, OnInit,ViewChild,HostListener} from '@angular/core';
import { DomSanitizer,SafeUrl } from '@angular/platform-browser';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component'
import { UntypedFormControl, UntypedFormGroup,Validators  } from '@angular/forms'
import { ConfiguracionService } from 'src/app/servicios/configuracion.service'
import { SwalService } from 'src/app/servicios/swal.service'
import { LoginService } from 'src/app/servicios/login.service';
import { ActivatedRoute,Router } from '@angular/router';
declare var grecaptcha: any

@Component({
  selector: 'app-pasarela',
  templateUrl: './pasarela.component.html',
  styleUrls: ['./pasarela.component.scss']
})
export class PasarelaComponent implements OnInit {
  @ViewChild("modalAceptar") modalAceptar: ModalBasicComponent
  IframeOr: boolean;
  menuActive = false;
  mostrar_carga_todo=false;
  currentImage = 'assets/sky.jpg'; // Cambia esta ruta según tus necesidades
  direcciontotal
  cambiodolar=3.76
  step = 1;
  MostrarCodigo: boolean = false;
  TotalCompras:number
  MostrarCampos: boolean = false;
  departamentos=[]
  paises = [{ id: 227, nombre: 'PERÚ' }]
  provincias = []
  distritos = []
  files: any[] = [];
  files2: any[] = [];
  selectedTab: number = 0;
  Subtotal
  descuento
  safeUrl1: SafeUrl;
  safeUrl2: SafeUrl;
  safeUrl3: SafeUrl;
  safeUrl4: SafeUrl;
  safeUrl5: SafeUrl;
  imageUrl: string = 'assets/img-menu/fondos/verde.jpg';
  imageUr2: string = 'assets/img-menu/fondos/azul.jpg';
  imageUr3: string = 'assets/img-menu/fondos/rojo.jpg';
  imageUr4: string = 'assets/img-menu/fondos/morado.jpg';
  setSafeUrls() {
    this.safeUrl1 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/i8fu0mwudco2blgnsjst4/interbank.png?rlkey=z3yev24uxw4mjislqdsp1lnng&st=5d58ts9t&raw=1');
    this.safeUrl2 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/72nbvfrc94x0xrmek2fzv/plin.png?rlkey=mrz8nafyzfd0jkzaolnro41xq&st=0oi5q5dv&raw=1');
    this.safeUrl3 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/cx177ns3l82ct3qgp163f/bcp.png?rlkey=kpjmzpwfdnx9z47bj57gwuii5&st=ix78bnid&raw=1');
    this.safeUrl4 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/ydkn9tcz1k08eep8nugkj/yape.png?rlkey=bjxlu644sc9dj7q86bfxc1bzf&st=c4u5jgjq&raw=1');
    this.safeUrl5 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/q55mktgontas498c1q3r8/nacion.png?rlkey=taibibsrrmkepa7mvflaeqhb4&st=av383wed&raw=1');
  }
  modulo=null;
  constructor(
    private sanitizer: DomSanitizer,
    private configuracionService: ConfiguracionService,
    private loginservice: LoginService,
    private route: ActivatedRoute,
    private router:Router
  ) { 
    this.setSafeUrls();
  }
  ngOnInit(): void {
    this.listarDepartamentos()
    this.loadReCaptchaScript()
    this.route.queryParams.subscribe(params => {
      this.modulo = params['modulo'];
    })
    if(this.modulo==="demo"){
      this.myGroup.get('tipo_compra').setValue('Demo')
    }else if(this.modulo!==undefined){
      this.myGroup.get(this.modulo).setValue(1)
      this.updateCart()
    }

  }
  nextStep() {
    if (this.isStepValid(this.step)) {
      if(this.step===2){
        this.modalAceptar.show()
        this.ObtenerDireccion()
      }else if (this.step===3){
        this.ObtenerDireccion()
      }
      this.step++;
    }
  }
  previousStep() {
    this.step--;
    if (this.step ===3 ) {
      this.myGroup.get('aceptarterminos').setValue(false)
      this.formularioAceptar.get('aceptarterminos').setValue(false)
      this.modalAceptar.show()
      this.ObtenerDireccion()
    }
  }
  goToStep(step: number) {
    if (this.isStepValid(step)) {
      if (step === 3) {
        this.myGroup.get('aceptarterminos').setValue(false)
        this.formularioAceptar.get('aceptarterminos').setValue(false)
        this.modalAceptar.show()
        this.ObtenerDireccion()
      }else if(step===4){
        this.ObtenerDireccion()
      }
      this.step = step;
    }
  }
  abrirModal(){
    this.modalAceptar.show()
  }
  isStepValid(step: number): boolean {
    let value= ((this.myGroup.get('nombre').value!==''&&this.myGroup.get('correo_electronico').value!==''&&this.myGroup.get('celular').value!==''&&this.myGroup.get('tipo_compra').value!=='')&&
    ((this.MostrarCampos===true&&this.myGroup.get('otrodepartamento').value!==''&&this.myGroup.get('otrocod_pais').value!=='')||(this.MostrarCampos===false&&this.myGroup.get('distrito').value!==''&&this.myGroup.get('provincia').value!==''&&this.myGroup.get('departamento').value!=='')))? true:false
    switch (step) {
      case 1: return value==true
      case 2: return value==true
      case 3: return (this.myGroup.get('aceptarterminos').value===true && this.myGroup.get('total').value>0)||(this.myGroup.get('aceptarterminos').value===true&&this.myGroup.get('tipo_compra').value==="Demo")
      case 4: return (this.myGroup.get('aceptarterminos').value===true && this.myGroup.get('total').value>0)||(this.myGroup.get('aceptarterminos').value===true&&this.myGroup.get('tipo_compra').value==="Demo")
      default: return false;
    }
  }
  updateCart(){
    let total
    this.TotalCompras= this.myGroup.get('licestudiantil').value*1 + this.myGroup.get('licprofesional').value*1 + this.myGroup.get('licbim').value*1
    // if(this.TotalCompras>=3){
    //   this.Subtotal=this.myGroup.get('licestudiantil').value*95+this.myGroup.get('licprofesional').value*170 +this.myGroup.get('licbim').value*240+this.myGroup.get('licempresarial').value*600
    //   this.descuento =this.myGroup.get('licestudiantil').value*95*0.15+this.myGroup.get('licprofesional').value*170*0.15 +this.myGroup.get('licbim').value*240*0.15
    //    total= this.Subtotal-this.descuento
    // }else{
    //    total=this.myGroup.get('licestudiantil').value*95+this.myGroup.get('licprofesional').value*170 +this.myGroup.get('licbim').value*240+this.myGroup.get('licempresarial').value*600
    //   this.Subtotal=total
    // }
    total=this.myGroup.get('licestudiantil').value*85.50+this.myGroup.get('licprofesional').value*136 +this.myGroup.get('licbim').value*192+this.myGroup.get('licempresarial').value*480
    this.Subtotal=total
    this.myGroup.get('total').setValue(total)
  }
  // usuarios=[{nombre:'Fulano Fulano Fulano',codigo:11012123123128,correo_electronico:'fulano123@hotmail.com',pais:227,provincia:'1-2',distrito:' Bagua',departamento:1,direccion:'Urb Los Olivos',celular:'6546461' },
  //   {nombre:'Fulano Fulano Fulano',codigo:11013123120,correo_electronico:'fulano112323@hotmail.com',pais:'',provincia:'',distrito:'',departamento:'',direccion:'Urb Los Olivos',otrodepartamento:'Bogota',otrocod_pais:'Colombia',celular:'6546461'},
  //   {nombre:'Fulano Fulano Fulano',codigo:11011231239,correo_electronico:'futbol1@hotmail.com',pais:227,provincia:'8-1',distrito:' Cusco',departamento:8,direccion:'rrrrrrrrrrrrrrrr' ,celular:'6546461'}
  // ]
  usuarios=[]
  myGroup = new UntypedFormGroup({
    captcha: new UntypedFormControl(''),
    correo_electronico:new UntypedFormControl('', [Validators.required, Validators.email]),
    celular: new UntypedFormControl('', [
      Validators.required,                   
      Validators.pattern('^\\+?[0-9\\s]*$'),          
      Validators.minLength(9),               
      Validators.maxLength(18)              
    ]),
    cod_pais: new UntypedFormControl(227, []),
    departamento: new UntypedFormControl('', []),
    distrito: new UntypedFormControl('', []),
    provincia: new UntypedFormControl('', []),
    otrocod_pais: new UntypedFormControl('', []),
    otrodepartamento: new UntypedFormControl('', []),
    tipo_compra:new UntypedFormControl('Licencia Nueva',[Validators.required]),
    nombre:new UntypedFormControl('',[Validators.required]),
    codigo:new UntypedFormControl(''),
    licestudiantil:new UntypedFormControl(''),
    licbim:new UntypedFormControl(''),
    licprofesional:new UntypedFormControl(''),
    licempresarial:new UntypedFormControl(''),
    total: new UntypedFormControl(''),
    aceptarterminos:new UntypedFormControl(false),
    archivoadjunto: new UntypedFormControl(''),
  })
  get distrito(): UntypedFormControl { return this.myGroup.get('distrito') as UntypedFormControl }
  get provincia(): UntypedFormControl { return this.myGroup.get('provincia') as UntypedFormControl }
  get departamento(): UntypedFormControl { return this.myGroup.get('departamento') as UntypedFormControl }
  get cod_pais(): UntypedFormControl { return this.myGroup.get('cod_pais') as UntypedFormControl }
  MostrarCampo(value){
    this.MostrarCodigo = value==='Renovacion'? true: false
  }
  async BuscarXCodigo(){
    const codigoIngresado = this.myGroup.get('codigo').value;
    if(codigoIngresado===''){  
      SwalService.error('Advertencia', 'Ingrese el codigo de Usuario');
      return; 
    }
    const usuarioEncontrado = this.usuarios.find(usuario => usuario.codigo === parseInt(codigoIngresado))
    if (usuarioEncontrado) {
      this.myGroup.get('nombre').setValue(usuarioEncontrado.nombre)
      this.myGroup.get('correo_electronico').setValue(usuarioEncontrado.correo_electronico)
      this.myGroup.get('celular').setValue(usuarioEncontrado.celular)
      if(usuarioEncontrado.pais===''){
        this.MostrarCampos= true
        this.myGroup.get('otrodepartamento').setValue(usuarioEncontrado.otrodepartamento)
        this.myGroup.get('otrocod_pais').setValue(usuarioEncontrado.otrocod_pais)
      }else{  
        this.mostrar_carga_todo=true;
        this.MostrarCampos = false
        this.myGroup.get('cod_pais').setValue(usuarioEncontrado.pais);
        let departamento = usuarioEncontrado.departamento;
        let departamentoNumerico = typeof departamento === 'number' ? departamento : parseInt(departamento, 10) || 0;
        this.myGroup.get('departamento').setValue(departamentoNumerico);
        await  this.listarProvincias(departamentoNumerico);
        this.myGroup.get('provincia').setValue(usuarioEncontrado.provincia);
        await this.listarDistritos(usuarioEncontrado.provincia);
        this.myGroup.get('distrito').setValue(usuarioEncontrado.distrito);
        this.mostrar_carga_todo=false;
      }
    } else {
        SwalService.error('Advertencia', 'El código que ingresó no perteneces a ningun Usuario');
    }
  }
  formularioAceptar= new UntypedFormGroup({
    aceptarterminos:new UntypedFormControl(false)
  })
  async listarDepartamentos() {
    this.departamentos = await this.configuracionService.Departamento()
  }
  async listarDistritos(idProvincia: string) {
    this.distritos = []
    this.distrito.reset()
    this.distrito.setValue('')
    if (!idProvincia) {
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    const provincia = this.provincia.value.split('-')
    this.distritos = await this.configuracionService.Distrito(this.departamento.value, provincia[1])
  }
  CambiarPais() {
    this.MostrarCampos = this.myGroup.get('cod_pais')?.value === '0'
    if (!this.MostrarCampos) {
      this.myGroup.get('pais')?.setValue('');
    }
  }
  ObtenerDireccion(){
    if(this.MostrarCampos){
      this.direcciontotal= this.myGroup.get('otrodepartamento').value +' - ' +this.myGroup.get('otrocod_pais').value 
    }
    else{
      this.direcciontotal= this.myGroup.get('distrito').value + ' - ' + this.obtenerProvinciaPorId(this.myGroup.get('provincia').value) + ' - ' + this.obtenerDepartamentoPorId(this.myGroup.get('departamento').value) + ' - ' + 'Peru'
    }
  }
  obtenerProvinciaPorId(id): string | null {
    const provinica = this.provincias.find(prov => prov.id_prov ===id);
    return provinica ? provinica.PROVINCIA : null;
  } 
  obtenerDepartamentoPorId(id): string | null {
    const departamento = this.departamentos.find(dep => dep.id_depart === parseInt(id));
    return departamento ? departamento.DEPARTAMENTO : null;
  } 
  async listarProvincias(idDepartamento: number) {
    this.provincias = []
    this.distritos = []
    this.provincia.setValue('')
    this.distrito.setValue('')
    if (!idDepartamento) {
      this.provincia.clearValidators()
      this.provincia.updateValueAndValidity()
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    this.provincia.setValidators([Validators.required])
    this.provincia.updateValueAndValidity()
    this.distrito.setValidators([Validators.required])
    this.distrito.updateValueAndValidity()
    this.provincias = await this.configuracionService.Provincia(idDepartamento)
  }
  selectTab(index: number) {
    this.selectedTab = index;
  }
  isPdf(file: any): boolean {
    return file.type === 'application/pdf';
  }
  isDesktopCondition(): boolean {
    const userAgent = navigator.userAgent;
    return !/iPhone|iPad|iPod|Android/i.test(userAgent); // Si no es móvil, es escritorio
  }
  canUseIframeCondition(): boolean {
    try {
      // Solo verificamos si el iframe puede ser insertado, sin crear realmente el iframe.
      return 'contentWindow' in document.createElement('iframe');
    } catch (e) {
      return false;  // Si ocurre un error, retornamos false.
    }
  }
  async onFileVoucher(event: any) {
    let isDesktop = this.isDesktopCondition();
    let canUseIframe = this.canUseIframeCondition();
    this.IframeOr = isDesktop && canUseIframe;
    const files: FileList = event.target.files;
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 20 * 1024 * 1024; // 20 MB
    const newFiles: any[] = [];
    const newFiles2: any[] = [];
    let totalSize = 0;
  
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      if (!validTypes.includes(file.type)) {
        SwalService.error('Advertencia', 'Solo formatos JPEG, PNG o PDF.');
        continue;
      }
      if (file.size > maxSize) {
        SwalService.error('Advertencia', `${file.name} excede el tamaño máximo de 20 MB.`);
        continue;
      }
      totalSize += file.size;
      if (totalSize > maxSize) {
        SwalService.error('Advertencia', `La combinación de archivos excede el tamaño máximo de 20 MB.`);
        break;
      }
      if (newFiles.length >= 3) {
        SwalService.error('Advertencia', `El maximo de archivos enviados son 3`);
        break;
      }
      newFiles2.push(file);  // Almacena el archivo en el arreglo
      newFiles.push({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      });
    
    }
    if (newFiles.length > 0) {
      this.files2 = newFiles2;
      this.files = newFiles;
      this.myGroup.get('archivoadjunto').setValue(newFiles.map(f => f.name).join(', '));
    }
  }
  cerrarModal(){
    this.modalAceptar.hide();
    this.myGroup.get('aceptarterminos').setValue(true)
    if(this.myGroup.get('tipo_compra').value==="Demo"){
      this.goToStep(4)
    }
  }
  isMobile:boolean
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 800; 
  }
  generarMensaje(): string {
    const form=this.myGroup
    if(form.get('tipo_compra').value=="Demo"){
      form.get('licestudiantil').setValue('')
      form.get('licprofesional').setValue('')
      form.get('licempresarial').setValue('')
      form.get('licbim').setValue('')
    }
    let codigo =form.get('codigo')? '      Codigo :' + form.get('codigo').value :''
    let compra = form.get('licbim').value>0? 'Licencia(s) BiM : '+ form.get('licbim').value+'<br/><br/>' :''
    let compra2 = form.get('licestudiantil').value>0? 'Licencia(s) Profesional : '+ form.get('licestudiantil').value+'<br/><br/>' :''
    let compra3 = form.get('licprofesional').value>0? 'Licencia(s) Consultor : '+ form.get('licprofesional').value+'<br/><br/>' :''
    let compra4 = form.get('licempresarial').value>0? 'Licencia(s) Empresarial : '+ form.get('licempresarial').value+'<br/><br/>' :''
    const mensajeHTML = 'Nombre :'+form.get('nombre').value+ '    '  +codigo+'<br/><br/>'+
                        'Correo :'+form.get('correo_electronico').value+'<br/><br/>'+ 
                        'Direccion: '+this.direcciontotal+'<br/><br/>'+ 
                        'Celular: ' +form.get('celular').value+'<br/><br/>'
                        +compra + compra2+compra3+compra4+'<br/><br/>'+ 
                        'Total:' +form.get('total').value
    return mensajeHTML;
  }

   EnviarMensaje() {
    if ((this.myGroup.valid && this.files2.length>0)||(this.myGroup.valid&&this.myGroup.get('tipo_compra').value==="Demo")) {
      grecaptcha.execute('6LeIknwqAAAAAMOLgH5HltFdbp02cjnW3cULAcVq', { action: 'submit' }).then((token) => {
        this.myGroup.patchValue({ captcha: token });
        const dataToSend = {
          asunto: this.myGroup.get('tipo_compra').value,
          mensaje: this.generarMensaje() ,
          captcha: this.myGroup.get('captcha').value
        };
        this.sendEmail(dataToSend,this.files2);
      }).catch(error => {
        console.error('Error al generar el token:', error);
      });
    } else {
      console.log('Formulario inválido');
    }
  }
  async sendEmail(formData: any, files: any[]) {
    this.mostrar_carga_todo=true;
    let resultado= await this.loginservice.sendEmail(formData, files)
    this.mostrar_carga_todo=false;
    if(resultado?.id==1){
      SwalService.success('Exito',resultado.mensaje)
      this.router.navigate(['']);
    }
    else{
      SwalService.error('Advertencia',resultado.mensaje)
    }
  }
  loadReCaptchaScript() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6LeIknwqAAAAAMOLgH5HltFdbp02cjnW3cULAcVq';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

}
