import { Component, OnDestroy, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { SignalrcustomService } from './../../servicios/signalrcustom.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { Subscription } from 'rxjs';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/servicios/login.service';
import {fromEvent} from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AdministradorService } from 'src/app/servicios/administrador.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [
    trigger('notificationBottom', [
      state('an-off, void',
        style({
          overflow: 'hidden',
          height: '0px',
        })
      ),
      state('an-animate',
        style({
          overflow: 'visible',
          height: AUTO_STYLE,
        })
      ),
      transition('an-off <=> an-animate', [
        animate('400ms ease-in-out')
      ])
    ]),
    trigger('slideInOut', [
      state('in', style({
        width: '280px',
        // transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        width: '0',
        // transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('mobileHeaderNavRight', [
      state('nav-off, void',
        style({
          overflow: 'hidden',
          height: '0px',
        })
      ),
      state('nav-on',
        style({
          height: AUTO_STYLE,
        })
      ),
      transition('nav-off <=> nav-on', [
        animate('400ms ease-in-out')
      ])
    ]),
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('mobileMenuTop', [
      state('no-block, void',
        style({
          overflow: 'hidden',
          height: '0px',
        })
      ),
      state('yes-block',
        style({
          height: AUTO_STYLE,
        })
      ),
      transition('no-block <=> yes-block', [
        animate('400ms ease-in-out')
      ])
    ])
  ]
})
export class AdminComponent implements OnInit, OnDestroy {
  nointer=false;
  public netStatus:string;
  //inicio cambios
  /* cui:string;
  descripcion:string; */
  listaConectados: any;
  listaMensajes: any;
  salamensajes: any;
  //mensajes
  mostrarmensajes: boolean = true;
  mostrarcontactos: boolean = false;
  nombresala: string;
  id_sala: string;
  id_destino: string;
  numero: number;
  load2: boolean = false
  load: boolean = false
  alertamensajes: boolean = false;
  //mensajes
  listnotif=[]
  estnot=0;
  RefreshNoti$: Subscription = new Subscription();
  //alertas
  @Input('height') heighttmodal: number = 150;
  mostrar_carga_todo=false;

  public animateSidebar: string;
  public navType: string;
  public themeLayout: string;
  public verticalPlacement: string;
  public verticalLayout: string;
  public pcodedDeviceType: string;
  public verticalNavType: string;
  public verticalEffect: string;
  public vnavigationView: string;
  public freamType: string;
  public sidebarImg: string;
  public sidebarImgType: string;
  public layoutType: string;

  public headerTheme: string;
  public pcodedHeaderPosition: string;

  public liveNotification: string;
  public liveNotificationClass: string;

  public liveTemas: string;
  public liveTemasClass: string;

  public profileNotification: string;
  public profileNotificationClass: string;

  public chatSlideInOut: string;
  public innerChatSlideInOut: string;

  public searchWidth: number;
  public searchWidthString: string;

  public navRight: string;
  public windowWidth: number;
  public chatTopPosition: string;

  public toggleOn: boolean;
  public toggleIcon: string;
  public navBarTheme: string;
  public activeItemTheme: string;
  public pcodedSidebarPosition: string;

  public headerFixedTop: string;

  public menuTitleTheme: string;
  public dropDownIcon: string;
  public subItemIcon: string;

  public configOpenRightBar: string;
  public displayBoxLayout: string;
  public isVerticalLayoutChecked: boolean;
  public isSidebarChecked: boolean;
  public isHeaderChecked: boolean;
  public headerFixedMargin: string;
  public sidebarFixedHeight: string;
  public sidebarFixedNavHeight: string;
  public itemBorderStyle: string;
  public subItemBorder: boolean;
  public itemBorder: boolean;

  public isCollapsedSideBar: string;
  public psDisabled: string;
  public perfectDisable: string;

