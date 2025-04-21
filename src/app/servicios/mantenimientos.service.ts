import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {EncriptadorService} from './encriptador.service';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {
  enviUrl = '';
  constructor(private http: HttpClient, public _EncriptadorService:EncriptadorService) {
    this.enviUrl = environment.apiUrl;
  }
  
  eliminarClasi(datos){
    const url = this.enviUrl + '/api/Proyectos/eliminar/clasificacionpip';
    return this.http.post<any[]>(url,datos)
  }
  agregarClasi(datos){
    const url = this.enviUrl + '/api/Proyectos/agregar/clasificacionpip';
    return this.http.post<any[]>(url,datos)
  }
  modificarClasi(datos){
    const url = this.enviUrl + '/api/Proyectos/modificar/clasificacionpip';
    return this.http.post<any[]>(url,datos)
  }
}
