import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { HttpRequest,HttpHandler,HttpEvent,HttpInterceptor,HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncriptadorService } from '../servicios/encriptador.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class MainiterceptorInterceptor implements HttpInterceptor {

  constructor(
    public _EncriptadorService: EncriptadorService,
    private router: Router,
    private toaster: ToastrService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = this._EncriptadorService.recuperarlocalstory('token')
    let clonedReq=request;
    if(token){
      clonedReq=request.clone({
        setHeaders:{
          'Authorization':'Bearer ' +JSON.parse(token)
        }
      })
    }
    return next.handle(clonedReq).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.log(errorResponse)
          // return throwError(errorResponse);
          if (errorResponse.status === 0) {//no se conecto con el servidor
            console.log('error 0')
            return throwError(errorResponse);
          }else if(errorResponse.status==401){//401, no autorizado cerrar sesion, to login
            console.log('error 401')
            localStorage.clear();
            this.toaster.error('Su sesión ha caducado.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 10000 })
            this.router.navigate(['/'])
            return throwError(errorResponse);
          }
        }
      })
    );
  }
}
