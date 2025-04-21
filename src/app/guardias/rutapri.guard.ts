import { state } from '@angular/animations';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { EncriptadorService } from '../servicios/encriptador.service';

@Injectable({
  providedIn: 'root'
})
export class RutapriGuard implements CanActivate {
  constructor(
    private ruta: Router,
    public _EncriptadorService:EncriptadorService,
    ) { }

  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
    /* if(this._EncriptadorService.recuperarlocalstory('idusuario') && state.url=='/'){
      console.log('a princ')
      this.ruta.navigate(['/principal/inicio']);
      return false;
    } */
    return true;
  }
}