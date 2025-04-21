import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormControl, UntypedFormGroup,Validators  } from '@angular/forms'
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/servicios/login.service';
import { SwalService } from 'src/app/servicios/swal.service';
declare var grecaptcha: any
@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.scss']
})
export class ContactosComponent implements OnInit {
  mostrar_carga_todo=false;
  safeUrl: any;
  menuActive = false;
  constructor(private sanitizer: DomSanitizer,private http: HttpClient, private loginservice: LoginService,) {}
  setSafeUrl(url: string) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  }
  ngOnInit(): void {
    this.loadReCaptchaScript();
    this.paisControl.valueChanges.subscribe(value => {
      this.filteredPaises = this.filtrarPaises(value);
      this.seleccion = this.filteredPaises.length ? this.seleccion : null;
    });
  }
  loadReCaptchaScript() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6LeIknwqAAAAAMOLgH5HltFdbp02cjnW3cULAcVq';
    script.async = true;
    script.defer = true;
    // script.onload = () => console.log('Script de reCAPTCHA cargado');
    document.body.appendChild(script);
  }
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
  formularioContacto = new UntypedFormGroup({
    nombre:new UntypedFormControl('',[Validators.required]),
    correo_electronico:new UntypedFormControl('', [Validators.required, Validators.email]),
    celular: new UntypedFormControl('', [
      Validators.required,                   
      Validators.pattern('^\\+?[0-9\\s]*$'),          
      Validators.minLength(9),               
      Validators.maxLength(18)              
    ]),
    pais:new UntypedFormControl('',[Validators.required]),
    asunto:new UntypedFormControl('',[Validators.required]),
    mensaje:new UntypedFormControl('',[Validators.required]),
    captcha: new UntypedFormControl(''),
  })
  get celular() {
    return this.formularioContacto.get('celular');
  }
  paises = [
    { nombre: "Argentina", codigo: "+54", bandera: "https://flagcdn.com/ar.svg" },
    { nombre: "Belice", codigo: "+501", bandera: "https://flagcdn.com/bz.svg" },
    { nombre: "Bolivia", codigo: "+591", bandera: "https://flagcdn.com/bo.svg" },
    { nombre: "Canada", codigo: "+1", bandera: "https://flagcdn.com/ca.svg" },
    { nombre: "Chile", codigo: "+56", bandera: "https://flagcdn.com/cl.svg" },
    { nombre: "Colombia", codigo: "+57", bandera: "https://flagcdn.com/co.svg" },
    { nombre: "Costa Rica", codigo: "+506", bandera: "https://flagcdn.com/cr.svg" },
    { nombre: "Ecuador", codigo: "+593", bandera: "https://flagcdn.com/ec.svg" },
    { nombre: "El Salvador", codigo: "+503", bandera: "https://flagcdn.com/sv.svg" },
    { nombre: "España", codigo: "+34", bandera: "https://flagcdn.com/es.svg" },
    { nombre: "Estados Unidos", codigo: "+1", bandera: "https://flagcdn.com/us.svg" },
    { nombre: "Guatemala", codigo: "+502", bandera: "https://flagcdn.com/gt.svg" },
    { nombre: "Honduras", codigo: "+504", bandera: "https://flagcdn.com/hn.svg" },
    { nombre: "Mexico", codigo: "+52", bandera: "https://flagcdn.com/mx.svg" },
    { nombre: "Nicaragua", codigo: "+505", bandera: "https://flagcdn.com/ni.svg" },
    { nombre: "Panama", codigo: "+507", bandera: "https://flagcdn.com/pa.svg" },
    { nombre: "Paraguay", codigo: "+595", bandera: "https://flagcdn.com/py.svg" },
    { nombre: "Peru", codigo: "+51", bandera: "https://flagcdn.com/pe.svg" },
    { nombre: "Uruguay", codigo: "+598", bandera: "https://flagcdn.com/uy.svg" },
    { nombre: "Venezuela", codigo: "+58", bandera: "https://flagcdn.com/ve.svg" },
  ];
  paisControl = new UntypedFormControl();
  filteredPaises: any[] = [];
  seleccion: any | null = null;
  filtrarPaises(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
  }
  onSelectPais(pais: any): void {
    this.seleccion = pais;
    this.paisControl.setValue(pais.nombre);
    this.formularioContacto.get('pais').setValue(pais.nombre);
    this.formularioContacto.get('celular').setValue(pais.codigo + ' ');
    this.filteredPaises = [];
  }
  onInputBlur(): void {
    const paisIngresado = this.paisControl.value;
    if (paisIngresado && !this.filteredPaises.some(p => p.nombre === paisIngresado)) {
      this.formularioContacto.get('pais').setValue(paisIngresado);
      // this.seleccion = null; 
    }
  }
  generarMensaje(): string {
    const { nombre, correo_electronico, celular, pais, mensaje } = this.formularioContacto.value;
    const mensajeHTML = `Buen día soy :, <b>${nombre}</b>.<br/><br/>Correo: ${correo_electronico}<br/><br/>Teléfono: ${celular}<br/>País: ${pais}<br/><br/><b>Mensaje:</b><br/> ${mensaje}<br/><br/>`;
    return mensajeHTML;
  }
  files=[]
  EnviarMensaje() {
    // console.log('Estado del formulario antes de generar captcha:', this.formularioContacto.value);
    if (this.formularioContacto.valid) {
      grecaptcha.execute('6LeIknwqAAAAAMOLgH5HltFdbp02cjnW3cULAcVq', { action: 'submit' }).then((token) => {
        this.formularioContacto.patchValue({ captcha: token });
        // console.log('Token generado:', token); // Verifica el valor del token
        // console.log('Captcha asignado:', this.formularioContacto.get('captcha').value);
        const dataToSend = {
          asunto: this.formularioContacto.get('asunto').value,
          mensaje: this.generarMensaje(),
          captcha: this.formularioContacto.get('captcha').value
        };
        this.sendEmail(dataToSend,this.files);
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
      this.formularioContacto.reset(); 
      // Object.keys(this.formularioContacto.controls).forEach(controlName => {
      //   const control = this.formularioContacto.get(controlName);
      //   if (control) {
      //     control.markAsPristine(); 
      //     control.markAsUntouched(); 
      //   }
      // });
      this.seleccion = null; 
    }
    else{
      SwalService.error('Advertencia',resultado.mensaje)
    }
  }
}
