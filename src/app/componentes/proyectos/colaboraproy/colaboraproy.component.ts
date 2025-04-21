import { Component, OnInit,HostListener, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

@Component({
  selector: 'app-colaboraproy',
  templateUrl: './colaboraproy.component.html',
  styleUrls: ['./colaboraproy.component.scss']
})
export class ColaboraproyComponent implements OnInit {
  mostrar_carga=false;
  mostrar_carga_todo=false;
  datasourcesis=[];
  fila_sel=-1;
  height=100;
  busqueda='';
  buscando=false;
  buscando2=false;
  idUsuario;
  nomUsuario;
  secundarios=[];
  titulos=[];
  tablaPrinc=[];
  fila_sel2=-1;
  proysel:any;
  tablaUser=[];
  ocultadet=true;
  @ViewChild("modDeta") modalEditar: ModalBasicComponent;
  valactivo=true;

  constructor(
    private principalService: PrincipalService,
    private encriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    public metradoService: MetradoService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
    }
    if (document.body.clientWidth < 768) {
      this.ocultadet=true;
    }
    else{
      this.ocultadet=false;
    }
    this.height = window.innerHeight - resto;
    this.idUsuario = await this.encriptadorService.recuperarlocalstory('idusuario');
    let nomb=await this.encriptadorService.recuperarlocalstory('nombre');
    this.nomUsuario = JSON.parse(nomb);
    await this.onListar()
    await this.ListarSec();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
    }
    this.height = window.innerHeight - resto;
    if (document.body.clientWidth < 768) {
      this.ocultadet=true;
    }
    else{
      this.ocultadet=false;
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async onListar() {
    try {
      this.datasourcesis = [];
      this.buscando = true;
      this.datasourcesis = await this.principalService.ListarProyectos(this.idUsuario);
      this.buscando = false;
    }
    catch {
      this.buscando = false;
    }
  }
  async ListarSec(){
    this.secundarios=await this.configuracionService.ListarUsuariosSecundarios({id_admin:this.idUsuario});
  }
  async listarTitulos(idproy:any) {
    const response = await this.metradoService.listarTitulosDeMetrados({ id_proyecto: idproy });
    if(response){
      this.titulos=response;
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  cambindicesel(row: any, ind: any) {
    if (row.nro == "") {
      if (ind == this.fila_sel)
        this.fila_sel = -1;
      else
        this.fila_sel = row.id_proyecto;
    }
  }
  toggleOn(id: string) {
    for (let row of this.datasourcesis) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff(id: string) {
    for (let row of this.datasourcesis) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  cambindicesel2(ind:any){
    this.fila_sel2=ind;
  }
  async SelecProy(row:any){
    try{
      if(this.ocultadet){
        this.modalEditar.show();
      }
      //cargar usuarios
      this.valactivo=row.asignado==1?true:false;
      this.tablaUser=[];
      this.tablaUser.push({user:'Principal',nombres:this.nomUsuario.replace('"',''),edpresu:'1',menu_proy:'1|1|1|1|1|1|1|1|1'});
      for(let fil=0;fil<this.secundarios.length;fil++){
        this.tablaUser.push({user:'Secundario '+(fil+1),nombres:this.secundarios[fil].nombres,edpresu:this.secundarios[fil].edpresu,menu_proy:this.secundarios[fil].menu_proy});
      }
      this.proysel=row.id_proyecto;
      this.tablaPrinc=[];
      this.buscando2 = true;
      await this.listarTitulos(row.id_proyecto);
      let datos=await this.principalService.ListarProyAsig({id_proyecto:row.id_proyecto});
      this.tablaPrinc=[];
      console.log(datos)
      if(datos?.length>0){
        let addfil=this.crearFila(1,0,1,null,'PRESUPUESTO DIRECTO',datos[0].presu,datos.length>=2?datos[1].presu:0,datos.length>=3?datos[2].presu:0,datos.length>=4?datos[3].presu:0,datos.length>=5?datos[4].presu:0,1);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(2,0,2,null,'COSTOS INDIRECTOS',datos[0].indir,datos.length>=2?datos[1].indir:0,datos.length>=3?datos[2].indir:0,datos.length>=4?datos[3].indir:0,datos.length>=5?datos[4].indir:0,2);
        this.tablaPrinc.push(addfil);
        //addfil=this.crearFila(3,0,3,null,'HOJAS DE METRADO',datos[0].metra/* this.titulos.length>0?3:1 */,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0);
        addfil=this.crearFila(3,0,3,null,'HOJAS DE METRADO',datos[0].metra,datos.length>=2?datos[1].metra:(this.titulos.length>0?3:0),datos.length>=3?datos[2].metra:(this.titulos.length>0?3:0),
        datos.length>=4?datos[3].metra:(this.titulos.length>0?3:0),datos.length>=5?datos[4].metra:(this.titulos.length>0?3:0),3);
        this.tablaPrinc.push(addfil);
        let titmetra1=JSON.parse(datos[0].titmetra);
        let titmetra2=datos.length>=2?JSON.parse(datos[1].titmetra):[];
        let titmetra3=datos.length>=3?JSON.parse(datos[2].titmetra):[];
        let titmetra4=datos.length>=4?JSON.parse(datos[3].titmetra):[];
        let titmetra5=datos.length>=5?JSON.parse(datos[4].titmetra):[];
        for(let row of this.titulos){
          //verificar titulos y asignar si existe, sino por defecto
          let objenc1=titmetra1.find(ele=>ele.ind==row.indice);
          let objenc2=titmetra2.find(ele=>ele.ind==row.indice);
          let objenc3=titmetra3.find(ele=>ele.ind==row.indice);
          let objenc4=titmetra4.find(ele=>ele.ind==row.indice);
          let objenc5=titmetra5.find(ele=>ele.ind==row.indice);
          //addfil=this.crearFila('',1,3,row.indice,row.descripcion,1,0,0,0,0);
          addfil=this.crearFila('',1,3,row.indice,row.item+' '+row.descripcion,objenc1?objenc1.edit:1,objenc2?objenc2.edit:0,objenc3?objenc3.edit:0,objenc4?objenc4.edit:0,objenc5?objenc5.edit:0,3);
          this.tablaPrinc.push(addfil);
        }
        addfil=this.crearFila(4,0,4,null,'FÓRMULA POLINÓMICA',datos[0].formu,datos.length>=2?datos[1].formu:0,datos.length>=3?datos[2].formu:0,datos.length>=4?datos[3].formu:0,datos.length>=5?datos[4].formu:0,4);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(5,0,5,null,'PROGRAMACIÓN DE OBRA',datos[0].progra,datos.length>=2?datos[1].progra:0,datos.length>=3?datos[2].progra:0,datos.length>=4?datos[3].progra:0,datos.length>=5?datos[4].progra:0,6);
        this.tablaPrinc.push(addfil);
        //addfil=this.crearFila(6,0,6,null,'ESPECIFICACIONES TÉCNICAS',datos[0].espec,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0);
        addfil=this.crearFila(6,0,6,null,'ESPECIFICACIONES TÉCNICAS',datos[0].espec,datos.length>=2?datos[1].espec:(this.titulos.length>0?3:0),datos.length>=3?datos[2].espec:(this.titulos.length>0?3:0),
        datos.length>=4?datos[3].espec:(this.titulos.length>0?3:0),datos.length>=5?datos[4].espec:(this.titulos.length>0?3:0),7);
        this.tablaPrinc.push(addfil);
        let titespec1=JSON.parse(datos[0].titespec);
        let titespec2=datos.length>=2?JSON.parse(datos[1].titespec):[];
        let titespec3=datos.length>=3?JSON.parse(datos[2].titespec):[];
        let titespec4=datos.length>=4?JSON.parse(datos[3].titespec):[];
        let titespec5=datos.length>=5?JSON.parse(datos[4].titespec):[];
        for(let row of this.titulos){
          //verificar titulos y asignar si existe, sino por defecto 
          let objenc1=titespec1.find(ele=>ele.ind==row.indice);
          let objenc2=titespec2.find(ele=>ele.ind==row.indice);
          let objenc3=titespec3.find(ele=>ele.ind==row.indice);
          let objenc4=titespec4.find(ele=>ele.ind==row.indice);
          let objenc5=titespec5.find(ele=>ele.ind==row.indice);
          //addfil=this.crearFila('',1,6,row.indice,row.descripcion,1,0,0,0,0);
          addfil=this.crearFila('',1,6,row.indice,row.item+' '+row.descripcion,objenc1?objenc1.edit:1,objenc2?objenc2.edit:0,objenc3?objenc3.edit:0,objenc4?objenc4.edit:0,objenc5?objenc5.edit:0,7);
          this.tablaPrinc.push(addfil);
        }
      }
      else{
        let addfil=this.crearFila(1,0,1,null,'PRESUPUESTO DIRECTO',1,0,0,0,0,1);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(2,0,2,null,'COSTOS INDIRECTOS',1,0,0,0,0,2);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(3,0,3,null,'HOJAS DE METRADO',this.titulos.length>0?3:1,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,3);
        this.tablaPrinc.push(addfil);
        for(let row of this.titulos){
          addfil=this.crearFila('',1,3,row.indice,row.item+' '+row.descripcion,1,0,0,0,0,3);
          this.tablaPrinc.push(addfil);
        }
        addfil=this.crearFila(4,0,4,null,'FÓRMULA POLINÓMICA',1,0,0,0,0,4);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(5,0,5,null,'PROGRAMACIÓN DE OBRA',1,0,0,0,0,6);
        this.tablaPrinc.push(addfil);
        addfil=this.crearFila(6,0,6,null,'ESPECIFICACIONES TÉCNICAS',this.titulos.length>0?3:1,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,this.titulos.length>0?3:0,7);
        this.tablaPrinc.push(addfil);
        for(let row of this.titulos){
          addfil=this.crearFila('',1,6,row.indice,row.item+' '+row.descripcion,1,0,0,0,0,7);
          this.tablaPrinc.push(addfil);
        }
      }
      this.buscando2 = false;
    }
    catch(e){
      console.log(e);
      this.buscando2=false;
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
  }
  crearFila(anro:any,atipo:any,aident:any,aindtit:any,adesc:any,auser1:any,auser2:any,auser3:any,auser4:any,auser5:any,clave:any){
    let objadd={
      nro:anro,
      tipo:atipo,//0 acceso,1 titulo
      ident:aident,
      indice:aindtit,
      descripcion:adesc,
      usuario1:this.secundarios.length>=0?auser1:2,
      usuario2:this.secundarios.length>=1?auser2:2,
      usuario3:this.secundarios.length>=2?auser3:2,
      usuario4:this.secundarios.length>=3?auser4:2,
      usuario5:this.secundarios.length>=4?auser5:2,
      clave:clave//1:presu,2:indirecto,3:metrados,4:formula,6:programacion,7:espectec
    }
    return objadd;
  }
  cambiaEst(user:any,ind:any){
    if(!this.valactivo){
      this.toaster.error('Habilitar la Asignación para poder editar la tabla.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      return;
    }
    if(user==1){
      if(this.tablaUser.length>0){
        if(this.tablaUser[0].edpresu==0 && ind==0){//fila presupuesto
          this.toaster.error('No tiene opcion de Edicion de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        let arrmen=this.tablaUser[0].menu_proy.split('|');//[asp,presu.indir,metra,formu,tiem,progra,espec],ifc
        if(arrmen[this.tablaPrinc[ind].clave]==0){
          this.toaster.error('El tipo de usuario no tienen Acceso a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            return;
        }
      }
      if(this.tablaPrinc[ind].usuario1==0){
        this.tablaPrinc[ind].usuario1=1;
        this.tablaPrinc[ind].usuario2=this.tablaPrinc[ind].usuario2==2?2:0;
        this.tablaPrinc[ind].usuario3=this.tablaPrinc[ind].usuario3==2?2:0;
        this.tablaPrinc[ind].usuario4=this.tablaPrinc[ind].usuario4==2?2:0;
        this.tablaPrinc[ind].usuario5=this.tablaPrinc[ind].usuario5==2?2:0;
      }
      else if(this.tablaPrinc[ind].usuario1==3){
        for(let row of this.tablaPrinc){
          if(this.tablaPrinc[ind].tipo==0 && row.tipo==1 && this.tablaPrinc[ind].ident==row.ident){
            row.usuario1=row.usuario1==2?2:1;
            row.usuario2=row.usuario2==2?2:0;
            row.usuario3=row.usuario3==2?2:0;
            row.usuario4=row.usuario4==2?2:0;
            row.usuario5=row.usuario5==2?2:0;
          }
        }
      }
    }
    if(user==2){
      if(this.tablaUser.length>1){
        if(this.tablaUser[1].edpresu==0 && ind==0){//fila presupuesto
          this.toaster.error('No tiene opcion de Edicion de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        let arrmen=this.tablaUser[1].menu_proy.split('|');//[asp,presu.indir,metra,formu,tiem,progra,espec],ifc
        if(arrmen[this.tablaPrinc[ind].clave]==0){
          this.toaster.error('El tipo de usuario no tienen Acceso al Proceso Seleccionado.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            return;
        }
      }
      if(this.tablaPrinc[ind].usuario2==0){
        this.tablaPrinc[ind].usuario2=1;
        this.tablaPrinc[ind].usuario1=this.tablaPrinc[ind].usuario1==2?2:0;
        this.tablaPrinc[ind].usuario3=this.tablaPrinc[ind].usuario3==2?2:0;
        this.tablaPrinc[ind].usuario4=this.tablaPrinc[ind].usuario4==2?2:0;
        this.tablaPrinc[ind].usuario5=this.tablaPrinc[ind].usuario5==2?2:0;
      }
      else if(this.tablaPrinc[ind].usuario2==3){
        for(let row of this.tablaPrinc){
          if(this.tablaPrinc[ind].tipo==0 && row.tipo==1 && this.tablaPrinc[ind].ident==row.ident){
            row.usuario1=row.usuario1==2?2:0;
            row.usuario2=row.usuario2==2?2:1;
            row.usuario3=row.usuario3==2?2:0;
            row.usuario4=row.usuario4==2?2:0;
            row.usuario5=row.usuario5==2?2:0;
          }
        }
      }
    }
    if(user==3){
      if(this.tablaUser.length>2){
        if(this.tablaUser[2].edpresu==0 && ind==0){//fila presupuesto
          this.toaster.error('No tiene opcion de Edicion de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        let arrmen=this.tablaUser[2].menu_proy.split('|');//[asp,presu.indir,metra,formu,tiem,progra,espec],ifc
        if(arrmen[this.tablaPrinc[ind].clave]==0){
          this.toaster.error('El tipo de usuario no tienen Acceso al Proceso Seleccionado.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            return;
        }
      }
      if(this.tablaPrinc[ind].usuario3==0){
        this.tablaPrinc[ind].usuario3=1;
        this.tablaPrinc[ind].usuario2=this.tablaPrinc[ind].usuario2==2?2:0;
        this.tablaPrinc[ind].usuario1=this.tablaPrinc[ind].usuario1==2?2:0;
        this.tablaPrinc[ind].usuario4=this.tablaPrinc[ind].usuario4==2?2:0;
        this.tablaPrinc[ind].usuario5=this.tablaPrinc[ind].usuario5==2?2:0;
      }
      else if(this.tablaPrinc[ind].usuario3==3){
        for(let row of this.tablaPrinc){
          if(this.tablaPrinc[ind].tipo==0 && row.tipo==1 && this.tablaPrinc[ind].ident==row.ident){
            row.usuario1=row.usuario1==2?2:0;
            row.usuario2=row.usuario2==2?2:0;
            row.usuario3=row.usuario3==2?2:1;
            row.usuario4=row.usuario4==2?2:0;
            row.usuario5=row.usuario5==2?2:0;
          }
        }
      }
    }
    if(user==4){
      if(this.tablaUser.length>3){
        if(this.tablaUser[3].edpresu==0 && ind==0){//fila presupuesto
          this.toaster.error('No tiene opcion de Edicion de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        let arrmen=this.tablaUser[3].menu_proy.split('|');//[asp,presu.indir,metra,formu,tiem,progra,espec],ifc
        if(arrmen[this.tablaPrinc[ind].clave]==0){
          this.toaster.error('El tipo de usuario no tienen Acceso al Proceso Seleccionado.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            return;
        }
      }
      if(this.tablaPrinc[ind].usuario4==0){
        this.tablaPrinc[ind].usuario4=1;
        this.tablaPrinc[ind].usuario2=this.tablaPrinc[ind].usuario2==2?2:0;
        this.tablaPrinc[ind].usuario3=this.tablaPrinc[ind].usuario3==2?2:0;
        this.tablaPrinc[ind].usuario1=this.tablaPrinc[ind].usuario1==2?2:0;
        this.tablaPrinc[ind].usuario5=this.tablaPrinc[ind].usuario5==2?2:0;
      }
      else if(this.tablaPrinc[ind].usuario4==3){
        for(let row of this.tablaPrinc){
          if(this.tablaPrinc[ind].tipo==0 && row.tipo==1 && this.tablaPrinc[ind].ident==row.ident){
            row.usuario1=row.usuario1==2?2:0;
            row.usuario2=row.usuario2==2?2:0;
            row.usuario3=row.usuario3==2?2:0;
            row.usuario4=row.usuario4==2?2:1;
            row.usuario5=row.usuario5==2?2:0;
          }
        }
      }
    }
    if(user==5){
      if(this.tablaUser.length>4){
        if(this.tablaUser[4].edpresu==0 && ind==0){//fila presupuesto
          this.toaster.error('No tiene opcion de Edicion de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        let arrmen=this.tablaUser[4].menu_proy.split('|');//[asp,presu.indir,metra,formu,tiem,progra,espec],ifc
        if(arrmen[this.tablaPrinc[ind].clave]==0){
          this.toaster.error('El tipo de usuario no tienen Acceso al Proceso Seleccionado.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            return;
        }
      }
      if(this.tablaPrinc[ind].usuario5==0){
        this.tablaPrinc[ind].usuario5=1;
        this.tablaPrinc[ind].usuario2=this.tablaPrinc[ind].usuario2==2?2:0;
        this.tablaPrinc[ind].usuario3=this.tablaPrinc[ind].usuario3==2?2:0;
        this.tablaPrinc[ind].usuario4=this.tablaPrinc[ind].usuario4==2?2:0;
        this.tablaPrinc[ind].usuario1=this.tablaPrinc[ind].usuario1==2?2:0;
      }
      else if(this.tablaPrinc[ind].usuario5==3){
        for(let row of this.tablaPrinc){
          if(this.tablaPrinc[ind].tipo==0 && row.tipo==1 && this.tablaPrinc[ind].ident==row.ident){
            row.usuario1=row.usuario1==2?2:0;
            row.usuario2=row.usuario2==2?2:0;
            row.usuario3=row.usuario3==2?2:0;
            row.usuario4=row.usuario4==2?2:0;
            row.usuario5=row.usuario5==2?2:1;
          }
        }
      }
    }
  }
  async Guardar(){
    try{
      if(this.buscando2){
        this.toaster.error('Esperar a que cargue la informacion de la tabla antes de guardar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        return;
      }
      //si hay temporales no puedo cambiar
      this.mostrar_carga_todo=true;
      let tabadd=[];
      let arrtits1=[];
      let arrtits2=[];
      let objadd={
        id_proyecto:this.proysel,
        id_usuario:this.idUsuario,
        presu:null,
        indir:null,
        metra:null,
        titmetra:null,
        formu:null,
        progra:null,
        espec:null,
        titespec:null,
      }
      //generar objeto, usuario principal
      for(let a=0;a<this.tablaPrinc.length;a++){
        if(this.tablaPrinc[a].tipo==0){//acceso
          objadd.presu=this.tablaPrinc[a].ident==1?this.tablaPrinc[a].usuario1:objadd.presu;
          objadd.indir=this.tablaPrinc[a].ident==2?this.tablaPrinc[a].usuario1:objadd.indir;
          objadd.metra=this.tablaPrinc[a].ident==3?this.tablaPrinc[a].usuario1:objadd.metra;
          objadd.formu=this.tablaPrinc[a].ident==4?this.tablaPrinc[a].usuario1:objadd.formu;
          objadd.progra=this.tablaPrinc[a].ident==5?this.tablaPrinc[a].usuario1:objadd.progra;
          objadd.espec=this.tablaPrinc[a].ident==6?this.tablaPrinc[a].usuario1:objadd.espec;
        }
        else{//titulo
          if(this.tablaPrinc[a].ident==3){
            arrtits1.push({ind: this.tablaPrinc[a].indice,edit:this.tablaPrinc[a].usuario1});
          }
          else if(this.tablaPrinc[a].ident==6){
            arrtits2.push({ind: this.tablaPrinc[a].indice,edit:this.tablaPrinc[a].usuario1});
          }
        }
      }
      objadd.titmetra=JSON.stringify(arrtits1);
      objadd.titespec=JSON.stringify(arrtits2);
      tabadd.push(objadd)
      //generar objeto usuarios sec
      for(let b=0;b<this.secundarios.length;b++){
        arrtits1=[];
        arrtits2=[];
        objadd={
          id_proyecto:this.proysel,
          id_usuario:this.secundarios[b].id_usuario,
          presu:null,
          indir:null,
          metra:null,
          titmetra:null,
          formu:null,
          progra:null,
          espec:null,
          titespec:null,
        }
        for(let a=0;a<this.tablaPrinc.length;a++){
          if(this.tablaPrinc[a].tipo==0){//acceso
            objadd.presu=this.tablaPrinc[a].ident==1?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.presu;
            objadd.indir=this.tablaPrinc[a].ident==2?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.indir;
            objadd.metra=this.tablaPrinc[a].ident==3?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.metra;
            objadd.formu=this.tablaPrinc[a].ident==4?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.formu;
            objadd.progra=this.tablaPrinc[a].ident==5?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.progra;
            objadd.espec=this.tablaPrinc[a].ident==6?this.tablaPrinc[a]['usuario'+(b+2)]:objadd.espec;
          }
          else{//titulo
            if(this.tablaPrinc[a].ident==3){
              arrtits1.push({ind: this.tablaPrinc[a].indice,edit:this.tablaPrinc[a]['usuario'+(b+2)]});
            }
            else if(this.tablaPrinc[a].ident==6){
              arrtits2.push({ind: this.tablaPrinc[a].indice,edit:this.tablaPrinc[a]['usuario'+(b+2)]});
            }
          }
        }
        objadd.titmetra=JSON.stringify(arrtits1);
        objadd.titespec=JSON.stringify(arrtits2);
        tabadd.push(objadd)
      }
      const body = JSON.stringify({
        'id_proyecto': this.proysel,
        'asignado':this.valactivo?'1':'0',
        'datos1': JSON.stringify(tabadd),
      });
      let resp=await this.principalService.GuardarProyAsig(body);
      if (resp.id == "1") {
        this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        for(let row of this.datasourcesis){
          if(row.id_proyecto==this.proysel){
            row.asignado=this.valactivo?'1':'0';
            break;
          }
        }
      }
      else {
        this.toaster.error(resp.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
      this.mostrar_carga_todo=false;
    }
    catch(e){
      console.log(e)
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
    }
  }
  cerrarModalAcc(){
    this.modalEditar.hide();
  }
  cambioEst(){
    if(!this.valactivo){
      for(let row of this.tablaPrinc){
        row.usuario1=row.usuario1==3?3:1;
        row.usuario2=row.usuario2==2?2:row.usuario2==3?3:0;
        row.usuario3=row.usuario3==2?2:row.usuario3==3?3:0;
        row.usuario4=row.usuario4==2?2:row.usuario4==3?3:0;
        row.usuario5=row.usuario5==2?2:row.usuario5==3?3:0;
      }
    }
  }
}
