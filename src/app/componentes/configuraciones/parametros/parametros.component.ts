import { Component, OnInit, Input } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { UntypedFormGroup, Validators, UntypedFormBuilder,UntypedFormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from '../../../servicios/swal.service'
import { EncriptadorService } from '../../../servicios/encriptador.service';
import { PrincipalService } from '../../../servicios/principal.service';

export interface filatabla {
  detalle:string;
  presupuestoletra:string;
  presupuestotipo:string;
  presupuesto:string;
}

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.scss']
})
export class ParametrosComponent implements OnInit {
  @Input('height')  height: number=100;
  mostrar_carga=false;
  mostrar_carga_todo=false;
  id_user:any;
  tabSeleccionado:any;
  public Frmdecimales :UntypedFormGroup;
  get metrado(): UntypedFormControl { return this.Frmdecimales.get('metrado') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.Frmdecimales.get('precio') as UntypedFormControl }
  get parcial(): UntypedFormControl { return this.Frmdecimales.get('parcial') as UntypedFormControl }
  get cantidad(): UntypedFormControl { return this.Frmdecimales.get('cantidad') as UntypedFormControl }

  colorletra=[
    {id:'unset',nombre:'sin color'},
    {id:'#000000',nombre:'negro'},
    {id:'#fb6a6a',nombre:'rojo'},
    {id:'#f391bd',nombre:'rosado'},
    {id:'#a96efc',nombre:'morado'},
    {id:'#4570b0',nombre:'azul oscuro'},
    {id:'#709bff',nombre:'azul'},
    {id:'#7dccfc',nombre:'celeste'},
    {id:'#00a8b8',nombre:'verde oscuro'},
    {id:'#47c2b4',nombre:'turquesa'},
    {id:'#50fb97',nombre:'verde'},
    {id:'#95eb5c',nombre:'verde claro'},
    {id:'#fabd42',nombre:'amarillo'},
    {id:'#fb7f60',nombre:'naranja'},
    {id:'#9f6a60',nombre:'marron'},
    {id:'#7995a0',nombre:'gris'},
    {id:'#ba9e78',nombre:'camel'},
    {id:'#7f8023',nombre:'olive'},
    {id:'#65fbe7',nombre:'teal'},
  ];
  tipoletra=[
    {id:'1',nombre:'Normal'},
    {id:'2',nombre:'Cursiva'},
    {id:'3',nombre:'Negrita'},
    {id:'4',nombre:'Cursiva Negrita'},
  ];
  colorfondo=[
    {id:'none',nombre:'sin fondo'},
    {id:'#ffffff',nombre:'blanco'},
    {id:'#fb6a6ad9',nombre:'rojo'},
    {id:'#f391bdd9',nombre:'rosado'},
    {id:'#a96efcd9',nombre:'morado'},
    {id:'#4570b0d9',nombre:'azul oscuro'},
    {id:'#709bffd9',nombre:'azul'},
    {id:'#7dccfcd9',nombre:'celeste'},
    {id:'#00a8b8d9',nombre:'verde oscuro'},
    {id:'#47c2b4d9',nombre:'turquesa'},
    {id:'#50fb97d9',nombre:'verde'},
    {id:'#95eb5cd9',nombre:'verde claro'},
    {id:'#fabd42d9',nombre:'amarillo'},
    {id:'#fb7f60d9',nombre:'naranja'},
    {id:'#9f6a60d9',nombre:'marron'},
    {id:'#7995a0d9',nombre:'gris'},
    {id:'#ba9e78d9',nombre:'camel'},
    {id:'#7f8023d9',nombre:'olive'},
    {id:'#65fbe7d9',nombre:'teal'},
  ];
  filastabla=[
    {detalle: 'Titulo',presupuestoletra:'unset',presupuestotipo:'1', presupuesto:'none'},
    {detalle: 'Sub Titulo 01',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 02',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 03',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 04',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 05',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 06',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 07',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 08',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 09',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Sub Titulo 10',presupuestoletra:'unset',presupuestotipo:'1',presupuesto:'none'},
    {detalle: 'Partida',presupuestoletra:'unset',presupuestotipo:'1', presupuesto:'none'},
    {detalle: 'Desglose Partidas',presupuestoletra:'unset',presupuestotipo:'1', presupuesto:'none'},
  ];

  displayedColumnsColor: string[] = ['detalle','presupuestoletra','presupuestotipo','presupuesto','presuver'];
  dataSourceColor = new MatTableDataSource<filatabla>();


  constructor(
    private formBuilder: UntypedFormBuilder,
    private principalService:PrincipalService,
    private encriptadorService:EncriptadorService
  ) { }

  async ngOnInit() {
    this.tabSeleccionado=1;
    this.id_user=this.encriptadorService.recuperarlocalstory('idusuario');
    this.dataSourceColor.data=this.filastabla;
    this.Frmdecimales = this.formBuilder.group({
      metrado:['4'],
      precio: ['2'],
      parcial: ['2'],
      cantidad: ['4']
    });
    await this.cargarDatos();
  }
  cambiarcolor(value,i,columna){
    if(columna=="presupuesto"){
      this.dataSourceColor.data[i].presupuesto=value;
    }
    if(columna=="presupuestoletra"){
      this.dataSourceColor.data[i].presupuestoletra=value;
    }
    if(columna=="presupuestotipo"){
      this.dataSourceColor.data[i].presupuestotipo=value;
    }
  }
  async cargarDatos(){
    try{
      this.mostrar_carga=true;
      const datospas = {
        id_usuario: this.id_user,
      }
      let respuesta=await this.principalService.ListarAspectosProy(datospas);
      if(respuesta!=null){
        this.Frmdecimales = this.formBuilder.group({
          metrado:[respuesta.dec_metrado],
          precio: [respuesta.dec_precio],
          parcial: [respuesta.dec_parcial],
          cantidad: [respuesta.dec_cant],
        });
        for(let i=0;i<this.dataSourceColor.data.length;i++){
          this.dataSourceColor.data[i].presupuesto=respuesta.colorPresupuesto.toString().split('|')[i];
          this.dataSourceColor.data[i].presupuestoletra=respuesta.letraPresupuesto.toString().split('|')[i];
          this.dataSourceColor.data[i].presupuestotipo=respuesta.tipoPresupuesto.toString().split('|')[i];
        }
      }
      this.mostrar_carga=false;
    }
    catch{
      this.mostrar_carga=false;
    }
  }
  async Guardar(){
    try{
      this.mostrar_carga=true;
      let colorpre='';
      let letrapre='';
      let tipopre='';
      let colorcro='';
      let letracro='';
      let tipocro='';
      for (let i=0;i<this.dataSourceColor.data.length;i++){
        if(i<this.dataSourceColor.data.length-1){
          colorpre=colorpre+this.dataSourceColor.data[i].presupuesto+"|";
          letrapre=letrapre+this.dataSourceColor.data[i].presupuestoletra+"|";
          tipopre=tipopre+this.dataSourceColor.data[i].presupuestotipo+"|";
        }
        else{
          colorpre=colorpre+this.dataSourceColor.data[i].presupuesto;
          letrapre=letrapre+this.dataSourceColor.data[i].presupuestoletra;
          tipopre=tipopre+this.dataSourceColor.data[i].presupuestotipo;
        }
      }
      const datospas = {
        id_usuario: this.id_user,
        colorPresupuesto:colorpre,
        letraPresupuesto:letrapre,
        tipoPresupuesto:tipopre,
        colorCronograma:colorcro,
        letraCronograma:letracro,
        tipoCronograma:tipocro,
        colorPlan:'',
        letraPlan:'',
        tipoPlan:'',
        dec_metrado:this.metrado.value,
        dec_precio:this.precio.value,
        dec_parcial:this.parcial.value,
        dec_cant:this.cantidad.value
      }
      let respuesta=await this.principalService.ModificarAspectosProy(datospas);
      this.mostrar_carga=false;
      if(respuesta!=null){
        if(respuesta.id==1){
          SwalService.success('Correcto','Actualize la pagina para reflejar los cambios');
          let datos={
            colorCronograma:colorcro,
            colorPresupuesto:colorpre,
            letraCronograma:letracro,
            letraPresupuesto:letrapre,
            tipoCronograma:tipocro,
            tipoPresupuesto:tipopre,
          };
          this.encriptadorService.guardarlocalstory('aspectostablas',JSON.stringify(datos));
          this.encriptadorService.guardarlocalstory('decimales',this.metrado.value+'|'+this.precio.value+'|'+this.parcial.value+'|'+this.cantidad.value);
        }
        else{
          SwalService.error('Advertencia','Ocurrio una excepción al momento de realizar la operación.')
        }
      }
    }
    catch(e){
      this.mostrar_carga=false;
      console.log(e)
      SwalService.error('Advertencia','Ocurrio una excepción al momento de realizar la operación.')
    }
  }
  reasignarColor(eve:any,ind:any){
    this.dataSourceColor.data[ind].presupuestoletra=eve.target.value;
  }
  Sincolor1(eve:any,ind:any){
    if(eve.target.checked){
      this.dataSourceColor.data[ind].presupuesto='none';
    }
    else{
      this.dataSourceColor.data[ind].presupuesto='#ffffff';
    }
  }
  reasignarColor1(eve:any,ind:any){
    this.dataSourceColor.data[ind].presupuesto=eve.target.value;
  }
}
