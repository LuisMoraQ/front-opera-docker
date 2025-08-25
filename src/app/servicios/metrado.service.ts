import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EncriptadorService } from './encriptador.service';

@Injectable({
  providedIn: 'root'
})
export class MetradoService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    })
  constructor(private http: HttpClient, public _EncriptadorService: EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }

  listarPlantillaMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarPlantillasMetrado';
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

  editarNombrePlantillaMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/editarPlantillasMetrado';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res || res.id == '0') {
        //   throw new Error
        // }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }


  guardarPlantillaMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/guardarPlantillasMetrado';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res || res.id == '0') {
        //   throw new Error
        // }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  eliminarPlantillaMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/eliminarPlantillasMetrado';
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

  listarTitulosDeMetrados(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarTitulosMetrado';
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
    reporteMetradosMes(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/reporteMetradosMes';
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
  listarTablaDeMetradoXTitulo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarPresuMetradoTit';
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

  listarMetradoXPartida(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarMetradoSistemaPartida';
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

  guardarCambiosMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/metrados/guardarMetradoSistema';
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

  actualizarTituloMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/ActualizarTituloMetrado';
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

  listarInformacionMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarInformacionMetrado';
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

  eliminarInformacionTituloMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/eliminarInformacionMetrado';
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

  listarPesosComerciales(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarPesosComerciales';
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

  guardarPesosComerciales(params = {}): Promise<any> {
    // let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    // const url = this.enviUrl + '/api/metrados/guardarPesosComerciales';
    // return this.http.post<any>(url, formData).pipe(
    //   map(res => {
    //     if (!res) {
    //       throw new Error
    //     }
    //     return res
    //   }),
    //   catchError(err => throwError(err))
    // ).toPromise()
    let formData: FormData = new FormData();

    const url = this.enviUrl + '/api/metrados/guardarPesosComerciales';
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
  listarCambiosTemporalesMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarMetradoTemp';
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
  listarCambiosTemporalesMetrado2(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarMetradoTemp2';
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

  guardarCambiosTemporalesMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/guardarMetradoTemp';
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

  guardarCambiosTemporalesMetrado2(params = {}, headers = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const httpHeaders = new HttpHeaders(headers);
    const url = this.enviUrl + '/api/metrados/guardarMetradoTemp2';
    return this.http.post<any>(url, formData, { headers: httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  descartarCambiosTemporalesMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/descartaCambiosMetrado';
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
  descartarCambiosTemporalesMetrado2(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/descartaCambiosMetrado2';
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

  guardarTablaMetradoExcel(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/metrados/guardarMetradoExcel';
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

  listarTablaMetradoExcel(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarMetradoExcel';
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

  eliminarTablaMetradoExcel(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/eliminarTitMetradoExcel';
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

  vincularMetradoAPresupuesto(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/metrados/vincularMetradoApresu';
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

  listarTablaMetradoXProyecto(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarPresuMetrado';
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

  ModificaNivMetradoExcel(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/metrados/ModificaNivMetradoExcel';
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

  tablasMetradoTit(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/tablasMetradoTit';
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
  importarMetrado(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/importarMetrado';
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
  listarTopMetrados(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarTopMetrados';
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
  limpiarTopMetrado(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/limpiarTopMetrado';
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
  listarRegistroMetrados(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarRegistroMetrados';
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
  guardarRegistroMetrado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/guardarRegistroMetrado';
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
  actEstadoRegistroMetrado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/actEstadoRegistroMetrado';
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
  eliminarRegistroMetrado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/eliminarRegistroMetrado';
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
  listarMetradosDiarios(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarMetradosDiarios';
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
  historialMetrdiarioPartida(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados//api/metrados/historialMetrdiarioPartida';
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
  // guardarMetradoDiario(params = {}): any {
  //   let formData: FormData = new FormData();
  //   Object.entries(params).forEach(([key, value]) => {
  //     formData.append(key, value as string);
  //   });
  //   const url = this.enviUrl + '/api/metrados/guardarMetradoDiario';
  //   return this.http.post<any>(url, formData).pipe(
  //     map(res => {
  //       if (!res) {
  //         throw new Error
  //       }
  //       return res
  //     }),
  //     catchError(err => throwError(err))
  //   ).toPromise()
  // }
    guardarMetradoDiario(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/metrados/guardarMetradoDiario';
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
listarTopMetradosDiarios(params = {}): Promise<any>  {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/metrados/listarPrueba';
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
