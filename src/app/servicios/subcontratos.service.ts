import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcontratosService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    });
  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }

  guardarSubcontrato(subcontratos: any[]): Promise<any> {
    const formData = new FormData();
    formData.append('subcontratos', JSON.stringify(subcontratos));

    const url = this.enviUrl + '/api/subcontratos/guardarSubcontrato';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error('No se recibió respuesta del servidor');
        }
        return res;
      }),
      catchError(err => {
        console.error('Error en guardarSubcontrato:', err);
        return throwError(err);
      })
    ).toPromise();
  }

  listarSubcontratos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/subcontratos/listarSubcontratos';
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


  listarDesagregadosSubcontratos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/subcontratos/listarDesagregadosSubcontratos';
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

  actualizarEliminarSubcontratos(payload: any): Promise<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    const url = this.enviUrl + '/api/subcontratos/actualizarEliminarSubcontratos';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        return res;
      }),
      catchError(err => {
        console.error('Error en actualizarEliminarSubcontratos:', err);
        return throwError(err);
      })
    ).toPromise();
  }


  actualizarEstadoSubcontrato(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/subcontratos/actualizarEstadoSubcontrato';
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


  actualizarDesagregadoSubcontrato(params: any = {}): Promise<any> {
    const url = this.enviUrl + '/api/subcontratos/actualizarDesagregadoSubcontrato';

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


  guardarDesagregadoSubcontrato(params: any = {}): Promise<any> {
    const url = this.enviUrl + '/api/subcontratos/guardarDesagregadoSubcontrato';

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

  eliminarDesagregadoSubcontrato(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/subcontratos/eliminarDesagregadoSubcontrato';
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

  listadoDesagregadoSubcontrato(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const url = this.enviUrl + '/api/subcontratos/listadoDesagregadoSubcontrato';

    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) throw new Error();
        return res;
      }),
      catchError(err => throwError(err))
    ).toPromise();
  }
}
