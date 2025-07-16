import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogisticaService {
  enviUrl = '';
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }
  Cargafrmdata(params={}){
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    return formData;
  }
  //adquisiciones,requerimientos,procura
  EliminarAdquisicionProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/logistica/eliminarRegistroAdqui';
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
  ListarAdquisicionesProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/logistica/listarAdqProy';
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
  GuardarAdquisicionProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/logistica/guardarAdquiProy';
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
  ModificarAdquisicion(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/modificarAdquisicion';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarDetallePreasig(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/guardarDetallePreAsig';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarDetallePresasig(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarDetallePreAsig';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarDetPresuAdquiFila(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarDetPresuAdqui';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarDetPresuAdquiSol(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarDetPresuAdquiSol';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarAdquiPresuSol(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/guardarAdquiPresuSol';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ActualizarEstAdqui(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/actualizarEstAdqui';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  listarRelinsAdqui(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarRelinsAdqui';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarAdquiAgruins(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/guardarAdquiAgruins';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarAdquiDisgreins(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/guardarAdquiDisgreins';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarSaldoPresu(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarSaldoPresupuestal';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //movimiento almacen
  GuardarMovalmcobra(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/guardarMovalmcobra';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarMovalmcobra(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/listarMovalmcobra';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EliminarMovalmcobra(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/eliminarMovalmcobra';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  UltNroIngAlmcobra(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/UltNroingresoAlmcobra';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarMovalmcobraDet(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/listarMovalmcobraDet';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarIngresoAmlcobra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/guardarIngresoAmlcobra';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EditarIngresoAmlcobra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/editarIngresoAmlcobra';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EliminarNotaIngAlmcObra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/eliminarNotaIngAlmcObra';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
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
