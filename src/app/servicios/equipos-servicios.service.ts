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

  actualizarEstadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/actualizarEstadoEquipo';
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

  guardarDesagregadoEquipo(params: any = {}): Promise<any> {
    const url = this.enviUrl + '/api/equiposservicios/guardarDesagregadoEquipo';

    // Enviar 'params' directamente como objeto JSON en lugar de FormData
    return this.http.post<any>(url, params).pipe(
      map(res => {
        if (!res) {
          throw new Error('Respuesta vacía');
        }
        return res;
      }),
      catchError(err => throwError(() => err))
    ).toPromise();
  }

  actualizarDesagregadoEquipo(params: any = {}): Promise<any> {
    const url = this.enviUrl + '/api/equiposservicios/actualizarDesagregadoEquipo';

    // Enviar el objeto JSON directo (sin FormData)
    return this.http.post<any>(url, params).pipe(
      map(res => {
        if (!res) {
          throw new Error('Respuesta vacía');
        }
        return res;
      }),
      catchError(err => throwError(() => err))
    ).toPromise();
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

  listadoDesagregadoEquipo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const url = this.enviUrl + '/api/equiposservicios/listadoDesagregadoEquipo';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) throw new Error();
        return res;
      }),
      catchError(err => throwError(err))
    ).toPromise();
  }

  guardarMovimientoSaldo(datos: any): Promise<any> {
    const formData = new FormData();

    formData.append('accion', datos.accion || '');
    formData.append('id_reg', (datos.id_reg ?? 0).toString());
    formData.append('indice', (datos.indice ?? 0).toString());
    formData.append('tipo', (datos.tipo ?? 2).toString());
    formData.append('fecha', datos.fecha || '');
    formData.append('monto_registro', (datos.monto_registro ?? 0).toString());

    // Campos para Tipo 2
    formData.append('id_equipo', (datos.id_equipo ?? 0).toString());
    formData.append('id_desagregado', (datos.id_desagregado ?? 0).toString());

    // Campos para Tipo 3
    formData.append('idregmov', (datos.idregmov ?? 0).toString());
    formData.append('nrosalida', (datos.nrosalida ?? 0).toString());
    formData.append('idsalida', (datos.idsalida ?? 0).toString());
    formData.append('indrep', (datos.indrep ?? 0).toString());
    formData.append('id_registro', (datos.id_registro ?? 0).toString());

    formData.append('id_proyecto', (datos.id_proyecto ?? 0).toString());

    const url = `${this.enviUrl}/api/equiposservicios/guardarMovimientoSaldo`;

    return this.http.post<any>(url, formData).pipe(
      map(res => res),
      catchError(err => {
        console.error('Error al procesar el saldo:', err);
        return throwError(err);
      })
    ).toPromise();
  }

  listarRegistroMontoActividades(obj: { indice: number; fecha: string, id_proyecto: number }): Promise<any> {
    const formData = new FormData();
    formData.append('indice', (obj.indice || 0).toString());
    formData.append('fecha', obj.fecha || '');
    formData.append('id_proyecto', (obj.id_proyecto || 0).toString());
    const url = `${this.enviUrl}/api/equiposservicios/listarRegistroMontoActividades`;

    return this.http.post<any>(url, formData).pipe(
      map(res => res),
      catchError(err => {
        console.error('Error al listar montos de actividades:', err);
        return throwError(err);
      })
    ).toPromise();
  }

  listarAcuePartida(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const url = this.enviUrl + '/api/equiposservicios/listarAcuePartida';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) throw new Error();
        return res;
      }),
      catchError(err => throwError(err))
    ).toPromise();
  }

  listarAcuePartidaAnteriores(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const url = this.enviUrl + '/api/equiposservicios/listarAcuePartidaAnteriores';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) throw new Error();
        return res;
      }),
      catchError(err => throwError(err))
    ).toPromise();
  }
}
