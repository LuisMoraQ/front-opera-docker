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
}