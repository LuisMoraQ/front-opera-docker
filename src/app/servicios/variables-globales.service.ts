import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EncriptadorService } from './encriptador.service';

@Injectable({
  providedIn: 'root'
})
export class VariablesGlobalesService {
  principal = JSON.parse(localStorage.getItem('principal'))
  // principal = true
  public menuPrincipal = new BehaviorSubject<boolean>(this.principal)
  array = localStorage.getItem('tabs') != '' ? JSON.parse(localStorage.getItem('tabs')) : [];
  public arrayTabs = new BehaviorSubject<any[]>(this.array)
  mantener = false
  public mantenerPrincipal = new BehaviorSubject<boolean>(this.mantener)
  public editaSubpartida = new BehaviorSubject<any>(null)
  public editaClasi = new BehaviorSubject<any>(null)
  public vincPart = new BehaviorSubject<any>(null)
  public updvincPart = new BehaviorSubject<any>(null)
  public updrelacinsumo = new BehaviorSubject<any>(null)
  public updclasinsumo = new BehaviorSubject<any>(null)
  public porcentajeTit = new BehaviorSubject<any>(null)
  constructor(private _EncriptadorService: EncriptadorService,private router: Router) { 
  }
}