  public config: any;
  public searchInterval: any;
  temaLight = true
  public principal = true
  //cambios
  public NombreUsuario: string;
  position = 'bottom-right';
  id_usuario: string;
  //cambios
  menuPrincipal$: Subscription = new Subscription()
  arrayTabs$: Subscription = new Subscription()
  mantenerPrincipal$: Subscription = new Subscription()
  scroll = (): void => {
    const scrollPosition = window.pageYOffset;
    if (scrollPosition > 36) {
      if (this.isSidebarChecked === true) {
        this.pcodedSidebarPosition = 'fixed';
      }
      if (this.pcodedDeviceType === 'desktop') {
        this.headerFixedTop = '0';
      }
      this.sidebarFixedNavHeight = '100%';
    } else {
      if (this.pcodedDeviceType === 'desktop') {
        this.headerFixedTop = 'auto';
      }
      this.pcodedSidebarPosition = 'absolute';
      this.sidebarFixedNavHeight = '';
    }
  };
  temasPorUsuario: string;
  arrayTabs: any[];
  menuPrincipal: boolean;
  menubg: string = 'theme1'
  constructor(
    public menuItems: MenuItems,
    private _SignalrcustomService: SignalrcustomService,
    private toastyService: ToastyService,
    public _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private variablesGlobalesService: VariablesGlobalesService,
    private router: Router,
    private servicioLogin: LoginService,
    private toaster: ToastrService,
    private administradorService: AdministradorService
  ) {
    this.animateSidebar = '';
    this.navType = 'st2';
    this.themeLayout = 'vertical';
    this.verticalPlacement = 'left';
    this.verticalLayout = 'wide';
    this.pcodedDeviceType = 'desktop';
    this.verticalNavType = 'expanded';
    this.verticalEffect = 'shrink';
    this.vnavigationView = 'view1';
    this.freamType = 'theme1';
    this.sidebarImg = 'false';
    this.sidebarImgType = 'img1';
    // this.layoutType = 'light'; // light(default) dark(dark)

    // this.headerTheme = 'theme1'; // theme1(default)
    this.pcodedHeaderPosition = 'fixed';

    this.headerFixedTop = 'auto';

    this.liveNotification = 'an-off';
    this.liveTemas = 'an-off';
    this.profileNotification = 'an-off';

    this.chatSlideInOut = 'out';
    this.innerChatSlideInOut = 'out';

    this.searchWidth = 0;

    this.navRight = 'nav-on';

    this.toggleOn = true;
    this.toggleIcon = 'icon-toggle-right';
    // this.navBarTheme = 'themelight1'; // themelight1(default) theme1(dark)
    this.activeItemTheme = 'theme1';
    this.pcodedSidebarPosition = 'fixed';
    this.menuTitleTheme = 'theme1'; // theme1(default) theme10(dark)
    this.dropDownIcon = 'style3';
    this.subItemIcon = 'style7';

    this.displayBoxLayout = 'd-none';
    this.isVerticalLayoutChecked = false;
    this.isSidebarChecked = true;
    this.isHeaderChecked = true;
    this.headerFixedMargin = '35px'; // 56px
    this.sidebarFixedHeight = 'calc(100vh - 60px)'; // calc(100vh - 190px)
    this.itemBorderStyle = 'none';
    this.subItemBorder = true;
    this.itemBorder = true;

    this.isCollapsedSideBar = 'no-block';

    this.perfectDisable = '';

    this.windowWidth = window.innerWidth;

    this.setMenuAttributes(this.windowWidth);
    this.setHeaderAttributes(this.windowWidth);

    // dark theme
    /*this.setLayoutType('dark');*/

    // light-dark
    /*this.setLayoutType('dark');
    this.setNavBarTheme('themelight1');*/

    // dark-light theme
    /*this.setNavBarTheme('theme1');*/

    // box layout
    /*this.setHeaderPosition();
    this.setSidebarPosition();
    this.setVerticalLayout();*/

    // sidebar img
    /*this.setLayoutType('img');*/

  }
  @ViewChild('msj', { static: true }) msjInput: ElementRef;
  ngOnInit() {
    fromEvent(window,'offline').pipe(
      debounceTime(100)).subscribe((event:Event)=>{
        this.toaster.error('Se perdio la conexión a Internet.','', { closeButton: false, positionClass: 'toast-top-center', timeOut: 5000 })
        this.netStatus=event.type;
        this.nointer=true;
        this.mostrar_carga_todo=true;
    });
    fromEvent(window,'online').pipe(
      debounceTime(100)).subscribe((event:Event)=>{
        this.toaster.success('Se recupero la conexión a Internet.','', { closeButton: false, positionClass: 'toast-top-center', timeOut: 5000 })
        this.netStatus=event.type;
        this.nointer=false;
        this.mostrar_carga_todo=false;
    });
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    this.NombreUsuario = JSON.parse(this._EncriptadorService.recuperarlocalstory('nombre'));
    // this.setBackgroundPattern('theme1');
    this.recuperarTemasUsuario()
    this.heighttmodal = document.body.clientHeight - 209;
    this.load = true

    this._SignalrcustomService.Conectar();

    this._SignalrcustomService.emalert.subscribe((mensaje) => {
      if (this.innerChatSlideInOut != 'in')
        this.alertamensajes = true;
    })
    this._SignalrcustomService.emconectados.subscribe((mensaje) => {
      this._SignalrcustomService.ListaDeConectados().subscribe((data) => {
        this.listaConectados = data;
        this.load = false
      })
    })
    this._SignalrcustomService.emmensajes.subscribe((mensaje) => {
      this._SignalrcustomService.ListaDeMensajes().subscribe((data) => {
        // console.log('mensajes: '+mensaje)
        this.listaMensajes = data;
        this.load = false
      })
    })
    this._SignalrcustomService.emchat.subscribe((mensaje) => {
      // console.log('emchat: '+mensaje)
      if (mensaje.id_usuario != this.id_usuario) {
        if (this.id_sala == undefined && this.id_destino == mensaje.envia && this.innerChatSlideInOut === 'in') {
          this.id_sala = mensaje.id_sala;
          let hoy = new Date();
          let fecha = "hoy " + this.addZero(hoy.getHours()) + ':' + this.addZero(hoy.getMinutes())
          this.salamensajes.push({ "id_sala": this.id_sala, "nombreSala": this.nombresala, "iddestino": this.id_usuario, "nombre": "", "id_usuario": this.id_destino, "mensaje": mensaje.mensaje, "fecha": fecha, "tipo": mensaje.tipo, "estado": "0" });
          this.salamensajes = this.salamensajes
        }
        if (this.id_sala == mensaje.id_sala && this.id_destino != undefined && this.innerChatSlideInOut === 'in') {
          let hoy = new Date();
          let fecha = "hoy " + this.addZero(hoy.getHours()) + ':' + this.addZero(hoy.getMinutes())
          this.salamensajes.push({ "id_sala": this.id_sala, "nombreSala": this.nombresala, "iddestino": this.id_usuario, "nombre": "", "id_usuario": this.id_destino, "mensaje": mensaje.mensaje, "fecha": fecha, "tipo": mensaje.tipo, "estado": "0" });
          this.salamensajes = this.salamensajes
        }
      }
      else {
        if (this.salamensajes[this.salamensajes.length - 1].mensaje != mensaje.mensaje) {
          if (this.id_sala == undefined && this.id_destino == mensaje.envia && this.innerChatSlideInOut === 'in') {
            this.id_sala = mensaje.id_sala;
            let hoy = new Date();
            let fecha = "hoy " + this.addZero(hoy.getHours()) + ':' + this.addZero(hoy.getMinutes())
            this.salamensajes.push({ "id_sala": this.id_sala, "nombreSala": this.nombresala, "iddestino": this.id_destino, "nombre": "", "id_usuario": this.id_usuario, "mensaje": mensaje.mensaje, "fecha": fecha, "tipo": mensaje.tipo, "estado": "0" });
            this.salamensajes = this.salamensajes
          }
          if (this.id_sala == mensaje.id_sala && this.id_destino != undefined && this.innerChatSlideInOut === 'in') {
            let hoy = new Date();
            let fecha = "hoy " + this.addZero(hoy.getHours()) + ':' + this.addZero(hoy.getMinutes())
            this.salamensajes.push({ "id_sala": this.id_sala, "nombreSala": this.nombresala, "iddestino": this.id_destino, "nombre": "", "id_usuario": this.id_usuario, "mensaje": mensaje.mensaje, "fecha": fecha, "tipo": mensaje.tipo, "estado": "0" });
            this.salamensajes = this.salamensajes
          }
        }
      }
    })
    //listar asincronamente
    this.ListarNotif();
    this.RefreshNoti$ = this._SignalrcustomService.refreshNoti.subscribe(
      (mensaje) => {
        if(mensaje=="Listar Notificaciones"){
          this.ListarNotif();
        }
      }
    );
    this._SignalrcustomService.logoutpest.subscribe((mensaje) => {
      const iduserlocal = this._EncriptadorService.recuperarlocalstory('idusuario')
      if(!iduserlocal || mensaje==iduserlocal)
        //window.location.reload();
        this.router.navigate(['/']);
    })
    this.menuPrincipal$ = this.variablesGlobalesService.menuPrincipal.subscribe(data => {
      if (this.menuPrincipal != data) {
        this.menuPrincipal = data
        if (this.menuPrincipal) {
          // this.verticalNavType = 'expanded';
         this.toggleOpened()
        } else {
          this.verticalNavType = 'offcanvas';
          this.toggleOn = false
          // this.onClickedOutsideSidebar()
        }
      }
    })
    // const principal = JSON.parse(localStorage.getItem('principal'))
    // if (principal) {
    //   this.verticalNavType = 'expanded';
    //   // this.variablesGlobalesService.menuPrincipal.next(true)
    //   // localStorage.setItem('principal', JSON.stringify(true))
    //   console.log('lsp');
    // } else {

    //   const url = this.router.url
    //   console.log('url', url);
      
    //   if (url !== '/principal/proyects/principal') {
    //     console.log('url !prin');
    //     this.verticalNavType = 'offcanvas';
    //     // this.verticalNavType = 'expanded';
    //     this.menuPrincipal = true
    //   } else {
    //     console.log('url prin');
    //     this.menuPrincipal = false
    //   }
    // }
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Puedes realizar acciones aquí antes de que la pestaña se cierre, si la ruta es principal, proyectos limpiar variable de local storage
    const url = this.router.url;
    if(url=='/principal/proyects/principal'){
      this._EncriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(false));
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = event.target.innerWidth;
    this.setHeaderAttributes(this.windowWidth);
    let reSizeFlag = true
    if (this.pcodedDeviceType === 'tablet' && this.windowWidth >= 768 && this.windowWidth <= 992) {
      reSizeFlag = false;
    } else if (this.pcodedDeviceType === 'phone' && this.windowWidth < 768) {
      reSizeFlag = false;
    }
    /* for check device */
    if (reSizeFlag) {
      this.setMenuAttributes(this.windowWidth);
    }
    return
  }
  async ListarNotif(){
    this.listnotif=await this.administradorService.listarNotif({todo:0})
    if(this.listnotif.length>0){
      this.estnot=1;
      for(let row of this.listnotif){
        if(row.estado==2){
          this.estnot=2;
          break;
        }
      }
    }
    else{
      this.estnot=0;
    }
  }

