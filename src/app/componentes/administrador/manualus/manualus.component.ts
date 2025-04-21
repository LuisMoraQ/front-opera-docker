import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-manualus',
  templateUrl: './manualus.component.html',
  styleUrls: ['./manualus.component.scss']
})
export class ManualusComponent implements OnInit {
  @ViewChild(PdfViewerComponent) private pdfComponent!: PdfViewerComponent;
  // @ViewChild('iframe') iframe: ElementRef;
  @Input('height') height: number = 200;
  documentopdf=null;
  pdf:any;
  zoom=0.8
  outline=[];
  buscando=false;
  constructor(
    private principalService: PrincipalService
  ) { }

  async ngOnInit() {
    var resto = 167;
    this.height = window.innerHeight - resto;
    await this.descargarDocumento();
  }

  // enviarMensaje(){
  //   const mensaje = { data: 'Hola desde la app principal' };
  //   // Accede al iframe y envía el mensaje
  //   if (this.iframe?.nativeElement?.contentWindow) {
  //     console.log(mensaje)
  //     this.iframe.nativeElement.contentWindow.postMessage(mensaje, '*');
  //   }
  // }
  async descargarDocumento() {
    try {
      this.buscando = true
      const inputDescargar = {
        nombre: 'MANUAL BIPLAN V-01.pdf',
        subc: ''
      }
      const response = await this.principalService.descargarDocumento(inputDescargar)
      if (response.nombre.toString().includes('.pdf')) {
        let pdfbytes = await this._base64ToArrayBuffer(response.archivo)
        this.documentopdf=  pdfbytes;
        this.buscando = false
      }
      else{
        this.buscando=false;
      }
    } catch (e) {
      this.buscando = false
      console.log(e);
      SwalService.error()
    }
  }
  async _base64ToArrayBuffer(base64) {
    var binary_string = base64.replace(/\\n/g, '');
    binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.loadOutline();
  }
  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }
  navigateTo(destination: any) {
    this.pdfComponent.pdfLinkService.goToDestination(destination);
  }
  zoomIn() {
    if (this.zoom > 3) return;
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    if (this.zoom < 0.1) return;
    this.zoom = this.zoom - 0.1;
  }
}
