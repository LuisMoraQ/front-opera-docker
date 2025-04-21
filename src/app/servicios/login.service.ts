import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {EncriptadorService} from './encriptador.service';
import { BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators'
import { throwError} from 'rxjs'
/* import { resolve } from 'dns'; */


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  enviUrl = '';
  token = '';
  constructor(private http: HttpClient,
    private _EncriptadorService:EncriptadorService
    ) {
    this.enviUrl = environment.apiUrl;
  }
   private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  getIdUser(): any {
    let usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    if(usuario!=undefined){
      let body: HttpParams = new HttpParams();
      body = body.append('usuario',usuario);
      const url = this.enviUrl + '/api/consulta/consultarusuario';
      return this.http.post<any[]>(url,body)
    }
    else{
      // return new Promise( resolve => resolve(true))
      let body: HttpParams = new HttpParams();
      body = body.append('usuario','0');
      const url = this.enviUrl + '/api/consulta/consultarusuario';
      return this.http.post<any[]>(url,body)
    }
  }
  loginUsuario(usuario:any, clave:any){
    const body = JSON.stringify(
      { 'Username':usuario,
        'Password':clave
      });
    const httpHeaders  = new HttpHeaders(
      {
        'Content-Type':'application/json',
      });
    const url = this.enviUrl + '/api/Users/authenticate';
    return this.http.post<any[]>(url, body,{headers: httpHeaders} );
  }
  LogoutSis(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/Users/Logout';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ForzarSes(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/Users/forzaSesion';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  lateral(usuario:any){
    let body: HttpParams = new HttpParams();
    body = body.append('usuario',usuario);
    const url = this.enviUrl + '/api/consulta/lateral';
    return this.http.post<any[]>(url,body)
  }
  ActuEstUser(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/Users/actEstadoUser';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  sendEmail(formData: any, files: any[]){
    const formDataToSend = new FormData();
    formDataToSend.append('asunto', formData.asunto);
    formDataToSend.append('mensaje', formData.mensaje);
    formDataToSend.append('captcha', formData.captcha);
    files.forEach((file: File, index: number) => {
      formDataToSend.append('files', file, file.name); 
    });
    const url = this.enviUrl + '/api/Users/enviaConsulta';
    return this.http.post<any>(url, formDataToSend).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
    // Enviar el FormData con la solicitud POST (esto manejará automáticamente multipart/form-data)
    // return this.http.post(this.apiUrl, formDataToSend);
  }
}