  recuperarTemasUsuario() {
    this.temasPorUsuario = localStorage.getItem('configtema')
    if (this.temasPorUsuario) {
      const temas = this.temasPorUsuario.split('|')
      this.layoutType = temas[0]
      this.headerTheme = temas[1]
      this.activeItemTheme = temas[2]
      this.menuTitleTheme = temas[3]
      this.menubg = temas[4]
      this.setBackgroundPattern(this.headerTheme)
      this.cambiarColorMenu(this.menubg)
    }
    document.querySelector('body').classList.add(this.layoutType);
  }

  addToast(options) {
    if (options.closeOther) {
      this.toastyService.clearAll();
    }
    this.position = options.position ? options.position : this.position;
    const toastOptions: ToastOptions = {
      title: options.title,
      msg: options.msg,
      showClose: options.showClose,
      timeout: options.timeout,
      theme: options.theme,
      onAdd: (toast: ToastData) => {
        /* added */
      },
      onRemove: (toast: ToastData) => {
        /* removed */
      }
    };

    switch (options.type) {
      case 'default': this.toastyService.default(toastOptions); break;
      case 'info': this.toastyService.info(toastOptions); break;
      case 'success': this.toastyService.success(toastOptions); break;
      case 'wait': this.toastyService.wait(toastOptions); break;
      case 'error': this.toastyService.error(toastOptions); break;
      case 'warning': this.toastyService.warning(toastOptions); break;
    }
  }
  setHeaderAttributes(windowWidth) {
    if (windowWidth <= 992) {
      this.navRight = 'nav-off';
    } else {
      this.navRight = 'nav-on';
    }
  }

