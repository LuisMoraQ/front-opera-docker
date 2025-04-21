import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { EncriptadorService } from '../servicios/encriptador.service';

@Injectable({
  providedIn: 'root'
})
export class RutaGuard implements CanActivate {
  constructor(
    private ruta: Router,
    public _EncriptadorService:EncriptadorService,
    ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //console.log(state.url)
    if(!this._EncriptadorService.recuperarlocalstory('idusuario')){
      this.ruta.navigate(['/']);
      return false;
    }
    else{
      let arrurl=state.url.split('/');
      let accesos= this._EncriptadorService.recuperarlocalstory('accesos');
      /* let rutapermite1=state.url=='/principal/confparam'?true:false; */
      let rutapermite2=state.url=='/principal/configs/confperfil'?true:false;
      let rutapermite3=state.url==='/principal/inicio'?true:false;//false:true
      let permite=(/* rutapermite1|| */rutapermite2||rutapermite3);
      if(!permite){
        //primera ruta
        var arbolj=JSON.parse(accesos)
        arbolj=JSON.parse(arbolj)
        let primruta='/principal/';
        if(arbolj.length>0){
          primruta=arbolj[0].state!=''?primruta+arbolj[0].state+"/":primruta;
          if(arbolj[0].main.length>0){
            let hijo1=arbolj[0].main[0];
            primruta=hijo1.state!=''?primruta+hijo1.state+"/":primruta;
            if(hijo1.children!=null){
              let nieto1=hijo1.children[0];
              primruta=nieto1.state!=''?primruta+nieto1.state+"/":primruta;
            }
          }
        }
        else{
          primruta='/'
        }
        if(!accesos.includes(arrurl[arrurl.length-1]) || state.url.includes('/principal/inicio')){
          this.ruta.navigate(['/principal/inicio']);
          /* this.ruta.navigate([primruta]); */
          return false;
        }
      }
    }
    return true;
  }
}