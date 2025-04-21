import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncriptadorService } from './encriptador.service';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormulaPolinomicaService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    })
  constructor(private http: HttpClient, public _EncriptadorService: EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }

  listarRelacionInsumosXProyecto(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarInsumosxTipoProy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarRelacionInsumosXTipoTitulo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarInsumosxTipoTit';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarTablaTitulosFormPol(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarFormulaTit';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarTablaIUxTitAlmacenado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarFormulaind';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarTablaMonomioxTitAlmacenado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarFormulaPoli';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarCambiosTemporalesFormulaPolinomica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/listarFormulaTemp';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res[0]) {
          return null
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  guardarCambiosTemporalesFormulaPolinomica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/guardarFormulaTemp';
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

  eliminarCambiosTemporalesFormulaPolinomica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/descartaCambiosFormula';
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

  guardarCambiosFormulaPolinomica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/formula/guardarFormulaPoli';
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

  eliminarDataFormulaPolinomicaxProyecto(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/eliminarTodoFormula';
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

  eliminarContenidoTituloFormulaPolinomica(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/formula/eliminarContenidoFormula';
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

  modificarIndiceInsumoRelacionInsumos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/formula/modificarIndUnifInsProy';
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

  listarCostoIndFormula(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/indirecto/listarCostoIndFormula';
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
