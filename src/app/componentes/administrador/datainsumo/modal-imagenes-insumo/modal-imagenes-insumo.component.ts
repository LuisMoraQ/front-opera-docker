import { map } from 'rxjs/operators';
import { SwalService } from 'src/app/servicios/swal.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { data } from 'jquery';
export interface archivoimg {
  nombre: any;
  base: any;
}
@Component({
  selector: 'app-modal-imagenes-insumo',
  templateUrl: './modal-imagenes-insumo.component.html',
  styleUrls: ['./modal-imagenes-insumo.component.scss']
})
export class ModalImagenesInsumoComponent implements OnInit {
  @Input() datosInsumo: any
  @Input() nrofotossel: any
  active = 1;
  mostrar_carga_todo = false
  dataarchivossel = [];
  dataestadoarchsel = [];
  dataarchb64 = [];
  dataarchver = [];
  verguardararch = false;
  guardandoimg: boolean = false;
  stringImagenes: any;
  cargarTablaInsumo: boolean = false
  constructor(private modal: NgbActiveModal,
    private sanitizer: DomSanitizer,
    private configuracionService: ConfiguracionService,
    private toaster: ToastrService,) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      await this.recuperarImagenes(this.datosInsumo?.imagen)
      this.mostrar_carga_todo = false
    } catch {
      SwalService.error()
    }
  }


  async recuperarImagenes(stringImagen) {
    try {
      if (stringImagen) {
        this.stringImagenes = stringImagen
        const nombresImagenes = {
          imagen: stringImagen ? stringImagen : ''
        }
        const response = await this.configuracionService.descargarArrayImagenesInsumo(nombresImagenes)
        if (response) {
          this.dataarchver = []
          response.map(data => {
            let fagre: archivoimg;
            if(data.archivo){
              let objectURL = 'data:image/png;base64,' + data.archivo;
              fagre = { nombre: data.nombre, base: this.sanitizer.bypassSecurityTrustUrl(objectURL) };
            }
            else{
              fagre = { nombre: data.nombre, base: data.nombre };
            }
            this.dataarchver.push(fagre);
          })
        }
      } else {
        this.dataarchver = []
        this.stringImagenes = ''
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }

  async almacenarImagenes() {
    try {
      this.mostrar_carga_todo = true
      await this.dataarchivossel.reduce(async (a, archivo, currentIndex) => {
        // Wait for the previous item to finish processing
        await a;
        const inputImagen = {
          id_insumo: this.datosInsumo.id_insumo,
          ind: currentIndex,
          archivo: archivo
        }
        const response = await this.guardarImagen(inputImagen)
        if (currentIndex == this.dataarchivossel.length - 1) {
          this.dataarchivossel = []
          this.dataestadoarchsel = [];
          this.dataarchb64 = [];
          await this.recuperarImagenes(response.imagen)
          this.cargarTablaInsumo = true
          this.mostrar_carga_todo = false
          this.toaster.success('Las imagenes se guardaron correctamente.', 'Correcto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          this.active = 1
        }
      }, Promise.resolve());
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error
    }
  }

  async guardarImagen(inputImagen) {
    const respuesta = await this.configuracionService.guardarImagenInsumo(inputImagen)
    return respuesta
  }

  SubirArchivo() {
    if (this.dataarchver.length < 5) {
      const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
      fileUpload.onchange = () => {
        let falta = 5 - this.nrofotossel;
        let longmayor = fileUpload.files.length > falta ? falta : fileUpload.files.length;
        for (let index = 0; index < longmayor; index++) {
          const file = fileUpload.files[index];
          this.dataarchivossel.push(file);
          this.dataestadoarchsel.push(false);
          this.extraerBase64(file).then((imagen: any) => {
            let fagre: archivoimg;
            fagre = { nombre: file.name, base: imagen.base };
            this.dataarchb64.push(fagre);
          });
          if (this.dataarchivossel.length > 0) {
            this.verguardararch = true;
          }
        }
        if (fileUpload.files.length > falta) {
          this.toaster.warning('Solo se pueden subir ' + falta + ' imagenes.', 'Incorrecto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
        }
      }
      fileUpload.click();
    }
    else {
      this.toaster.warning('No se puede subir mas de 5 imagenes.', 'Incorrecto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return false
    }
  }

  async EliminarImagen1(ind: any) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la imagen seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        let arch = this.dataarchver[ind];
        const inputEliminarInsumo = {
          id_insumo: this.datosInsumo.id_insumo,
          archivo: arch.nombre,
          grupo: this.stringImagenes
        }
        const response = await this.configuracionService.eliminarImagenInsumo(inputEliminarInsumo)
        if (response[0].id) {
          this.nrofotossel = this.nrofotossel - 1;
          this.stringImagenes = response[0].imagen
          this.dataarchver.splice(ind, 1)
          this.cargarTablaInsumo = true
          this.mostrar_carga_todo = false
          SwalService.success()
        }

      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeimg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeimg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        })
      };
    }
    catch (e) {
      return null;
    }
  });

  QuitarImagenSubir(ind: any) {
    this.dataarchivossel.splice(ind, 1);
    this.dataestadoarchsel.splice(ind, 1);
    this.dataarchb64.splice(ind, 1);
    if (this.dataarchivossel.length > 0) {
      this.verguardararch = true;
    }
    else {
      this.verguardararch = false;
    }
  }

  async closeModal(result: any = null) {
    this.modal.close(this.cargarTablaInsumo)
  }

}
