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
  GuardarIngresoAlmcobra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/guardarIngresoAlmcobra';
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
  UltNroSalAlmcobra(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/UltNrosalidaAlmcobra';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EliminarNotaSalAlmcObra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/eliminarNotaSalAlmcObra';
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
  GuardarSalidaAlmcobra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/guardarSalidaAlmcobra';
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
  EditarSalidaAlmcobra(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/almacen/editarSalidaAlmcobra';
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
  ActEstadoMovAlmcReg(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/almacen/actEstMovalmcRegistro';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //proveedores
  ListarProveedores(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listar/proveedor';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarProveedor(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/guardar/proveedor';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModificarProveedor(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/modificar/proveedor';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EliminarProveedor(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/eliminar/proveedor';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarAgruadquisol(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listar/agruadquisol';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  AdquisolAsignaProv(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/adquiasignaProv';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  AdquisolEliminaProv(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/adquiEliminaProv';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  adquiCambiarPreseleccion(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/adquiCambiarPresel';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  AdquisolEnviarSol(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/enviarSolicitud';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarInsDisgregaCoti(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/logistica/listarInsdisgreCoti';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarRespuestaSoli(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/guardarRespuestaSol';
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
  AprobarCotizacion(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/aprobarCotizacion';
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
  DesAprobarCotizacion(params = {}):any//ejemplo con json
  {
    const url = this.enviUrl + '/api/logistica/desaprobarCotizacion';
    return this.http.post<any>(url, this.Cargafrmdata(params)).pipe(
      map(res => {
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
}
