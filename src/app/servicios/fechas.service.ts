import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone'
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EncriptadorService } from './encriptador.service';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FechasService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    })
  meses = [
    { id: 1, nombre: 'ENERO' },
    { id: 2, nombre: 'FEBRERO' },
    { id: 3, nombre: 'MARZO' },
    { id: 4, nombre: 'ABRIL' },
    { id: 5, nombre: 'MAYO' },
    { id: 6, nombre: 'JUNIO' },
    { id: 7, nombre: 'JULIO' },
    { id: 8, nombre: 'AGOSTO' },
    { id: 9, nombre: 'SEPTIEMBRE' },
    { id: 10, nombre: 'OCTUBRE' },
    { id: 11, nombre: 'NOVIEMBRE' },
    { id: 12, nombre: 'DICIEMBRE' }
  ]
  constructor(private http: HttpClient, public _EncriptadorService: EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }

  dateShort(date): string {
    return moment(date).format('YYYY-MM-DD')
  }

  dateTime(date): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }

  formatToISO(date) {
    return moment(date).format('YYYY-MM-DD[T]HH:mm:ss')
  }

  fechaServidor(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/fechaActual';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res) {
        //   throw new Error
        // }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
}
