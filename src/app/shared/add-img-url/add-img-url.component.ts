import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';

@Component({
  selector: 'app-add-img-url',
  templateUrl: './add-img-url.component.html',
  styleUrls: ['./add-img-url.component.scss']
})
export class AddImgUrlComponent implements OnInit {
  //imagenes drive
  fromdrive1=1;
  imagenInvalida=false;
  urlimagen=''
  idimagen=''
  iddrive='';
  mostrar_carga_todo=false;
  constructor(
    private toaster: ToastrService,
    private modal: NgbActiveModal,
    private clasiservice:ClasificacionService
  ) { }

  ngOnInit(): void {
  }
  cerrImgDrive(){
    this.urlimagen=''
    this.idimagen=''
    this.fromdrive1=1
    this.imagenInvalida=false;
    //this.modalImgDrive.hide();
    this.modal.close()
  }
  async guardaImgDrive(){
    if(!this.imagenInvalida){
      if(this.urlimagen.substring(0,4)!="http"){
        this.toaster.warning('El texto ingresado no es una url, debe empezar con http o https', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        return;
      }
      this.mostrar_carga_todo=true
      let directLink='';
      if(this.fromdrive1==2){
        directLink = 'https://drive.google.com/uc?export=view&id='+this.iddrive; // Enlace directo
      }
      else{
        directLink=this.urlimagen;
      }
      let resp=await this.clasiservice.DescargaImgLink(directLink)//usar backend
      this.mostrar_carga_todo=false
      if(resp?.id=='1' && resp?.mensaje!=''){
        this.modal.close(resp.mensaje)
      }
      else{
        this.toaster.warning('No se pudo cargar la imagen.', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    else{
      this.toaster.warning('La url de la imagen no se puede cargar. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  cambFromDrive(){
    this.urlimagen=''
    if(this.fromdrive1!=1 && this.idimagen!=''){
      this.agregaID()
    }
  }
  agregaID(){
    this.imagenInvalida = false;
    this.urlimagen='';
    this.iddrive=''
    if(this.fromdrive1==2){
      if(this.idimagen.includes('https://drive.google')){
        let recoverid=''
        const regex = /\/d\/(.+?)\/view/;
        const match = this.idimagen.match(regex);
        if (match && match[1]) {
            recoverid = match[1];
        }
        this.iddrive=recoverid
        this.urlimagen='https://drive.google.com/thumbnail?sz=w1000&id='+recoverid
      }
      else{
        this.toaster.warning('La url de la imagen no corresponde a Google Drive. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        this.urlimagen=''
      }
    }
    else if(this.fromdrive1==3){
      if(this.idimagen.includes('https://www.dropbox')){
        this.urlimagen=this.idimagen.replace("&dl=0","&raw=1")
      }
      else{
        this.toaster.warning('La url de la imagen no corresponde a Dropbox. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        this.urlimagen=''
      }
    }
  }
}