  setMenuAttributes(windowWidth) {
    if (windowWidth >= 768 && windowWidth <= 992) {
      this.pcodedDeviceType = 'tablet';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'overlay';
      this.toggleIcon = 'icon-toggle-left';
      this.headerFixedTop = 'auto';
      this.headerFixedMargin = '0';
    } else if (windowWidth < 768) {
      this.pcodedDeviceType = 'phone';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'overlay';
      this.toggleIcon = 'icon-toggle-left';
      this.headerFixedTop = 'auto';
      this.headerFixedMargin = '0';
    } else {
      this.pcodedDeviceType = 'desktop';
      // this.verticalNavType = 'expanded';
      this.verticalEffect = 'shrink';
      this.toggleIcon = 'icon-toggle-right';
      this.headerFixedMargin = '35px';
      if (this.menuPrincipal) {
        this.verticalNavType = 'expanded';
      } else {
        this.verticalNavType = 'offcanvas';
      }
    }
    
    /*else if (windowWidth >= 1024 && windowWidth < 1366) {
      this.pcodedDeviceType = 'desktop';
      this.verticalNavType = 'collapsed';
      this.verticalEffect = 'shrink';
      this.toggleIcon = 'icon-toggle-left';
      this.perfectDisable = 'disabled';
      this.sidebarFixedHeight = '100%';
    }*/
  }

