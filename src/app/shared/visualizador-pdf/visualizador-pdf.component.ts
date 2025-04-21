import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit,SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-visualizador-pdf',
  templateUrl: './visualizador-pdf.component.html',
  styleUrls: ['./visualizador-pdf.component.scss']
})
export class VisualizadorPdfComponent implements OnInit,OnChanges {

  @Input() urlReport
  fullUrl
  zoom: number = 0.8;
  totalPages: number;
  page: number = 1;
  isLoaded: boolean = false;
  constructor(private modal: NgbActiveModal) {
  }

  async ngOnInit() {
    // console.log('this.urlReport', this.urlReport);
    
    // this.fullUrl = await this._base64ToArrayBuffer(this.urlReport)
    this.fullUrl = await this.urlReport
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
  zoomIn() {
    if (this.zoom > 4) return;
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    if (this.zoom < 0.1) return;
    this.zoom = this.zoom - 0.1;
  }
  dismissModal(reason: any = null) {
    this.modal.dismiss(reason)
  }

  nextPage() {
    this.page += 1;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['urlReport']) {
      
      if (this.urlReport) {
        // console.log('a', this.urlReport);
        this.fullUrl = this.urlReport
       
      }
    }
  }


  previousPage() {
    this.page -= 1;
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }

}


