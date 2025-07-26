import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  enviUrl = '';
  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }
  DataInsumos(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/datosInsumo';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  DatosPartidaCatalog(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/datosPartidaCatalogo';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  BuscarDataInsumos(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/buscarDataInsumo';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  ListarInsumosAddAuto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/ListarInsumosAddAuto';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  ListarDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  ListarDataPartidasUser(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarDataPartidasUser';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  BuscarDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/buscarDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ListarTitsubPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarTitsubPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ManteDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/manteDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  GuardarDataGrupoPartidas(params = {}): any {
    /* let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    }); */
    const url = this.enviUrl + '/api/datasipa/guardarGrupoDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  GuardarDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/guardarDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ModificarGrupoDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/modificarGrupoDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ActPrecioSubpPadre(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/actPrecioSupbPadre';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ModificarDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/modificarDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ModificarEspePartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarEspecPartida';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ModificarFichaPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarFichaPartida';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ListarArchPartidasCat(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarArchCatPartida';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  EliminarDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/eliminarDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  SubirDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/subirDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  BajarDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/bajarDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  DerechaDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/derechaDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  IzquierdaDataPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/izquierdaDataPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  ListarDetalleDataPartidas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarDetalleDataPartidas';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  listarPartidaYDetalle(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/datosPartidasydet';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  eliminarCatalogoInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/eliminarCatalogoDataInsumo';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res[0];
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }

  listarCatalogosInsumoData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarCatalogosInsumo';
    return this.http
      .post<any>(url, formData)
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
  CopiarVariasPartidas(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/copiarVariasPartidas';
    return this.http
      .post<any>(url, params, { headers: this.httpHeaders })
      .pipe(
        map((res) => {
          if (!res) {
            throw new Error();
          }
          return res;
        }),
        catchError((err) => throwError(err))
      )
      .toPromise();
  }
}