  toggleHeaderNavRight() {
    this.navRight = this.navRight === 'nav-on' ? 'nav-off' : 'nav-on';
    this.chatTopPosition = this.chatTopPosition === 'nav-on' ? '152px' : '';
    if (this.navRight === 'nav-off' && this.innerChatSlideInOut === 'in') {
      this.toggleInnerChat();
    }
    if (this.navRight === 'nav-off' && this.chatSlideInOut === 'in') {
      this.toggleChat();
    }
  }

  toggleLiveNotification() {
    if (this.profileNotification === 'an-animate') {
      this.toggleProfileNotification();
    }

    this.liveNotification = this.liveNotification === 'an-off' ? 'an-animate' : 'an-off';
    this.liveNotificationClass = this.liveNotification === 'an-animate' ? 'active' : '';

    if (this.liveNotification === 'an-animate' && this.innerChatSlideInOut === 'in') {
      this.toggleInnerChat();
    }
    if (this.liveNotification === 'an-animate' && this.chatSlideInOut === 'in') {
      this.toggleChat();
    }
  }

  toggleLiveTemas() {
    if (this.profileNotification === 'an-animate') {
      this.toggleProfileNotification();
    }

    this.liveTemas = this.liveTemas === 'an-off' ? 'an-animate' : 'an-off';
    this.liveTemasClass = this.liveTemas === 'an-animate' ? 'active' : '';



    if (this.liveNotification === 'an-animate' && this.innerChatSlideInOut === 'in') {
      this.toggleInnerChat();
    }
    if (this.liveNotification === 'an-animate' && this.chatSlideInOut === 'in') {
      this.toggleChat();
    }
  }

  toggleProfileNotification() {
    if (this.liveNotification === 'an-animate') {
      this.toggleLiveNotification();
    }

    this.profileNotification = this.profileNotification === 'an-off' ? 'an-animate' : 'an-off';
    this.profileNotificationClass = this.profileNotification === 'an-animate' ? 'active' : '';

    if (this.profileNotification === 'an-animate' && this.innerChatSlideInOut === 'in') {
      this.toggleInnerChat();
    }
    if (this.profileNotification === 'an-animate' && this.chatSlideInOut === 'in') {
      this.toggleChat();
    }
  }

  notificationOutsideClick(ele: string) {
    if (ele === 'live' && this.liveNotification === 'an-animate') {
      this.toggleLiveNotification();
    } else if (ele === 'profile' && this.profileNotification === 'an-animate') {
      this.toggleProfileNotification();
    }
  }

  temasOutsideClick(ele: string) {

    if (ele === 'live' && this.liveTemas === 'an-animate') {
      this.toggleLiveTemas();
    } else if (ele === 'profile' && this.profileNotification === 'an-animate') {
      this.toggleProfileNotification();
    }
  }

