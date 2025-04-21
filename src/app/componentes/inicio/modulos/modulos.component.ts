import { Component, OnInit,HostListener } from '@angular/core';
import { DomSanitizer,SafeUrl  } from '@angular/platform-browser';

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.scss']
})
export class ModulosComponent implements OnInit {
  items = [
    { title: 'Banco de Proyectos', description: 'Bandeja donde se encuentra la Base de Datos de los proyectos, ya sea proyectos propios, del Sistema, Compartidos o proyectos Eliminados.', image: 'assets/img-menu/ibancoproy.png', link: '#seccion1' },
    { title: 'Colaboración de Proyectos', description: 'Trabajo colaborativo. Opción con el cual se asigna a uno o varios usuarios, su(s) acceso(s) a edición de uno o varios proyectos para edición de un Módulo especifico.', image: 'assets/img-menu/colabproy.png', link: '#seccion2' },
    { title: 'Catálogos de Partidas', description: 'Modulo que tiene partidas que cuentan con Análisis de Costos Unitarios, Especificaciones Técnicas y Ficha Técnica, data del sistema o data del usuario.', image: 'assets/img-menu/icatalogpart.png', link: '#seccion3' },
    { title: 'Catálogo de Insumos', description: 'Modulo que tiene Insumos del Sistema y del Usuario, estas pueden contener información, Data de Insumos, Ficha Técnica y Catálogos referenciales.', image: 'assets/img-menu/icatalgoins2.png', link: '#seccion4' },
    { title: 'Parámetros Generales', description: 'Modulo en el cual se podrá configurar los Parámetros Generales, Configuración decimales, Visualización y Tipos.', image: 'assets/img-menu/iparmagen.png', link: '#seccion5' },
    { title: 'Características Insumos', description: 'Configuración de Decimales, Visualización y Clasificación Comercial de los Insumos tanto del Sistema como del Usuario.', image: 'assets/img-menu/caracinsumo1.png', link: '#seccion6' },
    { title: 'Índice Unificado', description: 'Parámetros Fijos, Índices Unificados, Actualizados y brindados por el Sistema con su respectiva Normativa.', image: 'assets/img-menu/ind_unificado.png', link: '#seccion7' },
  ];
  
   proyectos = [
    { title: 'Aspecto General Proyecto', description: 'Configuración General de Visualización del Proyecto, Configuración Decimales y contiene Información General del Proyecto.', image: 'assets/img-menu/icaspec1.png', link: '#seccion8' },
    { title: 'Costos y Presupuestos', description: 'Visualiza el Costo Directo donde crea la Hoja de Presupuesto, Análisis de Costos Unitarios, Relación de Insumos y Agrupamiento Comercial.', image: 'assets/img-menu/icpresu1.png', link: '#seccion8' },
    { title: 'Creación Pie de Presupuesto', description: 'Opción donde se crea, edita el pie de Presupuesto, donde se agrega los costos indirectos, dando valores calculables relacionado o no relacionado con el CD.', image: 'assets/img-menu/icpresind1.png', link: '#seccion8' },
    { title: 'Metrado de Proyecto', description: 'Opción donde se registra y edita el metrado del Proyecto, la cual se encuentra vinculado al presupuesto, y cualquier modificación se actualiza entre ambas componentes.', image: 'assets/img-menu/icmetra1.png', link: '#seccion9' },
    { title: 'Formula Polinómica', description: 'Componente donde se creará la Formula Polinómica. Se agruparán los Índices unificados de precios de la construcción de acuerdo al decreto 011-79-VC.', image: 'assets/img-menu/icformula1.png', link: '#seccion10' },
    { title: 'Programación de Tiempos', description: 'Componente donde se editará Información General de la Programación. Así como se realizará el Cálculo de Programación de tiempos de M.O y Equipos.', image: 'assets/img-menu/ictiempro1.png', link: '#seccion11' },
    { title: 'Programación de Obra', description: 'Componente donde se creará y editará la programación Gantt, Cronograma Valorizado, Cronograma Desembolso, Gráficos de Curva S y Campana de Gauss.', image: 'assets/img-menu/icprogra1.png', link: '#seccion11' },
    { title: 'Especificaciones Técnicas', description: 'Componente donde se creará las Especificaciones Técnicas, con la Inteligencia de análisis del Sistema. la cual está vinculado con el Presupuesto en ambas direcciones.', image: 'assets/img-menu/icespe1.png', link: '#seccion12' },
  ];

