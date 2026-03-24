import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquiposServiciosService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    });
  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }

  guardarEquiposServicio(equipos: any[]): Promise<any> {
    const formData = new FormData();
    formData.append('equipos', JSON.stringify(equipos));

    console.log('Enviando equipos:', JSON.stringify(equipos));

    const url = this.enviUrl + '/api/equiposservicios/guardarEquiposServicio';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error('No se recibió respuesta del servidor');
        }
        return res;
      }),
      catchError(err => {
        console.error('Error en guardarEquiposServicio:', err);
        return throwError(err);
      })
    ).toPromise();
  }


  listarEquipoServicio(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/listarEquipoServicio';
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

  obtenerCalendarioProyecto(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/obtenerCalendarioProyecto';
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

  guardarDesagregadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/guardarDesagregadoEquipo';
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

  actualizarDesagregadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/actualizarDesagregadoEquipo';
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

  eliminarDesagregadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/eliminarDesagregadoEquipo';
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

  listarDesagregadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/listarDesagregadoEquipo';
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

  actualizarEliminarEquiposServicio(payload: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    const url = this.enviUrl + '/api/equiposservicios/actualizarEliminarEquiposServicio';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        console.log('Respuesta del servidor:', res);
        return res;
      }),
      catchError(err => {
        console.error('Error en actualizarEliminarEquiposServicio:', err);
        return throwError(err);
      })
    ).toPromise();
  }


  recuperarProveedor(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/recuperarProveedor';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        console.log('res', res)
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

    listarAgrupamientoRequerimientos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    const url = this.enviUrl + '/api/equiposservicios/listarAgrupamientoRequerimientos';
    
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error('No se recibieron datos');
        }
        
        // La respuesta tendrá dos arrays
        console.log('res', res)
        const datosPrincipales = res[0];  // Primer SELECT
        const datosDesagregados = res[1]; // Segundo SELECT
        
        // Puedes estructurar la respuesta como prefieras
        return {
          agrupacion: datosPrincipales,
          desagregados: datosDesagregados,
          // O si necesitas combinarlos de alguna manera específica
          // combinado: datosPrincipales.map(principal => ({
          //   ...principal,
          //   detalles: datosDesagregados.filter(d => 
          //     d.idgrupo === principal.idgrupo && 
          //     d.idfila === principal.idfila
          //   )
          // }))
        };
      }),
      catchError(err => {
        console.error('Error en la petición:', err);
        return throwError(err);
      })
    ).toPromise();
  }
}