  toggleChat() {
    if (this.innerChatSlideInOut === 'in') {
      this.innerChatSlideInOut = 'out';
    } else {
      this.alertamensajes = false;
      this.chatSlideInOut = this.chatSlideInOut === 'out' ? 'in' : 'out';
    }
  }

  toggleInnerChat() {
    this.innerChatSlideInOut = this.innerChatSlideInOut === 'out' ? 'in' : 'out';
  }

  searchOn() {
    document.querySelector('#main-search').classList.add('open');
    this.searchInterval = setInterval(() => {
      if (this.searchWidth >= 200) {
        clearInterval(this.searchInterval);
        return false;
      }
      this.searchWidth = this.searchWidth + 15;
      this.searchWidthString = this.searchWidth + 'px';
    }, 30);
  }

  searchOff() {
    this.searchInterval = setInterval(() => {
      if (this.searchWidth <= 0) {
        document.querySelector('#main-search').classList.remove('open');
        clearInterval(this.searchInterval);
        return false;
      }
      this.searchWidth = this.searchWidth - 15;
      this.searchWidthString = this.searchWidth + 'px';
    }, 30);
  }

  ngOnDestroy() {
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
    }
    this.menuPrincipal$.unsubscribe()
  }

  toggleOpened(e?) {
    if (!this.menuPrincipal) {
      return
    }
    if (this.windowWidth <= 992) {
      // this.toggleOn = this.verticalNavType === 'offcanvas' ? true : this.toggleOn;
      if (this.navRight === 'nav-on') {
        this.toggleHeaderNavRight();
      }
      this.verticalNavType = this.verticalNavType === 'expanded' ? 'offcanvas' : 'expanded';
    } else {
      this.verticalNavType = this.verticalNavType === 'expanded' ? 'offcanvas' : 'expanded';
    }
    this.toggleIcon = this.verticalNavType === 'expanded' ? 'icon-toggle-right' : 'icon-toggle-left';
    this.animateSidebar = 'pcoded-toggle-animate';

    if (this.verticalNavType === 'collapsed') {
      this.perfectDisable = 'disabled';
      this.sidebarFixedHeight = '100%';
    } else {
      this.perfectDisable = '';
    }

    if (this.verticalNavType === 'collapsed' && this.isHeaderChecked === false) {
      this.setSidebarPosition();
    }

    setTimeout(() => {
      this.animateSidebar = '';
    }, 500);
  }

  onClickedOutsideSidebar(e?: Event) {
    // if (!this.menuPrincipal) {
    //    return
    // }    
    if ((this.windowWidth <= 992 && this.toggleOn && this.verticalNavType !== 'offcanvas')) {
      this.toggleOn = true;
      this.verticalNavType = 'offcanvas';
      this.toggleIcon = 'icon-toggle-left';
      
    }
  }

  toggleRightbar() {
    this.configOpenRightBar = this.configOpenRightBar === 'open' ? '' : 'open';
  }

  setNavBarTheme(theme: string) {
    // if (theme === 'themelight1') {
    //   this.navBarTheme = 'themelight1';
    //   this.menuTitleTheme = 'theme1';
    //   this.sidebarImg = 'false';
    // } else {
    //   this.menuTitleTheme = 'theme9';
    //   this.navBarTheme = 'theme1';
    //   this.sidebarImg = 'false';
    // }
  }

  async setLayoutType(type: string) {

    if (type === 'dark') {
      // this.headerTheme = 'theme1';
      // this.navBarTheme = 'theme1';
      // this.activeItemTheme = 'theme1';
      // this.freamType = 'theme1';
      // this.menuTitleTheme = 'theme9';
      document.querySelector('body').classList.add('dark');
      // this.setBackgroundPattern('theme1');
      this.layoutType = type;
      this.sidebarImg = 'false';
    } else if (type === 'light') {
      // this.headerTheme = 'theme1';
      // this.navBarTheme = 'themelight1';
      // this.menuTitleTheme = 'theme1';
      // this.activeItemTheme = 'theme1';
      // this.freamType = 'theme1';
      document.querySelector('body').classList.remove('dark');
      // this.setBackgroundPattern('theme1');
      this.layoutType = type;
      this.sidebarImg = 'false';
    } else if (type === 'img') {
      // this.sidebarImg = 'true';
      // this.navBarTheme = 'themelight1';
      // this.menuTitleTheme = 'theme1';
      // this.freamType = 'theme1';
      // document.querySelector('body').classList.remove('dark');
      // this.setBackgroundPattern('theme1');
      // this.activeItemTheme = 'theme1';
    }
    await this.almacenarConfiguracion()
  }

  setVerticalLayout() {
    this.isVerticalLayoutChecked = !this.isVerticalLayoutChecked;
    if (this.isVerticalLayoutChecked) {
      this.verticalLayout = 'box';
      this.displayBoxLayout = '';
      this.pcodedHeaderPosition = 'relative';
      this.pcodedSidebarPosition = 'absolute';
      this.headerFixedMargin = '';
    } else {
      this.verticalLayout = 'wide';
      this.displayBoxLayout = 'd-none';
      this.pcodedHeaderPosition = 'fixed';
      this.pcodedSidebarPosition = 'fixed';
      this.headerFixedMargin = '35px';
    }
  }

  async setBackgroundPattern(pattern: string) {
    document.querySelector('body').setAttribute('themebg-pattern', pattern);
    // this.menuTitleTheme = this.freamType = this.activeItemTheme = this.headerTheme = pattern;
    // this.changeTheme(pattern)
    await this.almacenarConfiguracion()
  }

  changeTheme(pattern) {
    const body = document.querySelector('.body')
    if (!body) { return }
    if (body.classList.contains(pattern)) {
      body.classList.remove(pattern)
      body.classList.add(pattern)
    }

  }
  setSidebarPosition() {
    if (this.verticalNavType !== 'collapsed') {
      this.isSidebarChecked = !this.isSidebarChecked;
      this.pcodedSidebarPosition = this.isSidebarChecked === true ? 'fixed' : 'absolute';
      this.sidebarFixedHeight = this.isSidebarChecked === true ? 'calc(100vh - 36px)' : '100%';
      if (this.isHeaderChecked === false) {
        window.addEventListener('scroll', this.scroll, true);
        window.scrollTo(0, 0);
      }
    }
  }

  setHeaderPosition() {
    this.isHeaderChecked = !this.isHeaderChecked;
    this.pcodedHeaderPosition = this.isHeaderChecked === true ? 'fixed' : 'relative';
    this.headerFixedMargin = this.isHeaderChecked === true ? '35px' : '';
    if (this.isHeaderChecked === false) {
      window.addEventListener('scroll', this.scroll, true);
      window.scrollTo(0, 0);
    } else {
      window.removeEventListener('scroll', this.scroll, true);
      if (this.pcodedDeviceType === 'desktop') {
        this.headerFixedTop = 'auto';
      }
      this.pcodedSidebarPosition = 'fixed';
      if (this.verticalNavType !== 'collapsed') {
        this.sidebarFixedHeight = this.isSidebarChecked === true ? 'calc(100vh - 30px)' : 'calc(100vh + 30px)';
      }
    }
  }

  toggleOpenedSidebar() {
    this.isCollapsedSideBar = this.isCollapsedSideBar === 'yes-block' ? 'no-block' : 'yes-block';
    if (this.verticalNavType !== 'collapsed') {
      this.sidebarFixedHeight = this.isCollapsedSideBar === 'yes-block' ? 'calc(100vh - 30px)' : 'calc(100vh - 30px)';
    }
  }

  hoverOutsideSidebar() {
    if (this.verticalNavType === 'collapsed') {
      const mainEle = document.querySelectorAll('.pcoded-trigger');
      for (let i = 0; i < mainEle.length; i++) {
        mainEle[i].classList.remove('pcoded-trigger');
      }
    }
  }

  fireClick(e) {
    if (this.verticalNavType === 'collapsed') {
      const parentEle = e.target.parentNode.parentNode;
      if (parentEle.classList.contains('pcoded-trigger')) {
        const subEle = parentEle.querySelectorAll('.pcoded-hasmenu');
        for (let i = 0; i < subEle.length; i++) {
          if (subEle[i].classList.contains('pcoded-trigger')) {
            subEle[i].classList.remove('pcoded-trigger');
          }
        }
      } else {
        e.target.click();
      }
    }
  }

  fireClickLeave(e) {
    if (this.verticalNavType === 'collapsed') {
      const parentEle = <HTMLElement>e.target.parentNode.parentNode;
      const subEle = parentEle.querySelectorAll('.pcoded-hasmenu');
      for (let i = 0; i < subEle.length; i++) {
        if (subEle[i].classList.contains('pcoded-trigger')) {
          subEle[i].classList.remove('pcoded-trigger');
        }
      }
    }
  }

  tema() {
    this.temaLight = !this.temaLight
  }
  Irainicio() {
    const principal = JSON.parse(localStorage.getItem('principal'))
    const url = this.router.url
    if (url === '/principal/proyects/principal' && !principal) {
      this.variablesGlobalesService.menuPrincipal.next(true)
      this.variablesGlobalesService.mantenerPrincipal.next(true)
      localStorage.setItem('principal', JSON.stringify(true))
    }
    else {
      this.router.navigate(['/principal/inicio/']);
    }
  }

  async logout() {
    try {
      //bloquear, si internet lento, demora
      this.mostrar_carga_todo=true;
      await this.servicioLogin.LogoutSis({id_usuario:this.id_usuario,token:''});//dinamico
      let res=await this._SignalrcustomService.Desconectar();
      console.log(res)
      localStorage.clear();
      if((res??'')=='login'){
        this.router.navigate(['/']);
      }
      this.mostrar_carga_todo=false;
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo=false;
      this.router.navigate(['/']);
    }
  }
  ClickContactos() {
    this.mostrarcontactos = true;
    this.mostrarmensajes = false;
  }
  ClickMenasajes() {
    this.mostrarcontactos = false;
    this.mostrarmensajes = true;
  }
  cargarChat(id_sala, nombreSala, id_destino) {
    this.numero = 1;
    this.salamensajes = []
    this.toggleInnerChat();
    this.load2 = true
    this._SignalrcustomService.RecuperarMensajes(id_sala, this.numero, id_destino).subscribe((data) => {
      this.salamensajes = data
      this.nombresala = nombreSala
      this.id_sala = id_sala/* data[0].id_sala; */
      this.id_destino = id_destino;
      this.msjInput.nativeElement.focus();
      this.load2 = false
    })
  }

  BotonEnviarMsj() {
    this.EnterEnviarMsj();
  }
  addZero(i) {
    if (i < 10) { i = "0" + i }
    return i;
  }
  EnterEnviarMsj() {
    let tipo = "1"
    let hoy = new Date();
    let fecha = "hoy " + this.addZero(hoy.getHours()) + ':' + this.addZero(hoy.getMinutes())
    // const filterValue = (event.target as HTMLInputElement).value;
    // (event.target as HTMLInputElement).value="";
    const filterValue = $("#msj").val();
    $("#msj").val("")
    this._SignalrcustomService.EnviarMensaje(this.id_sala.toString(), filterValue.toString(), tipo, this.id_destino.toString(), this.numero)
    this.salamensajes.push({ "id_sala": this.id_sala, "nombreSala": this.nombresala, "iddestino": this.id_destino, "nombre": "", "id_usuario": this.id_usuario, "mensaje": filterValue, "fecha": fecha, "tipo": tipo, "estado": "0" });
    this.salamensajes = this.salamensajes
  }


  async almacenarConfiguracion() {
    try {
      if (localStorage.length > 0) {
        const idUsuarioLocalStorage = this._EncriptadorService.recuperarlocalstory('idusuario')
        const temasArray = this.layoutType + '|' + this.headerTheme + '|' + this.activeItemTheme + '|' + this.menuTitleTheme + '|' + this.menubg
        await this.configuracionService.ModificarConfigTema(idUsuarioLocalStorage, temasArray)
        localStorage.setItem('configtema', temasArray)
      }
    } catch (e) {
      SwalService.error()
      console.log(e)
    }
  }

  regresarMenuPrincipal() {
    this.variablesGlobalesService.menuPrincipal.next(true)
    this.variablesGlobalesService.mantenerPrincipal.next(true)
    localStorage.setItem('principal', JSON.stringify(true))
  }

  async cambiarColorMenu(colorMenu) {
    this.menubg = colorMenu
    await this.almacenarConfiguracion()
    // document.querySelector('body').setAttribute('menubg-pattern', colorMenu);
  }
}
