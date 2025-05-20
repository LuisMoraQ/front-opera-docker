import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PresupuestosService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
  {
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }
  GuardarPresupuestoTemp (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/guardarPresuTemp';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        /* if (!res) {
          throw new Error
        } */
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ExistePresuTemp (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/existePresuTemp';
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
  ListarPresupuestoTemp (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarPresuTemp';
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
  DescartarCambiosPresupuesto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/descartaCambiosPresu';
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
  GuardarCambiosPresupuesto (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/guardarCambiosPresu';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarPresupuestoProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarPresuProyecto';
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
  ListarPresuProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarPresuProy';
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
  ListarPresuDetProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarPresuDetProy';
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
  ListarPresuSubpProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarPresuSubpProy';
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
  UltimoIndicePresu (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/ultimoIndicePresu';
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
  ListarSubpresuProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarSubPresuProyecto';
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
  ListarFilasPartPresu (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarFilasPartida';
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
  GuardarCambiosSubPresu (body: any): any {
    const url = this.enviUrl + '/api/proyectos/guardarCambiosSubPresu';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  BuscarProyAddPresu (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/busqProyAddPresu';
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
  ImportarPresupuesto (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresu';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ImportarPresupuestoRap (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresu2';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  importaPresuTop (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresuTop';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ImportarPresuP1 (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresuP1';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ImportarPresuP2 (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresuP2';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ImportarPresuP3 (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/importaPresuP3';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  VincularUndImp (body: any): any {
    const url = this.enviUrl + '/api/presupuesto/vinculaUnidadImp';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //presupuesto indirecto
  ListarPresuIndirecto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/listarPresuIndir';
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
  ListarIndirDetalleProy (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/listarIndirDetProy';
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
  UltimoIndPresIndir (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/ultimoIndPresuindir';
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
  GuardarCambiosPresIndir (body: any): any {
    const url = this.enviUrl + '/api/indirecto/guardarCambiosIndir';
    return this.http.post<any>(url, body, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  GuardarIndirectoTemp (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/guardarIndirTemp';
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
  ListarIndirectoTemp (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/listarIndirTemp';
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
  DescartarCambiosIndirecto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/descartaCambiosIndir';
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
  //fin presupuesto indirecto
  ReiniciarPresupuesto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/reiniciarPresu';
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
  RecalculaPresu (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/recalculaMontosPresu';
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
  limpiarTopPresupuesto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/limpiarTopPresupuesto';
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
  listarTopPresupuesto (params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/listarTopPresupuesto';
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
