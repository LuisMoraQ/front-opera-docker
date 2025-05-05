import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EncriptadorService } from './encriptador.service';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PrincipalService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    })
  constructor(private http: HttpClient, public _EncriptadorService: EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }

  ListarProyectos(id_usuario,fuente=1): any {
    let body: HttpParams = new HttpParams();
    body = body.append('id_usuario', id_usuario);
    body = body.append('fuente', fuente);
    const url = this.enviUrl + '/api/proyectos/listar/proyectos';
    return this.http.post<any[]>(url, body).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarProyectosSec(id_usuario): any {
    let body: HttpParams = new HttpParams();
    body = body.append('id_usuario', id_usuario);
    const url = this.enviUrl + '/api/proyectos/listar/proyectossec';
    return this.http.post<any[]>(url, body).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarProyPapelera(id_usuario): any {
    let body: HttpParams = new HttpParams();
    body = body.append('id_usuario', id_usuario);
    const url = this.enviUrl + '/api/proyectos/listar/proyectosPapelera';
    return this.http.post<any[]>(url, body).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  Departamento(): any {
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/Proyectos/listar/departamento';
    return this.http.post<any[]>(url, body)
  }
  Provincia(depa): any {
    let body: HttpParams = new HttpParams();
    body = body.append('depa', depa);
    const url = this.enviUrl + '/api/Proyectos/listar/provincia';
    return this.http.post<any[]>(url, body)
  }
  Distrito(depa, provi): any {
    let body: HttpParams = new HttpParams();
    body = body.append('depa', depa);
    body = body.append('provi', provi);
    const url = this.enviUrl + '/api/Proyectos/listar/distrito';
    return this.http.post<any[]>(url, body)
  }
  guardarProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/guardar/proyecto';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  eliminarProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/eliminar/proyecto';
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
  eliminarProyPerma(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/eliminarProyAuto';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  ActualizaElimnaproy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/actualizaEliminaProy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  actualizarObservacionInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarObsDataInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ArchivoFichaInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/archFichInsumo';
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
  VincularArchInsumos(params = {}): any {
    const url = this.enviUrl + '/api/datasipa/vincularInsumo';
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
  //inicio aspectos proyectos
  ModificarAspectosProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modificar/aspectosproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarAspectosProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listar/aspectosproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //fin aspectos proyectos
  recuperarDatosProyecto(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/datos/Proyecto';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  modificarProyecto(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modificar/proyectoinfo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  descargarDocumento(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/descargarArchivo';
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
  generarDataGantt(params = {}): any {
    const url = this.enviUrl + '/api/programacion/generarDataGantt2';
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

  generarRutaCr(params = {}): any {
    const url = this.enviUrl + '/api/programacion/generarRutaCr';
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

  listarProgramacionProyecto(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/listarProgramacionProy';
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
  guardarFilaProgramacionProyecto(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/guardarFilaProgramacion';
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
  guardarDatosProgramacion(params = {}) {
    let formData: FormData = new FormData();
    // Object.entries(params).forEach(([key, value]) => {
    //   formData.append(key, value as string);
    // });
    const url = this.enviUrl + '/api/programacion/guardarTablaProgramacion';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //aspectos proyecto
  GuardarAspectosDiasProy(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/guadarAspectosProy';
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
  GuardarFeriadosDiasProy(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/guadarFeriadosProy';
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
  ModificarFeriadosDiasProy(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/modificarFeriadosProy';
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
  EliminarFeriadosDiasProy(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/eliminarFeriadosProy';
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
  ListarAspectosDiasProy(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/listarAspectosProyecto';
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
  noLaborablesXProyecto(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/feriadosNolaboProy';
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
  fechaDespuesDuracion(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/fechaDespuesDuracion';
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
  calendarioProgra(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/calendarioProgra';
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
  calendarioProgra2Fechas(params = {}) {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/calendarioPrograFin';
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
  desplazarProgramacion(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/desplazaProgra2';
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
  listarHitos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/listarHitosProy';
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
  guardarHito(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/guardarHitosProy';
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
  actualizarHito(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/modificarHitosProy';
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
  eliminarHito(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/eliminarHitosProy';
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
  CambiosProyHitos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    const url = this.enviUrl + '/api/programacion/CambiosProyHitos';
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
  importarProgramacion(params = {}): Promise<any> {
    //no se usa
    const url = this.enviUrl + '/api/programacion/importarProgramacion';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  listarCambiosTemporalesProgramacion(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/listarPrograTemp';
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
  guardarCambiosTemporalesProgramacion(params = {}, headers = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const httpHeaders = new HttpHeaders(headers);
    const url = this.enviUrl + '/api/programacion/guardarPrograTemp';
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
  eliminarCambiosTemporalesProgramacion(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/descartaCambiosProgra';
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
  guardaCambiosTablaFeriados(params = {}): Promise<any> {
    const url = this.enviUrl + '/api/programacion/cambiosFeriadosProy';
    return this.http.post<any>(url, params, { headers: this.httpHeaders }).pipe(
      map(res => {
        if (!res || res.id == '0') {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  restaurarPrograma(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/restaurarPrograma';
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
  //proyectos compartidos
  ListarProyCompartidos(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listar/proyectosCompa';
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
  FilaProyectoComp(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/filaProyectoComp';
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
  ComparteProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/comparteProy';
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
  DescomparteProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/descomparteProy';
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
  ActualizaProyComp(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/actualizaProyComp';
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
  ListarUsuariosProyComp(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarUsuariosProyComp';
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
  DuplicarProy2(body: any): any {
    const url = this.enviUrl + '/api/proyectos/duplicarProy2';
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
  //inicio configs proyectos
  ModificarConfigDecProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modificar/configproyDec';
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
  ModificarConfigColProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modificar/configproyCol';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarConfigProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listar/configproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //fin configs proyectos
  relacionInsumosProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/relacionInsumosProy';
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
  relInsPrograDetallado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/programacion/relInsPrograDetallado';
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
  detallePartidaProgra(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/presupuesto/detallePartidaProgra';
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
  DataRealizaProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/dataRealizadaProy';
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
  ListarProyAsig(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarProyAsigna';
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
  GuardarProyAsig(body: any): any {
    const url = this.enviUrl + '/api/proyectos/guardarProyAsigna';
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
  ConfgsAsignaUserProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/ConfAsignaUser';
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
  ActInfoProy(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/actInformacionProy';
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
  RecArchivoInfoProy(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/archInfoProy';
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

  listarIndiceEliminados(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/ListarIndiceEliminados';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  limpiarIndicesElimina(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/limpiarIndicesElimina';
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
  JuntarPoyecsRap(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/juntarProys2';
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
  GuardarConfImpr(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/guardarProyImpre';
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
  ListarConfImpr(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarProyImpre';
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
  ListarProyItemAlt(params = {}): any {//id_proyecto => devuelve 2 tablas(tablaitemsalt,tabla estadoitem)
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarProyItemAlt';
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
  GuardarItemsAlt(body :any): any {//JSON(id_proyecto,estadoitem,datos1)
    const url = this.enviUrl + '/api/proyectos/guardarItemsAlt';
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
  ModificarEstadoItem(params = {}): any {//id_proyecto,estado
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modifEstadoItemalt';
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
  ModificarEstiloProy(params = {}): any {//id_proyecto,estilo,donde(0:indirecto,1:metrado)
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modifEstiloProy';
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
  ListarEstilosProy(params = {}): any {//id_proyecto
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listarEstiloProy';
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
  BuscarProyBiplan(params = {}): any {//id_proyecto
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/datosProyBiplan';
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
  AgregarProyBiplan(body :any): any {//JSON(id_proyecto,estadoitem,datos1)
    const url = this.enviUrl + '/api/proyectos/addProyBiplan';
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
}
