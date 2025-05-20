import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EncriptadorService } from './encriptador.service';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  enviUrl = '';

  constructor(
    private http: HttpClient,
    public _EncriptadorService: EncriptadorService
  ) {
    this.enviUrl = environment.apiUrl;
  }
  ListarTiposUsuarios(estado: any): any {
    let formData: FormData = new FormData();
    formData.append('estado', estado);
    const url = this.enviUrl + '/api/configuraciones/listartiposuser';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ManteTiposUsuarios(): any {
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/configuraciones/mantetiposuser';
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
  GuardarTiposUsuarios(nombre: any, abre: any, seleccion: any, arbol: any, estado: any,menu_proy:any): any {
    let formData: FormData = new FormData();
    formData.append('nombre', nombre);
    formData.append('abre', abre);
    formData.append('seleccion', seleccion);
    formData.append('arbol', arbol);
    formData.append('estado', estado);
    formData.append('menu_proy', menu_proy);
    const url = this.enviUrl + '/api/configuraciones/guardartipouser';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModificarTiposUsuarios(id_tipo: any, nombre: any, abre: any, seleccion: any, arbol: any, estado: any,menu_proy): any {
    let formData: FormData = new FormData();
    formData.append('id_tipo', id_tipo);
    formData.append('nombre', nombre);
    formData.append('abre', abre);
    formData.append('seleccion', seleccion);
    formData.append('arbol', arbol);
    formData.append('estado', estado);
    formData.append('menu_proy', menu_proy);
    const url = this.enviUrl + '/api/configuraciones/modificartipouser';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  EliminarTiposUsuarios(id_tipo: any): any {
    let formData: FormData = new FormData();
    formData.append('id_tipo', id_tipo);
    const url = this.enviUrl + '/api/configuraciones/eliminartipouser';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //ubicacion
  Departamento(): any {
    /* let token = this._EncriptadorService.recuperarlocalstory('token')    
    const httpHeaders = new HttpHeaders(
      {
        'Authorization': token?JSON.parse(token):'',
      }); */
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/configuraciones/listar/departamento';
    return this.http.post<any[]>(url, body /* ,{ headers: httpHeaders } */).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  Provincia(depa): any {
    let body: HttpParams = new HttpParams();
    body = body.append('depa', depa);
    const url = this.enviUrl + '/api/configuraciones/listar/provincia';
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
  Distrito(depa, provi): any {
    let body: HttpParams = new HttpParams();
    body = body.append('depa', depa);
    body = body.append('provi', provi);
    const url = this.enviUrl + '/api/configuraciones/listar/distrito';
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
  //fin ubicacion
  //datos usuario
  ModificarConfigTema(iduser: any, config: any): any {
    let formData: FormData = new FormData();
    formData.append('iduser', iduser);
    formData.append('config', config);
    const url = this.enviUrl + '/api/configuraciones/modificarconfigtema';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  VerDatosUsuario(id_usuario: any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    const url = this.enviUrl + '/api/configuraciones/datosUsuario';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  VerDatosUsuarioDetalle(id_usuario: any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    const url = this.enviUrl + '/api/configuraciones/datosUsuarioDetalle';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  BuscarUsuarioxCod(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/buscarUsuarioxCod';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //fin datos usuario
  CambiarContrasena(id_usuario: any, clave: any, clavenew: any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('clave', clave);
    formData.append('clavenew', clavenew);
    const url = this.enviUrl + '/api/configuraciones/cambiarContrase';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  CambiarLoginUser(id_usuario: any, clave: any, login: any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('clave', clave);
    formData.append('login', login);
    const url = this.enviUrl + '/api/configuraciones/cambiarLogin';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ActualizaLicUser(id_usuario: any, fechaasig: any, fechacul: any,id_licencia:any,licant:any,usermod:any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('fechaasig', fechaasig);
    formData.append('fechacul', fechacul);
    formData.append('id_licencia', id_licencia);
    formData.append('licant', licant);
    formData.append('usermod', usermod);
    const url = this.enviUrl + '/api/configuraciones/actLicenciaUser';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModDatosPerfil(id_usuario: any, telefono: any, correo: any, id_pais: any, ubigeoact: any, direccion: any, genero: any, id_usermod): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('telefono', telefono);
    formData.append('correo', correo);
    formData.append('id_pais', id_pais);
    formData.append('ubigeoact', ubigeoact);
    formData.append('direccion', direccion);
    formData.append('genero', genero);
    formData.append('id_usermod', id_usermod);
    const url = this.enviUrl + '/api/configuraciones/modificarDatosPerfil';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarMantenimientoUsuarios(): any {
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/configuraciones/mantenimientoUsuarios';
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
  LiberarUsuario(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/LiberaUsuario';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ListarTiposUsuarios2(params = {}): any {
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/configuraciones/listartiposuser';
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
  DatosModalUsuario(): any {
    let body: HttpParams = new HttpParams();
    const url = this.enviUrl + '/api/configuraciones/datosModalUsuario';
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
  GuardarUsuario(params): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/guardarUsuario';
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
  modificarUsuario(params: any): any {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/modificarUsuario';
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
  eliminarUsuario(params): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/eliminarUsuario';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  eliminarUsuarioTodo(params): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/eliminarUserTodo';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //usuarios secundarios
  ListarUsuariosSecundarios(params: any): any {
    // console.log(params)
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/listarUsuariosSec';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  modificarUsuarioSec(params: any): any {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/modificarUsersec';
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
  DatosaccUsuariosSec(params: any): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/datosaccUsersec';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModaccUsuariosSec(params: any): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/modaccUsersec';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //datos de acceso al sistema
  RestaurarPassw(id_usuario: any, login: any, cual: any): any {
    let formData: FormData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('login', login);
    formData.append('cual', cual);
    const url = this.enviUrl + '/api/configuraciones/RestaurarPass';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  RecuperarPassw(login: any, correo: any): any {
    let formData: FormData = new FormData();
    formData.append('login', login);
    formData.append('correo', correo);
    const url = this.enviUrl + '/api/configuraciones/recuperaPass';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  //indices unificados
  listarIndiceUnificados(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarIndiceUnif';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  guardarIndiceUnificado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/guardarIndiceUnif';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  editarIndiceUnificado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarIndiceUnif';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  eliminarIndiceUnificado(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/eliminarIndiceUnif';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarTipoInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarTipoInsumo';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  guardarTipoInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/guardarTipoInsumo';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  editarTipoInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarTipoInsumo';
    return this.http.post<any[]>(url, formData).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  eliminarTipoInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/eliminarTipoInsumo';
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

  listarInsumosData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarDataInsumo';
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

  listarInsumosXUsuarioData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/listarDataInsumoUser';
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
  GuardarCatalInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/guardarCatalInsumo';
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
  guardarInsumosData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      // if(key=='catalogos'){
      //   for(let ifile of (value as Array<any>)){
      //     formData.append(key, ifile);
      //   }
      // }
      // else{
        formData.append(key, value as string);
      // }
    }); 
    const url = this.enviUrl + '/api/datasipa/guardarDataInsumo';
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
  editarInsumosData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      // if(key=='catalogos'){
      //   for(let ifile of (value as Array<any>)){
      //     formData.append(key, ifile);
      //   }
      // }
      // else{
        formData.append(key, value as string);
      // }
    });
    const url = this.enviUrl + '/api/datasipa/modificarDataInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ModificarPrecioInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/modificarPrecioInsumo';
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
  eliminarInsumosData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/eliminarDataInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  ImportarDatainsumo(body: any): any {
    const httpHeaders = new HttpHeaders(
      {
        'Content-Type': 'application/json',
      });
    const url = this.enviUrl + '/api/datasipa/importarDatainsumo';
    return this.http.post<any>(url, body, { headers: httpHeaders }).pipe(
      map(res => {
        if (!res) {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  descargarArrayImagenesInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/descImagsInsumos';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res || res.id == "0") {
        //     throw new Error
        // }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  guardarImagenInsumo(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/subirImagenInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res[0] || res[0].id == "0") {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  actualizarImgIns(params = {}): Promise<any> {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/updateImgInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res[0] || res[0].id == "0") {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }
  eliminarImagenInsumo(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/elimImgInsumo';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res || res.id == "0") {
        //     throw new Error
        // }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  listarGrupoProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/listar/grupoproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        // if (!res || res.id == "0") {
        //     throw new Error
        // }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  guardarGrupoProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/guardar/grupoproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  modificarGrupoProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/modificar/grupoproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  eliminarGrupoProyecto(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/proyectos/eliminar/grupoproy';
    return this.http.post<any>(url, formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res[0]
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  duplicarInsumoData(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/duplicarDataInsumo';
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
  MontoaLetras(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/montoaTexto';
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
  listarMonedas(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/listarMonedas';
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
  listarPaises(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/listarPaises';
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
  ModificarPais(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/modificarPais';
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
  EliminarPais(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/eliminarPais';
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
  GuardarMoneda(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/guardarMoneda';
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
  ModificarMoneda(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/modificarMoneda';
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
  EliminarMoneda(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/eliminarMoneda';
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
  GuardarPaises(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/configuraciones/guardarPais';
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
