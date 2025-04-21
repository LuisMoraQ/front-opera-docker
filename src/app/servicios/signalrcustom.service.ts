import { EventEmitter,Injectable,HostListener } from '@angular/core';
import { HubConnectionBuilder,HubConnection} from '@microsoft/signalr';
import {environment} from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {EncriptadorService} from './encriptador.service'
import { LoginService } from 'src/app/servicios/login.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import * as signalR from '@microsoft/signalr';
export interface mensaje {
  id_sala: string;
  mensaje: string;
  id_usuario:string;
  envia:string;
  tipo:string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrcustomService {
  enviUrl = '';
  id_usuario:string='';
  token:string = '';
  public  hubConnection : HubConnection;
  emconectados: EventEmitter<any> = new EventEmitter();
  emmensajes: EventEmitter<any> = new EventEmitter();
  emchat: EventEmitter<mensaje> = new EventEmitter();
  emalert: EventEmitter<any> = new EventEmitter();
  logoutpest: EventEmitter<any> = new EventEmitter();
  actaccesoproy: EventEmitter<any> = new EventEmitter();
  actuaVista: EventEmitter<any> = new EventEmitter();
  refreshNoti: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    public _EncriptadorService:EncriptadorService,
    public _LoginService:LoginService,
    private ruta: Router,
    private toaster: ToastrService,
    ) {
      this._LoginService.getIdUser().subscribe(data=>{
      if(localStorage.length>0){
        this.enviUrl = environment.apiUrl;
        this.id_usuario=this._EncriptadorService.recuperarlocalstory('idusuario')
        this.token= this._EncriptadorService.recuperarlocalstory('token')
        if(!this.token){
          localStorage.clear()
          this.ruta.navigate(['/']);
        }
        else{
          if(JSON.parse(this.token)==data[0]?.xtoken){//misma pestaña
            let fechaa = moment(data[0].fechaserv);
            let fechab = moment(data[0].fechacul);
            let difdias=(fechab.diff(fechaa, 'days'))+1;
            if(difdias<0){
              localStorage.clear();
              this.ruta.navigate(['/']);
              return;
            }
            let builder = new HubConnectionBuilder();
            this.hubConnection = builder.withUrl(this.enviUrl + "/api/signalr",{
              skipNegotiation:true,
              transport:signalR.HttpTransportType.WebSockets
              }).withAutomaticReconnect().build();
            this.hubConnection.serverTimeoutInMilliseconds = 1000000;// 1000 second
            //nos suscribimos para poder escuchar si alguien dice chat
            this.hubConnection.on( 'chatalert', (mensaje) => {
              this.emalert.emit(mensaje)
              // let data: Respuestaemiter = JSON.parse(mensaje);
              // this.emNotificacion.emit(data);
              // console.log('fff');
            });
            this.hubConnection.on('conectados',(mensaje)=>{
              // console.log(mensaje)
              this.emconectados.emit(mensaje);
            })
            this.hubConnection.on('mensajes',(mensaje)=>{
              this.emmensajes.emit(mensaje);
            })
            this.hubConnection.on('mensaje2',(mensaje1,mensaje2,mensaje3,mensaje4,mensaje5)=>{
              // console.log(mensaje1,mensaje2,mensaje3,mensaje4,mensaje5)
              let msj:mensaje
              msj={id_sala: mensaje1,mensaje:mensaje2,id_usuario:mensaje3,envia:mensaje4,tipo:mensaje5}
              this.emchat.emit(msj);
              //this.emmensajes.emit(mensaje);
            })
            this.hubConnection.on('logout',(mensaje)=>{
              this.logoutpest.emit(mensaje);
            })
            //presupuesto
            this.hubConnection.on('actuaAccesop',(datos) => {
              this.actaccesoproy.emit(datos);
            });
            this.hubConnection.on('Presudifer',(datos) => {
              this.actuaVista.emit(datos);
            });
            this.hubConnection.on('RefNoti',(datos) => {
              this.refreshNoti.emit(datos);
            });

            this.hubConnection.on('UpdtSistem',(mensaje)=>{
              if(mensaje==1){
                window.location.reload();
              }
            })
            this.hubConnection.start().then(()=>{
              //inicia una proceso en hub del back
              this.hubConnection.invoke("Conectar",this.id_usuario)
              this.hubConnection.invoke("Mensajes2",this.id_usuario)
            }).catch(error => {
              return console.error('signarlr error'+error);
            });
          }
          else{
            //hay otra conexion
            console.log('signalr limpia localsto, metodo /api/consulta/consultarusuario')
            localStorage.clear()
            this.toaster.error('Su sesión ha caducado.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
            console.log('2')
            this.ruta.navigate(['/']);
          }
        }
      }
      else{
        //se limpio el local storage
        console.log('3')
        this.ruta.navigate(['/']);
      }
    })
  }
  ListaDeConectados(){
    let body: HttpParams = new HttpParams();
      body = body.append('id_usuario',this.id_usuario);
    const url = this.enviUrl + '/api/mensajes/conectados';
    return this.http.post<any[]>(url,body)
  }
  ListaDeMensajes(){
    let body: HttpParams = new HttpParams();
    body = body.append('id_usuario',this.id_usuario);
    const url = this.enviUrl + '/api/mensajes/mensajes';
    return this.http.post<any[]>(url,body)
  }
  RecuperarMensajes(id_sala,numero,id_destino){
    this.hubConnection.invoke("MensajeLeido",this.id_usuario,id_destino).catch(()=>{})
      let body: HttpParams = new HttpParams();
      body = body.append('id_usuario',this.id_usuario);
      body = body.append('id_destino',id_destino);
      body = body.append('numero',numero);
    const url = this.enviUrl + '/api/mensajes/chat';
    return this.http.post<any[]>(url,body)
  }
  EnviarMensaje(id_sala:string,mensaje:string,tipo:string,id_destino:string,numero){
    this.hubConnection.invoke("GuardarMensaje",id_sala,this.id_usuario,mensaje,tipo,id_destino).catch((data)=>{
      // console.log(data)
    })
    //return this.RecuperarMensajes(id_sala,numero,id_destino)
  }
  async Desconectar(){
   try{
    if(this.hubConnection){
      this.id_usuario=this._EncriptadorService.recuperarlocalstory('idusuario')
      console.log(this.hubConnection.state)
      await this.hubConnection.invoke("Desconectar",this.id_usuario)
      //this.hubConnection.stop();//cerrar una coneccion
      return null;
    }
    else{
      return 'login';
    }
   }catch(ex){
    console.log(ex)
    return 'login';
   }
  }
  Conectar(){
    if(this.hubConnection){
      console.log(this.hubConnection.state)
      if(this.hubConnection.state=='Connected'){
        this.id_usuario=this._EncriptadorService.recuperarlocalstory('idusuario')
        this.hubConnection.invoke("Conectar",this.id_usuario)
        this.hubConnection.invoke("Mensajes2",this.id_usuario)
      }
    }
    else{
      console.log('no se conecto con signalr')
    }
  }
  ActuaSistem(){
    if(this.hubConnection){
      this.hubConnection.invoke("ActuaSistema","1");
    }
  }
}
