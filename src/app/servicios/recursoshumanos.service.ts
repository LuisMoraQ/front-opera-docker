import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators'
import { BehaviorSubject, Subject, throwError } from 'rxjs'
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RecursosHumanosService {
    enviUrl = '';
    httpHeaders = new HttpHeaders(
        {
            'Content-Type': 'application/json',
        });
    constructor(private http: HttpClient) {
        this.enviUrl = environment.apiUrl;
    }

    guardarAgrupamientoExpTec(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarAgrupamientoExpTec';
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

    listarAgrupamientoExpTec(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarAgrupamientoExpTec';
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

    actualizarAgrupamientoExpTec(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarAgrupamientoExpTec';
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

    listarPrograConFechasLimite(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarPrograConFechasLimite';
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

    guardarVersionProgramacion(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarVersionProgramacion';
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

    eliminarVersionProgramacion(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarVersionProgramacion';
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

    listarVersionProgramacion(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarVersionProgramacion';
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


    guardarElementoAgrupamiento(params = {}): Promise<any> {
        // let formData: FormData = new FormData();
        // Object.entries(params).forEach(([key, value]) => {
        //   formData.append(key, value as string);
        // });
        const url = this.enviUrl + '/api/recursoshumanos/guardarElementoAgrupamiento';
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

    eliminarElementoAgrupamiento(params = {}): Promise<any> {
        // let formData: FormData = new FormData();
        // Object.entries(params).forEach(([key, value]) => {
        //   formData.append(key, value as string);
        // });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarElementoAgrupamiento';
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

    eliminarAgrupamientoCompleto(params = {}): Promise<any> {
        // let formData: FormData = new FormData();
        // Object.entries(params).forEach(([key, value]) => {
        //   formData.append(key, value as string);
        // });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarAgrupamientoCompleto';
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

    guardarCargoArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarCargoArea';
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

    eliminarCargoArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarCargoArea';
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

    actualizarCargoArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarCargoArea';
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

    listarCargosPorArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarCargosPorArea';
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

    listarUsuariosRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarUsuariosRecursosHumanos';
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

    guardarUsuarioRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarUsuarioRecursosHumanos';
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

    actualizarUsuarioRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarUsuarioRecursosHumanos';
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

    eliminarUsuarioRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarUsuarioRecursosHumanos';
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

    guardarAreaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarAreaRecursosHumanos';
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

    actualizarAreaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarAreaRecursosHumanos';
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

    eliminarAreaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarAreaRecursosHumanos';
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

    guardarConvocatoriaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarConvocatoriaRecursosHumanos';
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

    listarConvocatoriasRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarConvocatoriasRecursosHumanos';
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

    eliminarConvocatoriaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarConvocatoriaRecursosHumanos';
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

    actualizarConvocatoriaRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarConvocatoriaRecursosHumanos';
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

    listarPostulantesConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarPostulantesConvocatoria';
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

    guardarPostulanteConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarPostulanteConvocatoria';
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

    guardarPostulanteConvocatoriaPortada(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarPostulanteConvocatoriaPortada';
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

    actualizarPostulanteConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarPostulanteConvocatoria';
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

    eliminarPostulanteConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarPostulanteConvocatoria';
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

    listarHorarioYFeriadosArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarHorarioYFeriadosArea';
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

    guardarFeriadoRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarFeriadoRecursosHumanos';
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

    actualizarFeriadoRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarFeriadoRecursosHumanos';
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

    eliminarFeriadoRecursosHumanos(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarFeriadoRecursosHumanos';
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

    guardarHorarioArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarHorarioArea';
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

    actualizarHorarioArea(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarHorarioArea';
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

    listarAsignacionesUsuario(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarAsignacionesUsuario';
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

    guardarAsignacionUsuario(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarAsignacionUsuario';
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

    actualizarAsignacionUsuario(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarAsignacionUsuario';
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

    eliminarAsignacionesUsuario(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarAsignacionesUsuario';
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

    listarDetalleConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarDetalleConvocatoria';
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

    guardarDetalleConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarDetalleConvocatoria';
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

    actualizarDetalleConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarDetalleConvocatoria';
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

    eliminarDetalleConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarDetalleConvocatoria';
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

    listarConvocatoriasActivas(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarConvocatoriasActivas';
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

    listarAsignacionesProyecto(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarAsignacionesProyecto';
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

    listarRegistrosAsistencia(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarRegistrosAsistencia';
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

    guardarRegistrosAsistencia(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/guardarRegistrosAsistencia';
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

    actualizarRegistrosAsistencia(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarRegistrosAsistencia';
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

    eliminarRegistrosAsistencia(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarRegistrosAsistencia';
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

    listarAsistenciaMovil(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarAsistenciaMovil';
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


    agregarActualizarAsistenciaMovil(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/agregarActualizarAsistenciaMovil';
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

    guardarActualizarRegistrosAsistencia(params: any[]): Promise<any> {
        const url = this.enviUrl + '/api/recursoshumanos/guardarActualizarRegistrosAsistencia';

        // Asegurar que se envíe como JSON válido
        return this.http
            .post<any>(url, params, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .toPromise();
    }

    listarPresAnaliticoRH(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarPresAnaliticoRH';
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

    guardarPresAnaliticoRH(params: any[]): any {
        const url = this.enviUrl + '/api/recursoshumanos/guardarPresAnaliticoRH';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post<any>(url, params, { headers: headers }).pipe(
            map(res => {
                if (!res) {
                    throw new Error
                }
                return res
            }),
            catchError(err => throwError(err))
        ).toPromise()
    }

    actualizarPresAnaliticoRH(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/actualizarPresAnaliticoRH';
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

    eliminarPresAnaliticoRH(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarPresAnaliticoRH';
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

    actualizarPresAnaliticoRHLote(params: any[]): Promise<any> {
        const url = this.enviUrl + '/api/recursoshumanos/actualizarPresAnaliticoRHLote';

        // Asegurar que se envíe como JSON válido
        return this.http
            .post<any>(url, params, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .toPromise();
    }

    eliminarYActualizarPresAnaliticoRH(params: any): Promise<any> {
        const url = this.enviUrl + '/api/recursoshumanos/eliminarYActualizarPresAnaliticoRH';

        // Asegurar que se envíe como JSON válido
        return this.http
            .post<any>(url, params, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .toPromise();
    }

    eliminarAreaPresAnaliticoRH(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/eliminarAreaPresAnaliticoRH';
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


    guardarLoteRegistroAsistenciaRH(params: any): Promise<any> {
        const url = this.enviUrl + '/api/recursoshumanos/guardarLoteRegistroAsistenciaRH';

        // Asegurar que se envíe como JSON válido
        return this.http
            .post<any>(url, params, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .toPromise();
    }

    listarMontosAreaPresAnaliticoRH(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarMontosAreaPresAnaliticoRH';
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

    listarLimitesConvocatorias(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/listarLimitesConvocatorias';
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

    postulantesPorEstadoConvocatoria(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/postulantesPorEstadoConvocatoria';
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

      verificarDniUsuario(params = {}): any {
        let formData: FormData = new FormData();
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value as string);
        });
        const url = this.enviUrl + '/api/recursoshumanos/verificarDniUsuario';
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