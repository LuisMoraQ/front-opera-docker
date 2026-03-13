import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs'
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class EncriptadorService {
  enviUrl = '';
  key:string =''
  token = '';
  textencriptado :string;
  textdesencriptado :string;
  constructor(private http: HttpClient) {
    this.enviUrl = environment.apiUrl;
    this.key = environment.key;
   }
   encryptar(text:string){    ​
    var key = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
    var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
    return CryptoJS.AES.encrypt(text, key, { iv: iv }).toString();
   }
   desencryptar(text){
    var key = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
    var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
    return CryptoJS.AES.decrypt(text,key,{ iv: iv }).toString(CryptoJS.enc.Utf8);
   }
   guardarlocalstory(clave,valor){
    let claveencrytada = this.encryptar(clave)
    let valorencrytada = this.encryptar(valor)
    localStorage.setItem(claveencrytada, valorencrytada)
    return true
  }
  recuperarlocalstory(clave){
   let claveencrytada = localStorage.getItem(this.encryptar(clave))
   if(claveencrytada!=null)
    return this.desencryptar(claveencrytada)
  }
  eliminarlocalstory(clave){
   let claveencrytada = this.encryptar(clave);
   localStorage.removeItem(claveencrytada)
   return true;
  }
  //consultar fecha-hora actual
  FechaActualBack():any{
    let formData: FormData = new FormData();
    const url = this.enviUrl + '/api/configuraciones/fechaActual';
    return this.http.post<any>(url,formData).pipe(
      map(res => {
        if (!res || res.id == "0") {
          throw new Error
        }
        return res
      }),
      catchError(err => throwError(err))
    ).toPromise()
  }

  recuperarDocumento(params = {}): any {
    let formData: FormData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const url = this.enviUrl + '/api/datasipa/descargarArchivo';
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
  comprimirJSON(jsonData: any): string {
    const jsonString = JSON.stringify(jsonData);
    const compressed = LZString.compressToUTF16(jsonString);
    return compressed;
  }
  descomprimirJSON(compressedData: string): any {
    const decompressed = LZString.decompressFromUTF16(compressedData);
    const jsonData = JSON.parse(decompressed);
    return jsonData;
  }
  comprimirTexto(ptexto:any):string{
    const compressed = LZString.compressToUTF16(ptexto);
    return compressed;
  }
  descomprimirTexto(ptexto:any):string{
    const decompressed = LZString.decompressFromUTF16(ptexto);
    return decompressed;
  }

  // Codificar: Texto -> Base64 URL Safe
  encode64(data: string): string {
    return btoa(data)
      .replace(/\+/g, '-') // Reemplaza + por -
      .replace(/\//g, '_') // Reemplaza / por _
      .replace(/=+$/, ''); // Elimina el padding =
  }

  // Decodificar: Base64 URL Safe -> Texto
  decode64(encoded: string): string {
    // Reconstruir el padding si es necesario
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    return atob(base64);
  }
}