  openSections: Set<number> = new Set();

  toggleSection(sectionId: number): void {
    if (this.openSections.has(sectionId)) {
      this.openSections.delete(sectionId);  
    } else {
      this.openSections.add(sectionId);    
    }
  }
  isSectionOpen(sectionId: number): boolean {
    return this.openSections.has(sectionId);
  }
  screenWidth: number;
  isMobile: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.isMobile = this.screenWidth < 600;
  }
  menuActive = false;

  selectedSection='section2'
  currentIcono = 'assets/log.png';
  async navigateTo(link: string): Promise<void> {
    const element = await document.querySelector(link);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      const sectionId = parseInt(link.replace('#seccion', ''), 10);
      this.toggleSection(sectionId); 
    }
  }
  
  next() {
    const totalItems = this.items.length;
    this.currentIndexCarrusel = (this.currentIndexCarrusel + 1) % totalItems;
  }

  prev() {
    const totalItems = this.items.length;
    this.currentIndexCarrusel = (this.currentIndexCarrusel - 1 + totalItems) % totalItems; // Ciclo hacia la card anterior
  }
  next2() {
    const totalItems = this.items.length;
    this.currentIndexCarruse2 = (this.currentIndexCarruse2 + 1) % totalItems;
  }

  prev2() {
    const totalItems = this.items.length
    this.currentIndexCarruse2 = (this.currentIndexCarruse2 - 1 + totalItems) % totalItems; // Ciclo hacia la card anterior
  }
  goToSlide(index: number) {
    this.currentIndex = index; // Cambia el índice actual
  }
  goToSlide2(index: number) {
    this.currentIndex2 = index; // Cambia el índice actual
  }
  goToSlide3(index: number) {
    this.currentIndex3 = index; // Cambia el índice actual
  }
  goToSlide4(index: number) {
    this.currentIndex4 = index; // Cambia el índice actual
  }
  goToSlide5(index: number) {
    this.currentIndex5 = index; // Cambia el índice actual
  }
  goToSlide6(index: number) {
    this.currentIndex6 = index; // Cambia el índice actual
  }
  goToSlide7(index: number) {
    this.currentIndex7 = index; // Cambia el índice actual
  }
  goToSlide8(index: number) { 1
    this.currentIndex8 = index; // Cambia el índice actual
  }
  goToSlide9(index: number) { 1
    this.currentIndex9 = index; // Cambia el índice actual
  }
  goToSlide10(index: number) { 1
    this.currentIndex10 = index; // Cambia el índice actual
  }
  goToSlide11(index: number) { 1
    this.currentIndex11 = index; // Cambia el índice actual
  }
  goToSlide12(index: number) { 1
    this.currentIndex12 = index; // Cambia el índice actual
  }


  currentIndex = 0;
  currentIndex2 = 0;
  currentIndex3 = 0;
  currentIndex4 = 0;
  currentIndex5 = 0;
  currentIndex6 = 0;
  currentIndex7 = 0;
  currentIndex8 = 0;
  currentIndex9 = 0;
  currentIndex10 = 0;
  currentIndex11 = 0;
  currentIndex12 = 0;
  currentIndexCarrusel = 0;
  currentIndexCarruse2 = 0;
  section1Media = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/8uekujvprjckstfikaf60/1Banco.png?rlkey=qhm0aumfdl1ebpv9ixsr5fcpl&st=dfrk1t2i&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/5713pb4997k1b70cyw2yr/11Banco.png?rlkey=1gtdfeh4exx69sdv49ifplg98&st=kvavjjff&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/egj23kbl39msb4udaih1o/12Banco.png?rlkey=nx5fitewofmx2qcsmd3em41io&st=kw1l15px&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/42jg0thly01zsqe7g1evp/13Banco.png?rlkey=e9eniq4ccsu3ihssn2m0y8e8o&st=c4s778we&raw=1')},
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/3mf1ihmz8fnzm3gi1jhjw/2Proyecto.mp4?rlkey=8lhs0gqswso5ydkhok43yk5pe&st=pr278e4z&raw=1')},
  ];

  section1Media2 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/k64g0e7v8rif7mnanzpsu/3Colaboracion.png?rlkey=1fuscxr11xsvoqe7w78jaapwc&st=kmlkp1pw&raw=1') },
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/3i8o6ozs0gxcvwx0gxaez/4Proyectos.mp4?rlkey=jr8qy12sdx6fgyivmkoe4nudj&st=vweau80t&raw=1')}
  ];
  section1Media3 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/ic0rlxm28eu8ir0ywefzo/5Catalagos.png?rlkey=4ab06dr98tvxgt795pbx758ci&st=qzljrck7&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/zwnvtv5zpk9b0wcv5a8nf/6Partidas.png?rlkey=22106wzy7icqs422pjk8tjb7c&st=bt6vi020&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/f67e023xcu9famtutlpc4/7Catalagos.png?rlkey=6pfnv76yzis5k8xa3myc0x5n3&st=allw6bjd&raw=1') },
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/gei069ejt7k94wmf66aw1/8Partidas.mp4?rlkey=tvzlraqk0pn6invtop2py4fhf&st=e64nquch&raw=1') }
  ];
  section1Media4 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/yh5e84zhsptvvugyztk0k/1Aspectos.png?rlkey=kb4pu0lsp8kbcokdbndfcfmx2&st=68vwrw79&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/8wxv9gfpqxw7ackdadml4/2Generales.png?rlkey=b04kv01e1mmylw0w3bc8bb18a&st=e1wsaii7&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/yz56iiaq1oiz7xizzl3hd/3Presupuesto.png?rlkey=6jfg0nf0qntrf53eof9iiy8ea&st=s66g61b2&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/2kwopmjxprfjuynu46rl8/4Costo.png?rlkey=xegvizcj6rwnfnqfbeu924wbb&st=xz5c2n3s&raw=1') },
    { type: 'youtube', src: this.getSanitizedYoutubeUrl('https://www.youtube.com/watch?v=A0jLfwCF93A') },
  ];
  section1Media5 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/53jnm84g8mkm12p1259yc/1Resumen.png?rlkey=j5q45sb5ac7n5zoivkx96a7j6&st=kxhgev49&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/g1xhsfzw2wt211a54x2xt/2Hoja.png?rlkey=lo31yz1xj8s2e553lvschuoqp&st=h5n51pfj&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/nwr8xpglu23du0erxg85t/3Hoja.png?rlkey=ao7q6qst0p1sx3s30irer2zrg&st=mcxdj3cl&raw=1')},
    { type: 'youtube', src: this.getSanitizedYoutubeUrl('https://www.youtube.com/watch?v=6bFwlxtuTyQ') }
  ];
  section1Media6 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/138fzznwro15k9x6frflq/1Panel.png?rlkey=d1wd93bhby5d5589j0xyvhn78&st=f56yvqco&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/o3ywczr5caeeua7zre238/2Agrupamiento.png?rlkey=qqclwscgitiohxk87t0yjfe5d&st=3ix4h89l&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/o8ds40h7kjzd2qoex90wf/3Indices.png?rlkey=ne9x20r3fng8ma11pj8y2eqix&st=jsrjja57&raw=1') },
    { type: 'youtube', src: this.getSanitizedYoutubeUrl('https://www.youtube.com/watch?v=WrtKPxbc2_g') }
  ];
  section1Media7 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/b0s30lnzear8z6nmjeloa/1Configuracion.png?rlkey=ckvh6frjla4dn16jvkuxaeeqf&st=dzgt7da5&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/64i4w2h2ky1yviq6kk1sg/2Programacion.png?rlkey=6wohfeitzepyfol3b301tzold&st=d9zdjct4&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/nb13tvqugl468b0wdec2q/3Gantt.png?rlkey=ww8vl55mpxur2cep6gy9yg592&st=szik276q&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/krtx6j1bncfx38nxrmb3k/4Cronograma.png?rlkey=jblssnd63tvnl76qrhfwx9ovk&st=rrs3tccl&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/vtqbexgc3bvqspoc618be/5Adquisiciones.png?rlkey=v3tx2c5fgpv2xeokfvlalz4m8&st=bag1whb5&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/0ihpmcph2qg6e0rabqlyg/6Grafico.png?rlkey=kc99z1aks6wdfv0kfj7xvlynf&st=am17h12w&raw=1') },
    { type: 'youtube', src: this.getSanitizedYoutubeUrl('https://www.youtube.com/watch?v=kIcCFofz2cw') }
  ];
  section1Media8 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/3xctncmnxgk27l1kw0yc1/1.Resumen.png?rlkey=ukevwxgw3n057bpnczbogpylj&st=6ddl0i2x&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/b3vr949fkb2maxni1u7c5/2.Plantilla.png?rlkey=wcyluji8dl6317tw2f4779tgy&st=sqbhosw8&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/rz8vo7h6mrs7hqq1oc078/3Creacion.png?rlkey=1klrxu1dodj2fnex6s2v6wxbb&st=pwm9b7b9&raw=1') },
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/rgevhpxehdmfkv1axxiz5/4Especifi.png?rlkey=2mneiohg1jwyhbnko68u01i9d&st=k1zsk11y&raw=1') },
    { type: 'youtube', src: this.getSanitizedYoutubeUrl('https://www.youtube.com/watch?v=-ir-wqgG8Ts') }
  ];
  //faltan
  section1Media9 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/jml7lwjujn4l2c5nx0d4l/1Insumos.png?rlkey=gp3w2s2x9b4t51c03899ifmfb&st=cpepdvsm&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/xlirfsckibspqzdfzqjma/2insumos.png?rlkey=looae8o4gdoj71dycvf2f09k7&st=pbvb4hen&raw=1')},
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/116epvz2sitdy7d2s3m1k/3CatalogoInsumos.mp4?rlkey=7mrmcts09zcqwletjoq335o83&st=9r8qv621&raw=1')},
  ];
  section1Media10 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/ddq3nd9wym2k7sequn40h/4Paraemetros.png?rlkey=s04yedabxr4lh0x6kjn724dbu&st=zc5gepf2&raw=1')},
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/lsv8kf0ofa4744godhvmc/5Clasificacion.png?rlkey=nlvttplag12o0s1h89fecbsdn&st=phc62aja&raw=1')},
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/t0ro6y2ugshk5zd6abtuc/6Parametros.mp4?rlkey=co46prukr6t318f90a9njv82q&st=ujwmcgua&raw=1')},
  ];
  section1Media11 = [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/pyv0np99isbmda2j3otbp/7Caracteristicas.png?rlkey=oqi8bfra7qk5gwpekycypxas2&st=41npca3t&raw=1')},
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/shk0lvihcfi1r9rz9pebx/8Caracteristicas.mp4?rlkey=cmrlays8j9wzjbyssyssrwiet&st=4w44aa1x&raw=1')},
  ];
  section1Media12= [
    { type: 'image', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/58yqngd0zvzvinezipsoi/9Unificado.png?rlkey=9h0s6ogahudim2mg7w4ie0bwc&st=o9t3cgd3&raw=1')},
    { type: 'video', src: this.sanitizeUrl('https://www.dropbox.com/scl/fi/hpoj64l1wu155dyty0sop/10Unificado.mp4?rlkey=8hk5dpel6bmuk5tzhshiyntw1&st=decymfvz&raw=1')},
  ];

  
  currentImage = 'assets/sky.jpg'; // Cambia esta ruta según tus necesidades
  currentImage2
  currentMedia: any
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  openLightbox(index: number, sectionIndex: number) {
    this.currentMedia = this[`section1Media${sectionIndex}`]; // Selecciona el arreglo correcto
    this.currentImage2 = this.currentMedia[index].src; // Establece la imagen actual
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'flex'; // Muestra el lightbox
    }
}

  closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      if (lightbox) {
          lightbox.style.display = 'none'; // Oculta el lightbox
      }
  }


  safeUrl

  constructor(private sanitizer: DomSanitizer) {
    this.isMobile = window.innerWidth < 800; // Detectar dispositivo móvil
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  getSanitizedYoutubeUrl(url: string): SafeUrl {
    const youtubeUrl = url.replace('watch?v=', 'embed/'); // Convertir la URL de 'watch?v=' a 'embed/'
    return this.sanitizer.bypassSecurityTrustResourceUrl(youtubeUrl); // Sanitizar la URL para usarla en un iframe
  }
  


  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.isMobile = this.screenWidth < 600;
  }

}
