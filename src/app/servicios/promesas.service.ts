import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { EncriptadorService } from './encriptador.service';
import { PrincipalService } from './principal.service';
import * as moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class PromesasService {
  url: string
  programacion: any;
  constructor(
    private http: HttpClient,
    private _EncriptadorService: EncriptadorService,
    private principalService: PrincipalService
  ) { this.url = environment.apiUrl }

  getLateral(params: any): Promise<any> {
    let body: HttpParams = new HttpParams();
    body = body.append('usuario', params);
    const url = this.url + '/api/consulta/lateral';
    return this.http.post<any>(url, body).pipe(
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
