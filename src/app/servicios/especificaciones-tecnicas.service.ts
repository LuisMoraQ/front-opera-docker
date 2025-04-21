import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EncriptadorService } from './encriptador.service';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspecificacionesTecnicasService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    })
  constructor(private http: HttpClient, public _EncriptadorService: EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }

  costoUnitarioXPartida(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/datosPartidaPresu';
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

  listarPlantillaEspec(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/listarPlantillaEspec';
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

  actualizarPlantillaEspec(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/especificaciones/actualizarPlantillaEspec';
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

  listarEspecTitulo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/listarEspecTitulo';
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

  buscarPareceEspecPart(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/buscarPareceEspecPart';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        console.log('res', res)
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  buscarPareceEspecTabla(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/especificaciones/buscarPareceEspecTabla';
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

  guardarCambiosEspec(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/especificaciones/guardarCambiosEspec';
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

  listarProyEspecifica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/listarProyEspecifica';
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


  recuperaEspVinculada(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/recuperaEspVinculada';
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

  listarEspecTemp(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/listarEspecTemp';
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

  guardarEspecTemp(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/guardarEspecTemp';
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

  descartaCambiosEspec(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/descartaCambiosEspec';
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

  listarTitEspecif(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/listarTitEspecif';
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

  guardarInfoEspec(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/GuardarInfoEspec';
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

  reiniciarEspec(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/especificaciones/reiniciarEspec';
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
}
