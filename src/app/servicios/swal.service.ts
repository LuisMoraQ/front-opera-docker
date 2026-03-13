import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';

@Injectable({
  providedIn: 'root'
})
export class SwalService {
  temaColor: string
  constructor(private toastyService: ToastyService) { }

  static error(title: string = 'Error', text: string = 'Hubo un problema al realizar el proceso. Actualice la pagina.') {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      icon: 'error',
      background: color,
      color: letra,
      title: `${title}`,
      text: `${text}`
    })
  }

  static warningBlock(title: string = 'Procesando datos', text: string = 'Espere por favor') {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      title,
      html:
        text + '</br>' +
        '<i class="fa fa-refresh fa-spin fa-5x m-3" style="color: #2D3E63"></i>',
      icon: 'warning',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCancelButton: false,
      background: color,
      color: letra,
    })
  }
  static success(title: string = 'Exito', text: string = 'La operación fue satisfactoria') {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      position: 'center',
      icon: 'success',
      title,
      text: `${text}`,
      showConfirmButton: true,
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Aceptar',
      allowEscapeKey: true,
      background: color,
      color: letra,
    })
  }

  static warning(title: string, text: string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      position: 'center',
      icon: 'warning',
      title,
      html: text,
      // text: `${text}`,
      showConfirmButton: true,
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> OK',
      allowEscapeKey: true,
      background: color,
      color: letra,
    })
  }

  static warningSure(title: string, text: string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      title,
      text: `${text}`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#dc3545',
      allowEscapeKey: false,
      allowOutsideClick: false,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: color,
      color: letra,
    })
  }

  static info(title: string, text: string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      position: 'center',
      icon: 'info',
      title,
      html: text,
      // text: `${text}`,
      showConfirmButton: true,
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> OK',
      allowEscapeKey: true,
      background: color,
      color: letra,
    })
  }

  static confirm(title: string, text: string, html?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-sm btn-success',
        cancelButton: 'btn btn-sm btn-danger mr-1'
      },
      buttonsStyling: false
    })
    return swalWithBootstrapButtons.fire({
      title: `${title}`,
      text: `${text}`,
      icon: 'question',
      reverseButtons: true,
      showCancelButton: true,
      focusConfirm: false,
      focusCancel: false,
      focusDeny: false,
      confirmButtonText: `<i class="fa fa-floppy-o mr-2"></i> Si, de acuerdo!`,
      cancelButtonText: `<i class="fa fa-times-circle mr-2"></i> No, cancelar`,
      html: html,
      background: color,
      color: letra,
    })
  }

  static input(title: string, value?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    // return
    return Swal.fire({
      title,
      input: 'text',
      background: color,
      color: letra,
      inputAttributes: {
        autocapitalize: 'off'
      },
      inputValue: value,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Ok!',
      showLoaderOnConfirm: true,
      preConfirm: (value) => {
        return value
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
  }
  static async input2(title: string, value?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    
    const { value: inputValue } = await Swal.fire({
      title,
      input: 'text',
      background: color,
      color: letra,
      inputAttributes: {
        autocapitalize: 'off',
        readonly: 'readonly', // Hacer el input de solo lectura (opcional)
      },
      inputValue: value,
      showCancelButton: false,
      confirmButtonText: 'Copiar código',
      showLoaderOnConfirm: false,
      preConfirm: async () => {
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch (err) {
          Swal.showValidationMessage('Error al copiar: ' + err);
          return false;
        }
      },
      allowOutsideClick: true
    });

    // Mostrar mensaje de éxito
    if (inputValue) {
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'El código ha sido copiado al portapapeles',
        background: color,
        color: letra,
        timer: 1500,
        showConfirmButton: false
      });
    }
    
    return inputValue;
  }

  static inputNumber(title: string = 'OBSERVACIÓN',okbuttom:string='Ok') {
    return Swal.fire({
      title,
      input: 'number',
      inputAttributes: {
        autocapitalize: 'off'
      },
      allowOutsideClick: false,
      showCancelButton: true,
      cancelButtonText:'Cancelar',
      confirmButtonText: okbuttom,
      showLoaderOnConfirm: true,
      preConfirm: (value) => {
        if (value.length > 0) {
          return value
        } else {
          Swal.showValidationMessage(
            title+`es un campo obligatorio`
          )
        }
      }
    })
  }

  static informative(title: string, text: string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    const colorTema = localStorage.getItem('configtema').split('|')
    if (colorTema[0] == 'dark') {
      color = '#4c626d'
      letra = '#ffff'
    }
    return Swal.fire({
      position: 'center',
      icon: 'success',
      title,
      html: text,
      background: color,
      color: letra,
      text: `${text}`,
      showConfirmButton: true,
      // timer: 5000
    })
  }

  static multiple(title: string, text: string, html?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      title: title,
      text: `${text}`,
      showCancelButton: true,
      confirmButtonText: 'Desplazar',
      cancelButtonText: 'Cancelar',
    })
  }

  static multiple2(title: string, text: string, btnConfirm,btnCancel,html?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    return Swal.fire({
      title: title,
      text: `${text}`,
      showCancelButton: true,
      confirmButtonText: btnConfirm,
      cancelButtonText: btnCancel,
    })
  }


  static select(title: string = 'OBSERVACIÓN', options) {

    return Swal.fire({
      title: title,
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Seleccione una opcion',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve()
          } else {
            resolve('Seleccione una opcion)')
          }
        })
      }
    })
  }

  static async optionokcancel(options:any, titulo = 'Pegar Filas', inicial = null){
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    const {value:opcion}=await Swal.fire({
      background: color,
      color: letra,
      title: titulo,
      input: 'select',
      inputValue: inicial, 
      inputOptions: options,
      showCancelButton: true,
      confirmButtonText: 'Pegar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (value == '') {
          return 'Seleccione una opcion.'
        }
      }
    })
    return opcion;
  }

  static option3(title: string, text: string,boton1:string,boton2:string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    const colorTema = localStorage.getItem('configtema').split('|')
    if (colorTema[0] == 'dark') {
      color = '#4c626d'
      letra = '#ffff'
    }
    return Swal.fire({
      title: title,
      text: text,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: boton1,
      denyButtonText: boton2,
    })
  }
  static option3Check(title: string, text: string,boton1:string,boton2:string) {
    let color = '#f3f3f3'
    let letra = '#545454'
    const colorTema = localStorage.getItem('configtema').split('|')
    if (colorTema[0] == 'dark') {
      color = '#4c626d'
      letra = '#ffff'
    }
    return Swal.fire({
      title: title,
      text: text,
      input: "checkbox",
      inputPlaceholder: 'Estoy de acuerdo con las condiciones.',
      inputValue:0,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: boton1,
      denyButtonText: boton2,
      confirmButtonColor: "#dc3741",
      denyButtonColor:"#7066e0",
      inputValidator: (result) => {
        return !result && "Tiene que estar de acuerdo para continuar.";
      }
    })
  }
  static confirmCheck(title: string, text: string, html?) {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-sm btn-success',
        cancelButton: 'btn btn-sm btn-danger mr-1'
      },
      buttonsStyling: false
    })
    return swalWithBootstrapButtons.fire({
      title: `${title}`,
      text: `${text}`,
      input: "checkbox",
      inputPlaceholder: 'Estoy de acuerdo con las condiciones.',
      inputValue:0,
      icon: 'question',
      reverseButtons: true,
      showCancelButton: true,
      focusConfirm: false,
      focusCancel: false,
      focusDeny: false,
      confirmButtonText: `<i class="fa fa-floppy-o mr-2"></i> Si, de acuerdo!`,
      cancelButtonText: `<i class="fa fa-times-circle mr-2"></i> No, cancelar`,
      html: html,
      background: color,
      color: letra,
      inputValidator: (result) => {
        return !result && "Tiene que estar de acuerdo para continuar.";
      }
    })
  }

  static confirmCheck2(title: string, text: string, html?, textocheck = 'Estoy de acuerdo con las condiciones.') {
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-sm btn-success',
        cancelButton: 'btn btn-sm btn-danger mr-1'
      },
      buttonsStyling: false
    })
    return swalWithBootstrapButtons.fire({
      title: `${title}`,
      text: `${text}`,
      input: "checkbox",
      inputPlaceholder: `${textocheck}`,
      inputValue:0,
      icon: 'question',
      reverseButtons: true,
      showCancelButton: true,
      focusConfirm: false,
      focusCancel: false,
      focusDeny: false,
      confirmButtonText: `<i class="fa fa-floppy-o mr-2"></i> Si, de acuerdo!`,
      cancelButtonText: `<i class="fa fa-times-circle mr-2"></i> No, cancelar`,
      html: html,
      background: color,
      color: letra,
      // inputValidator: (result) => {
      //   return !result && "Tiene que estar de acuerdo para continuar.";
      // }
    })
  }
  static showTable(title: string, htmlContent: string): void {
    Swal.fire({
      title: title,
      html: htmlContent,
      width: 800,
    })
  }
  static showTables2(array:any){
    let index=0
    const mostrarAlertaSiguiente = () => {
      if (index < array.length) {
        Swal.fire({
          title: 'En la partida: ' + array[index].partida + ' tiene una tabla de formato incorrecto. Se sugiere volver a copiarla o eliminarla.',
          html: array[index].table,
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'Siguiente', 
          width: 800,
        }).then(() => {
          index++
          mostrarAlertaSiguiente()
        })
      }
    }
    mostrarAlertaSiguiente()
  }
  
  static showTable2(atitle: string,aicon:any, htmlContent: string): void {
    Swal.fire({
      title: atitle,
      icon: aicon==0?'success':aicon==1?'error':'info',
      html: htmlContent,
      width: 630,
    })
  }

  static closeAlert() {
    Swal.close()
  }

  static getSwalTitle() {
    return Swal.getTitle()
  }

  static confirmDate(title: string, text: string, html?,fechamin=null) {//fechamin yyyy-MM-dd
    let color = '#f3f3f3'
    let letra = '#545454'
    let configsuser = localStorage.getItem('configtema');
    if (configsuser) {
      const colorTema = configsuser.split('|')
      if (colorTema[0] == 'dark') {
        color = '#4c626d'
        letra = '#ffff'
      }
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-sm btn-success',
        cancelButton: 'btn btn-sm btn-danger mr-1',
        input:'inpdate-swal'
      },
      buttonsStyling: false
    })
    return swalWithBootstrapButtons.fire({
      title: `${title}`,
      text: `${text}`,
      icon: 'question',
      reverseButtons: true,
      showCancelButton: true,
      focusConfirm: false,
      focusCancel: false,
      focusDeny: false,
      input:"date",
      didOpen: () => {
        const today = (new Date()).toISOString();
        Swal.getInput().value = today.split("T")[0];
        Swal.getInput().min = fechamin;
      },
      confirmButtonText: `<i class="fa fa-floppy-o mr-2"></i> Si, de acuerdo!`,
      cancelButtonText: `<i class="fa fa-times-circle mr-2"></i> No, cancelar`,
      html: html,
      background: color,
      color: letra,
      allowEnterKey: false,
    })
  }
}
