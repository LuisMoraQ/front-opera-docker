import { Component, OnInit, Input, ChangeDetectorRef, HostListener, ViewChild} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {SelectionModel} from '@angular/cdk/collections';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from '../../../servicios/configuracion.service';
import { SwalService } from '../../../servicios/swal.service'

export interface filaorg {
  id_tipo: string;
  nombre: string;
  abrev: string;
  seleccion: string;
  arbol:string;
  estado:any;
  fecha_ing:string;
  fecha_mod:string;
  most:any;
}
export class GameNode {
  children: BehaviorSubject<GameNode[]>;
  constructor(public name: string,public state:string,public type:string,public icon:string,public accion:boolean, children?: GameNode[]) {
    this.children = new BehaviorSubject(children === undefined ? [] : children);
  }
}
const TREE_DATA = [];
@Component({
  selector: 'app-tipouser',
  templateUrl: './tipouser.component.html',
  styleUrls: ['./tipouser.component.scss']
})
export class TipouserComponent implements OnInit {
  @Input('height')  height: number=100;
  mostrar_carga=false;
  mostrar_carga_todo=false;
  buscando1=false;
  busqueda='';
  mensaje_res:string;
  //tree
  levels = new Map<GameNode, number>();
  treeControl: FlatTreeControl<GameNode>;
  treeFlattener: MatTreeFlattener<GameNode, GameNode>;
  dataSource: MatTreeFlatDataSource<GameNode, GameNode>;
  dataareas:[];
  dataar_sel:[];
  //tabla principal
  displayedColumnorg: string[] = ['id_tipo','nom_tipo','abrev','estado','fecha_ing','fecha_mod','acciones'];
  dataSourceorg= new  MatTableDataSource<filaorg>();
  filaorg_sel:any;
  @ViewChild('table1', { read: MatSort, static: true }) sort1: MatSort;
  @ViewChild("modalAddTipo") modaltipo: ModalBasicComponent;
  @ViewChild("modalVerTipo") modalvtipo: ModalBasicComponent;
  @ViewChild('tabset')tabset: any;
  id_tipo:string;
  nombre:string;
  abrev:string;
  estado:any;
  arrmenuproy=[{desc:'Aspectos Generales Proyecto',activo:1},{desc:'Edición del Presupuesto',activo:1},{desc:'Diseño de Costos Indirectos',activo:1},{desc:'Hoja de Metrados',activo:1},
    {desc:'Formula Polinomica',activo:1},{desc:'Tiempo de Programación',activo:1},{desc:'Programacion de Obra',activo:1},{desc:'Especificaciones Tecnicas',activo:1},{desc:'Visor de Planos',activo:1}
  ];
  titmodalcar:string;
  public nuevoTipo :UntypedFormGroup;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private configuracionService: ConfiguracionService,
    private formBuilder: UntypedFormBuilder,
    private toaster: ToastrService,
  ) {
    //tree
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
      this.treeControl = new FlatTreeControl<GameNode>(
      this.getLevel, this.isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.dataSource.data = TREE_DATA;
  }

  getLevel = (node: GameNode): number => {
    return this.levels.get(node) || 0;
  };
  isExpandable = (node: GameNode): boolean => {
    return node.children.value.length > 0;
  };
  getChildren = (node: GameNode) => {
    return node.children;
  };
  transformer = (node: GameNode, level: number) => {
    this.levels.set(node, level);
    return node;
  }
  hasChildren = (index: number, node: GameNode) => {
    return this.isExpandable(node);
  }
  /** La selección para la lista de verificación */
  checklistSelection = new SelectionModel<GameNode>(true /* multiple */);
  /** Si se seleccionan todos los descendientes del nodo */
  descendantsAllSelected(node: GameNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    if (!descendants.length) {
      return this.checklistSelection.isSelected(node);
    }
    const selected = this.checklistSelection.isSelected(node);
    const allSelected = descendants.every(child => this.checklistSelection.isSelected(child));
    if (!selected && allSelected) {
      this.checklistSelection.select(node);
      this.changeDetectorRef.markForCheck();
    }
    return allSelected;
  }

  /** Si se selecciona parte de los descendientes */
  descendantsPartiallySelected(node: GameNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    if (!descendants.length) {
      return false;
    }
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Alternar la selección de juegos. Seleccionar / deseleccionar todos los nodos descendientes */
  nodeSelectionToggle(node: GameNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants, node)
      : this.checklistSelection.deselect(...descendants, node);
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    var resto=200;
    if(document.body.clientWidth<=992)
      resto=220;
    this.height=window.innerHeight-resto;
    this.onListar();
    this.listarTree();
    
    this.nuevoTipo = this.formBuilder.group({
      Estado:[true,Validators.required],
      Nombre: ['',Validators.required],
      Abrev: [''],
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto=200;
    if(document.body.clientWidth<=992)
      resto=220;
    this.height=window.innerHeight-resto;
  }

  listarTree(){
    TREE_DATA.splice(0,TREE_DATA.length);
    TREE_DATA.push(new GameNode("DATA DEL SISTEMA","proyects","","",false,[//nombre,ruta(para concatenar,puede ser vacio)
      /* new GameNode("Proyectos Realizados","ejemplo","sub","icofont icofont-growth",false,[//nombre,ruta(para concatenar),tipo("sub":para desplegar,"link":boton que muestra contenido en body),icono
        new GameNode("Dashboard de RRHH","confparam","","",true),
        new GameNode("KPI de RRHH","confparam","","",true),
      ]), */
      new GameNode("BANCO DE PROYECTOS","principal","link","ibancoproy.png",false,[]),
      new GameNode("COLABORACION EN PROYECTOS","asignafunc","link","colabproy.png",false,[]),
      new GameNode("CATALOGO DE PARTIDAS","catpartidas","link","icatalogpart.png",false,[]),
      new GameNode("CATALOGO DE INSUMOS","catinsumos","link","icatalgoins2.png",false,[]),
    ]));
    TREE_DATA.push(new GameNode("CONFIGURACIÓN","catalog","","",false,[
      new GameNode("PARAMETROS GENERALES","confparam","link","iparmagen.png",false,[]),
      new GameNode("CARACTERISTICAS DE INSUMO","undusuario","link","caracinsumo1.png",false,[]),
    ]));
    TREE_DATA.push(new GameNode("USUARIO","configs","","",false,[
      new GameNode("PERFIL DE USUARIO","confperfil","link","TIPO_USUARIO.png",false,[]),
      new GameNode("MANUAL DE USUARIO","manuser","link","imanual.png",false,[]),
    ]));
    TREE_DATA.push(new GameNode("PARAMETROS FIJOS","configs","","",false,[
      new GameNode("INDICE UNIFICADO","indiunif","link","ind_unificado.png",false,[]),
      new GameNode("PROVEEDORES","proveedlect","link","zproveedor2.png",false,[]),//solo visual
    ]));
    TREE_DATA.push(new GameNode("ADMINISTRADOR","adminis","","",false,[
      new GameNode("TIPOS DE USUARIO","tipouser","link","TIPO_USUARIO.png",false,[]),
      new GameNode("LICENCIAS Y NOTIFICACIONES","licencias","link","LICENCIAS.png",false,[]),
      new GameNode("CONFIGURACION MONEDAS/PAISES","monedas","link","zproveedor2.png",false,[]),
      new GameNode("MANTENIMIENTO USUARIOS","mantuser","link","MANTENIMIENTO_USUARIO.png",false,[]),
      new GameNode("DETALLE INSUMOS","detalleinsumo","link","zcarac-insumo.png",false,[]),
      new GameNode("CARACTERISTICAS INSUMO","caracteristicas-insumo","link","caracinsumo1.png",false,[]),
      new GameNode("DATA INSUMOS","datainsumo","link","icatalgoins2.png",false,[]),
      new GameNode("PARTIDAS SISTEMA","partidas-sistema","link","zpartidas2.png",false,[]),
      new GameNode("PROYECTOS DEL SISTEMA","proysistem","link","ibancoproy.png",false,[]),
      new GameNode("PROVEEDORES SISTEMA","proveedores","link","zproveedor2.png",false,[]),//editable
    ]));
    
    this.dataSource.data = TREE_DATA;
  }
  //recuperar datos
  async onListar(){
    try{
      this.dataSourceorg.data=[];
      this.buscando1=true;
      this.dataSourceorg.data=await this.configuracionService.ManteTiposUsuarios();
      this.dataSourceorg.sort = this.sort1;
      this.buscando1=false;
    }
    catch{
      this.buscando1=false;
    }
  }
  applyFilterPrinc(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceorg.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceorg.paginator) {
      this.dataSourceorg.paginator.firstPage();
    }
  }
  limpiarfiltro(){
    this.busqueda='';
    if(this.busqueda=='')
      this.dataSourceorg.filter="";
  }
  cambindicesel(ind:any){
    if(ind==this.filaorg_sel)
      this.filaorg_sel=-1;
    else
      this.filaorg_sel=ind;
  }
  //abrir modales
  openModalGuardar(){
    this.mostrar_carga=true;
    this.listarTree();
    this.nuevoTipo = this.formBuilder.group({
      Estado:[true,Validators.required],
      Nombre: ['',Validators.required],
      Abrev: [''],
    });
    this.titmodalcar="Registro de Tipo";
    this.tabset.select('tab1');
    this.mostrar_carga=false;
    for(let row of this.arrmenuproy){
      row.activo=1;
    }
    this.modaltipo.show();
  }
  openModalEditar(row){
    this.mostrar_carga=true;
    this.id_tipo=row.id_tipo;

    this.nuevoTipo = this.formBuilder.group({
      Estado:[row.estado=="1"?true:false,Validators.required],
      Nombre: [row.nom_tipo, Validators.required],
      Abrev: [row.abrev],
    });
    this.listarTree();

    if(row.seleccion!=null)
    {
      var parti=row.seleccion.toString().split(',');
      for(var i=0;i<this.dataSource.data.length;i++){
        var nod=this.getChildren(this.dataSource.data[i]);//datasource.data[i] principal  | nod=hijos
        for(var j=0;j<nod.value.length;j++){
          var hijos=this.getChildren(nod.value[j]);
          if(hijos.value.length>0){
            for(var k=0;k<hijos.value.length;k++){
              if(this.existe_valor(parti,hijos.value[k].name))//padres.value[j]  hijos(nivel 3)
              {
                this.nodeSelectionToggle(hijos.value[k]);
              }
            }
          }
          else{
            if(this.existe_valor(parti,nod.value[j].name))//padres.value[j]  hijos(nivel 3)
              {
                this.nodeSelectionToggle(nod.value[j]);
              }
          }
        }
      }
    }
    this.tabset.select('tab1');
    this.titmodalcar="Modificar Tipo";
    let arrmenp=row.menu_proy?.split('|');
    console.log(row.menu_proy)
    for(let a=0;a< this.arrmenuproy.length;a++){
      this.arrmenuproy[a].activo=arrmenp[a];
    }
    this.mostrar_carga=false;
    this.modaltipo.show();
  }
  openModalVer(row){
    this.id_tipo=row.id_cargo;
    this.estado=row.estado=="1"?true:false;
    this.nombre=row.nom_tipo;
    this.abrev=row.abrev;
    this.modalvtipo.show();
  }
  cerrarModal(){
    //limpiar valores
    this.checklistSelection.clear();
    this.modaltipo.hide();
  }
  cerrarModal2(){
    this.id_tipo="";
    this.nombre="";
    this.abrev="";
    this.estado=false;
    this.modalvtipo.hide();
  }
  async guardar(){
    if(!this.nuevoTipo.invalid)
    {
      this.mostrar_carga_todo=true;
      //obtener valor
      var cargos_sel=[];
      var str_sel="";
      var seleccionados=this.checklistSelection.selected;
      for(var i=0;i<seleccionados.length;i++){
        /* if(seleccionados[i].accion) */
          cargos_sel.push(seleccionados[i].name);
          str_sel=str_sel+seleccionados[i].name+",";
      }
      str_sel=str_sel.substring(0,str_sel.length-1);
      var completo=this.dataSource.data;
      var arb_sel:GameNode[];
      arb_sel=[];
      for(var i=0;i<completo.length;i++){
        var padres=this.getChildren(completo[i]);//completo[i] principales  padres(nivel 2)
        var pa;
        var padres_sel=[];
        for(var j=0;j<padres.value.length;j++)
        {
          var hijos_sel=[];
          var ntres=this.getChildren(padres.value[j]);
          for(var k=0;k<ntres.value.length;k++)
          {
            if(this.existe_valor(cargos_sel,ntres.value[k].name))//padres.value[j]  hijos(nivel 3)
            {
              hijos_sel.push(ntres.value[k]);
            }
          }
          if(hijos_sel.length>0)//condicionar si no tiene hijos, pero si tiene state agregar
          {
            pa=new GameNode(padres.value[j].name,padres.value[j].state,padres.value[j].type,padres.value[j].icon,padres.value[j].accion,hijos_sel);
            padres_sel.push(pa);
          }
          else{
            if(padres.value[j].state!=''){
              if(this.existe_valor(cargos_sel,padres.value[j].name))//padres.value[j]  hijos(nivel 3)
              {
                pa=new GameNode(padres.value[j].name,padres.value[j].state,padres.value[j].type,padres.value[j].icon,padres.value[j].accion,hijos_sel);
                padres_sel.push(pa);
              }
            }
          }
        }
        if(padres_sel.length>0)
        {
          arb_sel.push(new GameNode(completo[i].name,completo[i].state,completo[i].type,completo[i].icon,completo[i].accion,padres_sel));
        }
      }
      var json="[";
      for(var i=0;i<arb_sel.length;i++)
      {
        json=json+"{\"state\":\""+arb_sel[i].state+"\","+"\"label\":\""+arb_sel[i].name+"\",\"main\":[";
        for(var j=0;j<arb_sel[i].children.value.length;j++){
          json=json+"{\"state\":\""+arb_sel[i].children.value[j].state+"\","+
          "\"name\":\""+arb_sel[i].children.value[j].name+"\","+
          "\"type\":\""+arb_sel[i].children.value[j].type+"\","+
          "\"icon\":\""+arb_sel[i].children.value[j].icon+"\"";
          if(arb_sel[i].children.value[j].children.value.length>0)
          {
            json=json+",\"children\":[";
            for(var k=0;k<arb_sel[i].children.value[j].children.value.length;k++)
            {
              json=json+"{\"state\":\""+arb_sel[i].children.value[j].children.value[k].state+"\","+
              "\"name\":\""+arb_sel[i].children.value[j].children.value[k].name+"\"},";
            }
            json=json.substring(0,json.length-1);
            json=json+"]"
          }
          json=json+"},";
        }
        json=json.substring(0,json.length-1);
        json=json+"]},";
      }
      json=json.substring(0,json.length-1);
      json=json+"]";
      if(json.length<2)
        json="NULL";

      if(str_sel=="")
        str_sel="NULL";
      
      //arreglo menu
      let strmenup=[];//indice 0 siempre 1, si tiene 5 o 6 el otro se pone 1
      for(let row of this.arrmenuproy){
        strmenup.push(row.activo);
      }
      strmenup[0]=1;
      strmenup[5]=strmenup[6]==1?1:strmenup[5];
      strmenup[6]=strmenup[5]==1?1:strmenup[6];
      if(this.titmodalcar=="Registro de Tipo")//guardar
      {
        try{
          let res=await this.configuracionService.GuardarTiposUsuarios(this.nuevoTipo.get('Nombre').value.toUpperCase().trim(),this.nuevoTipo.get('Abrev').value.toUpperCase().trim(),
          str_sel,json,this.nuevoTipo.get('Estado').value?1:0,strmenup.join('|'));
          this.mensaje_res=res[0].mensaje;
          this.mostrar_carga_todo=false;
          this.cerrarModal();
          this.onListar();
          if(res[0].id=="1"){
            SwalService.success('',this.mensaje_res);
          }
          else{
            SwalService.error('',this.mensaje_res);
          }
        }
        catch{
          this.mostrar_carga_todo=false;
          /* this.addToast({title:'Advertencia', msg:'Ocurrio una excepción al momento de realizar la operación.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
          this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
      else//modificar
      {
        try{
          let res=await this.configuracionService.ModificarTiposUsuarios(this.id_tipo,this.nuevoTipo.get('Nombre').value.toUpperCase().trim(),this.nuevoTipo.get('Abrev').value.toUpperCase().trim(),
          str_sel,json,this.nuevoTipo.get('Estado').value?1:0,strmenup.join('|'));
          this.mensaje_res=res[0].mensaje;
          this.mostrar_carga_todo=false;
          this.cerrarModal();
          this.onListar();
          if(res[0].id=="1")
            SwalService.success('',this.mensaje_res);
          else
            SwalService.error('',this.mensaje_res);
        }
        catch{
          this.mostrar_carga_todo=false;
          /* this.addToast({title:'Advertencia', msg:'Ocurrio una excepción al momento de realizar la operación.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
          this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
    }
    else
    {
      this.nuevoTipo.get('Nombre').markAsTouched();
      /* this.addToast({title:'Advertencia', msg:'Debe llenar el tipo.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
      this.toaster.error('Debe llenar el tipo.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  existe_valor(arr:any,pal:any):boolean{
    var resp=false;
    for(var i=0;i<arr.length;i++){
      if(arr[i]==pal)
        resp=true;
    }
    return resp;
  }
  async confirmAlert(row) {
    try{
      const respu=await SwalService.confirm('Esta seguro?','Una vez realizada la acción no se podra revertir los cambios!');
      if(respu.isConfirmed){
        this.mostrar_carga_todo=true;
        let res=await this.configuracionService.EliminarTiposUsuarios(row.id_tipo);
        this.mensaje_res=res[0].mensaje;
        this.mostrar_carga_todo=false;
        this.onListar();
        if(res[0].id=="1")
          SwalService.success('',this.mensaje_res);
        else
          SwalService.error('',this.mensaje_res);
      }
    }catch{
      this.mostrar_carga_todo=false;
      /* this.addToast({title:'Advertencia', msg:'Ocurrio una excepción al momento de realizar la operación.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'}) */
      this.toaster.error('Ocurrio una excepción al momento de realizar la operación.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
    /* SwalService.('',this.mensaje_res);
    Swal.fire({
      title: 'Esta seguro?',
      text: 'Una vez realizada la acción no se podra revertir los cambios!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28A745',
      cancelButtonColor: '#DC3545',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar'
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        //cancelar
        //Swal.fire('', 'Your imaginary file is safe!', 'error');

      } else {
        //confirmar
        //Swal.fire('', 'Poof! Your imaginary file has been deleted!', 'success');
        
      }
    }); */
  }
  quitarfoco(element:any){
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioselt1(row) {
    if (row.activo == 0)
      row.activo = 1;
    else {
      row.activo = 0;
    }
  }
}
