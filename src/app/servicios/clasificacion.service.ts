import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EncriptadorService } from './encriptador.service';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ClasificacionService {
  enviUrl = '';

  constructor(
    private http: HttpClient,
    public _EncriptadorService: EncriptadorService
  ) {
    this.enviUrl = environment.apiUrl;
  }
  EliminarClasificacion(id_clasificacion: any): any {
    let formData: FormData = new FormData();
    formData.append('id_clasificacion', id_clasificacion);
    const url = this.enviUrl + '/api/proyectos/eliminar/clasificacion';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarClasificacion(params = {}): any {
    // let body: HttpParams = new HttpParams();
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listar/clasificacion';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarClasificacion(descripcion,abr_clasi,observacion,icono:any,activo:any): any {
    let formData: FormData = new FormData();
    formData.append('descripcion', descripcion);
    formData.append('abr_clasi', abr_clasi);
    formData.append('observacion', observacion);
    formData.append('icono', icono);
    formData.append('activo', activo);
    const url = this.enviUrl + '/api/proyectos/guardar/clasificacion';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModificarClasificacion(id_clasificacion,descripcion,abr_clasi,observacion,icono:any,activo:any): any {
    let formData: FormData = new FormData();
    formData.append('id_clasificacion', id_clasificacion);
    formData.append('descripcion', descripcion);
    formData.append('abr_clasi', abr_clasi);
    formData.append('observacion', observacion);
    formData.append('icono', icono);
    formData.append('activo', activo);    
    const url = this.enviUrl + '/api/proyectos/modificar/clasificacion';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  DescargaImgLink(link): any {
    let formData: FormData = new FormData();
    formData.append('link', link);
    const url = this.enviUrl + '/api/especificaciones/descargarImgUrl';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
}