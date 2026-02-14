import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquiposServiciosService {
  enviUrl = '';
  httpHeaders = new HttpHeaders(
    {
      'Content-Type': 'application/json',
    });
  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
  }

  guardarEquipoServicio(params = {}): any {
    let formData: FormData = new FormData();

    // Definir los campos requeridos con sus valores por defecto
    const campos = {
      id_proyecto: '',
      idregistro: '',
      idgrupo: '',
      idfila: '',
      indrep: '',
      index_array: '',
      index_grupo: '',
      descripcion: '',
      placa: '',
      fecha_solicitud: '',
      cantidad: '',
      precio_unitario: '',
      estado: '',
      unidad: '',
      tipo_registro: '',
      tipo: ''
    };

    // Combinar params con los valores por defecto
    const datosEnvio = { ...campos, ...params };

    // Filtrar undefined y null, y asegurar que todo sea string
    Object.entries(datosEnvio).forEach(([key, value]) => {
      const valToSend = (value === null || value === undefined) ? '' : String(value);
      formData.append(key, valToSend);
    });

    const url = this.enviUrl + '/api/equiposservicios/guardarEquipoServicio';
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

  listarEquipoServicio(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/equiposservicios/listarEquipoServicio';
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
