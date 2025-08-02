import { Component, Input, OnInit,ViewChild, } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component'
import { UntypedFormControl, UntypedFormGroup,Validators,AbstractControl, ValidationErrors, ValidatorFn  } from '@angular/forms'
import { FormsService } from 'src/app/servicios/forms.service';
import { SafeResourceUrl,DomSanitizer} from '@angular/platform-browser';
import pdfMake from 'pdfmake/build/pdfmake'
import { saveAs } from 'file-saver';
// import * as HtmlDocx from 'html-docx-js/dist/html-docx'
import { asBlob } from 'html-docx-js-typescript';
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import * as moment from 'moment'
import * as ExcelJS from 'exceljs'
import { SwalService } from 'src/app/servicios/swal.service';
import * as fs from 'file-saver'
pdfMake.vfs=pdfFonts.pdfMake.vfs
import htmlToPdfmake from 'html-to-pdfmake'
import * as he from 'he';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  @Input() datos=null
  dec_parcial=2
  @ViewChild("modalEncabezado") modalEncabezado: ModalBasicComponent
  @ViewChild("modalFooter") modalFooter: ModalBasicComponent
  opcestado:string
  hasitematlt:boolean=false
  hasactivo:boolean
  id_proyecto:any
  pdfDocGenerator:any
  mostrar_carga_todo:boolean=false
  ubicacion=''
  excelheader:any
  exceltabla2:any
  exceltabla3:any
  exceldatos:any
  showSidebar: boolean = true
  contador=1
  reportetitulo:any
  orientacion_pagina2:any
  margenizq:number
  margensuperior:number
  margender:number
  margeninferior:number
  public documentopdf: SafeResourceUrl
  arraycenter=[]
  arrayder=[]
  arrayizq=[]
  arraycenterfooter=[]
  arrayderfooter=[]
  arrayizqfooter=[]
  tamañoencabezado=0
  margenauxiliar=0
  maximo=0
  maximofooter=0
  margenfooter=0
  margenauxiliar2=0
  imagenBase64_center: string | null = null
  imagenBase64_der: string | null = null
  imagenBase64_izq: string | null = null
  footerimagenBase64_center: string | null = null
  footerimagenBase64_der: string | null = null
  footerimagenBase64_izq: string | null = null
  variablenumero1: number=1
  string11: string
  string21: string
  variablenumero2: number=1
  string12: string
  string22: string
  variablenumero3: number=1
  string13: string
  string23: string
  selheaderizq: string = 'left';
  selheadercenter: string = 'left'
  selheaderder: string = 'left'
  selfooterizq: string = 'left';
  selfootercenter: string = 'left'
  selfooterder: string = 'left'
  errores: { partida: string; texto: string }[] = [];
  IframeOr: boolean;
  itemsaux=[]
  //'#455A64'
  colorgeneral:string='#415764'
  opcionesMargen ={
    normal: { superior: 2,inferior:2.15,  izquierdo: 1.55, derecho:1.15},//eran 2.5 y 3
    moderado: { superior: 2.25,inferior:2.25,  izquierdo: 1.7, derecho:1.4},
    estrecho: { superior: 1,inferior: 1, izquierdo: 1, derecho:1}
  }
  opcionespaginas={
    // '4A0' : {width:4767.87,heigth: 6740.79},
    // '2A0': {width:3370.39,heigth: 4767.87},
    A0: { width:2380, height: 3370},
    A1: { width:1680, height: 2380},
    A2: { width:1190, height: 1680},
    A3: { width:840, height: 1190},
    A4: { width:590, height: 840},
    A5: { width:419.53, height: 595.28},
    LETTER: { width:612, height: 792},
    FOLIO: { width:612, height: 936}
  }
  mostrarDiv1: boolean = false
  mostrarDiv2: boolean = true
  mostrarDiv3: boolean = false
  mostrarDiv4: boolean = false
  mostrarDiv5: boolean = false
  mostrarDiv6: boolean = false
  mostrarDiv1Footer: boolean = false
  mostrarDiv2Footer: boolean = false
  mostrarDiv3Footer: boolean = false
  mostrarDiv4Footer: boolean = false
  mostrarDiv5Footer: boolean = false
  mostrarDiv6Footer: boolean = false

  cmToPoints(cm) {
      return cm * 28.35 // 1 cm = 28.35 puntos
  }
  toggleSidebar():void {
    this.showSidebar = !this.showSidebar
  }
  closeModal(){
    this.modal.close()
  }
  constructor(
    private modal: NgbActiveModal,
    private formService: FormsService,
    private principalService: PrincipalService,
    private presuservice: PresupuestosService,
    private sanitizer: DomSanitizer,
    private configuracionService: ConfiguracionService,
  ){ 
  }
  cambiarTitulos(value: any){
    this.reportetitulo=value
     this.crearpdf()
  }
  async ngOnInit() {
    try {
      // if(this.datos.tipo_reporte==4){
      //   await this.CrearWord()
      // }else{
        console.log(JSON.parse(JSON.stringify(this.datos)))
        this.mostrar_carga_todo=true
        this.orientacion_pagina2 = this.datos.titulo==='FORMULA POLINÓMICA' && !this.datos.tabla3? 'landscape':this.datos.orientacion?  this.datos.orientacion: ''
        var nuevo=this.datos.image? 'A0': this.datos.titulo==='CRONOGRAMA VALORIZADO'|| this.datos.titulo==='CRONOGRAMA DE ADQUISICIONES'? 'A3':'A4'
        var aux =this.datos.titulo==='ESPECIFICACIÓN TÉCNICA GENERAL'? '10':'7'
        this.reportetitulo= this.datos.tipo_reporte===0|| this.datos.tipo_reporte===2||this.datos.tipo_reporte===7? '':1      
        this.formulario1.get('tamanofuente').setValue(aux)
        this.formulario1.get('opciones1').setValue(nuevo)
        this.formulario1.get('opciones5').setValue( this.orientacion_pagina2);
        this.opciones(this.orientacion_pagina2,this.formulario1.get('opciones2').value)
        if(this.datos.titulo==='PROGRAMACIÓN GANTT'){
          this.crearpdf();
        }else{
          await this.cargarComplementos()
          this.crearpdf();
        }
      // }
    } catch (e) {
      console.log(e);
    }
  }
  CambiarItems(){
    const form=this.formulario1
    if(form.get('cambiaritems').value===false){
      this.opcestado="0"
      if( this.datos.keys_body[0]==='auxiliar'){
        this.datos.keys_body[0]='item'
      }
    }else{
      this.opcestado="1"
      if( this.datos.keys_body[0]==='item'){
        this.datos.keys_body[0]='auxiliar'
      }
    }
    this.crearpdf()
  }
  async cargarComplementos(){
    const resp=await this.principalService.ListarConfImpr({id_proyecto:this.datos.datos_proyecto.id_proyecto,id_usuario:''})
    this.opcestado= resp.length>0? resp[0].estadoitem?resp[0].estadoitem:'':''
    if(this.datos.tipo_reporte!=7&&this.opcestado==="1"&&this.datos.tipo_reporte!=="1"&&this.datos.titulo!=="HOJA DE METRADO DE ACERO"){  
      const datosAuxiliares = await this.principalService.ListarProyItemAlt({id_proyecto:this.datos.datos_proyecto.id_proyecto})
      this.itemsaux = datosAuxiliares[0].filter(item => item.item.split('.').length < 3) .map(item => ({ item: item.item, alt_item: item.alt_item }))
      this.AddItemsAuxiliares(this.itemsaux,this.datos.tabla)
      if( this.datos.keys_body[0]==='item'){
        this.datos.keys_body[0]='auxiliar'
      }
      this.hasactivo=true
      this.formulario1.get('cambiaritems').setValue(true)
    }else if(this.datos.tipo_reporte!=7&&this.opcestado==="1"){
      const datosAuxiliares = await this.principalService.ListarProyItemAlt({id_proyecto:this.datos.datos_proyecto.id_proyecto})
      this.itemsaux = datosAuxiliares[0].filter(item => item.item.split('.').length < 3) .map(item => ({ item: item.item, alt_item: item.alt_item }))
      this.hasactivo=true
      this.formulario1.get('cambiaritems').setValue(true)
    }
    const form1 =this.formularioHeader
    const form2 =this.formularioFooter
    // if(this.opcestado==="1"&&this.datos.titulo!=='RELACIÓN DE INSUMOS DEL PROYECTO'&&this.datos.titulo!=='CLASIFICACIÓN COMERCIAL DE INSUMOS DEL PROYECTO'&&this.datos.titulo!=='ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO'){
    this.formulario1.get('agregarencabezado').setValue(true)
    if(resp[0]&& resp[0].header!==null){
      const partes = (resp[0].header).split('|')
      const subPartes = partes[2].split(',')
      form1.get('nuevomargenheader').setValue(partes[0])
      form1.get('headerceldas').setValue(partes[1])
      form1.get('headeropacity').setValue(partes[3])
      form1.get('headertamano1').setValue(subPartes[0])
      form1.get('headertamano2').setValue(subPartes[1])
      form1.get('headertamano3').setValue(subPartes[2])
      if(resp[0].texto1 && resp[0].head1){
        const parte1 = (resp[0].head1).split('|')
        if(parte1[0]==="0"){
          this.mostrarDiv1 = false
          this.mostrarDiv2 = true
          form1.get('headerizqtext').setValue(resp[0].texto1)
          form1.get('headerizqfontsize').setValue(parte1[1])
          form1.get('headerizqpositionelementotext').setValue(parte1[2])
          form1.get('headerizqbold').setValue(JSON.parse(parte1[3]))
          form1.get('headerizqcolor').setValue(parte1[4])
        }else{
          this.mostrarDiv1 = true
          this.mostrarDiv2 = false
          form1.get('headerizqnombre').setValue('imagen')
          this.imagenBase64_izq = resp[0].texto1
          form1.get('headerizqwidth').setValue(parte1[1])
          form1.get('headerizqpositionelementoimg').setValue(parte1[2])
        }
      }
      if(resp[0].texto2 && resp[0].head2 &&(partes[1]==="2"||partes[1]==="3")){
        const parte2 = (resp[0].head2).split('|')
        if(parte2[0]==="0"){
          this.mostrarDiv3 = false
          this.mostrarDiv4 = true
          form1.get('headercentertext').setValue(resp[0].texto2)
          form1.get('headercenterfontsize').setValue(parte2[1])
          form1.get('headercenterpositionelementotext').setValue(parte2[2])
          form1.get('headercenterbold').setValue(JSON.parse(parte2[3]))
          form1.get('headercentercolor').setValue(parte2[4])
        }else{
          this.mostrarDiv3 = true
          this.mostrarDiv4 = false
          form1.get('headercenternombre').setValue('imagen')
          this.imagenBase64_center = resp[0].texto2
          form1.get('headercenterwidth').setValue(parte2[1])
          form1.get('headercenterpositionelementoimg').setValue(parte2[2])
        }
      }
      if(resp[0].texto3 && resp[0].head3 &&partes[1]==="3"){
        const parte3 = (resp[0].head3).split('|')
        if(parte3[0]==="0"){
          this.mostrarDiv5 = false
          this.mostrarDiv6 = true
          form1.get('headerdertext').setValue(resp[0].texto3)
          form1.get('headerderfontsize').setValue(parte3[1])
          form1.get('headerderpositionelementotext').setValue(parte3[2])
          form1.get('headerderbold').setValue(JSON.parse(parte3[3]))
          form1.get('headerdercolor').setValue(parte3[4])
        }else{
          this.mostrarDiv5 = true
          this.mostrarDiv6 = false
          form1.get('headerdernombre').setValue('imagen')
          this.imagenBase64_der = resp[0].texto3
          form1.get('headerderwidth').setValue(parte3[1])
          form1.get('headerderpositionelementoimg').setValue(parte3[2])
        }
      }
      if(resp[0].texto4||resp[0].texto5||resp[0].texto6){
        this.formulario1.get('agregarpiepagina').setValue(true)
        const partes2 = (resp[0].footer).split('|')
        const subPartes2 = partes2[2].split(',')
        form2.get('nuevomargenfooter').setValue(partes2[0])
        form2.get('footerceldas').setValue(partes2[1])
        form2.get('footeropacity').setValue(partes2[3])
        form2.get('footertamano1').setValue(subPartes2[0])
        form2.get('footertamano2').setValue(subPartes2[1])
        form2.get('footertamano3').setValue(subPartes2[2])
        if(resp[0].texto4 && resp[0].texto4){
          const parte12 = (resp[0].foot1).split('|')
          if(parte12[0]==="0"){
            this.mostrarDiv1Footer = false
            this.mostrarDiv2Footer = true
            form2.get('footerizqtext').setValue(resp[0].texto4)
            form2.get('footerizqfontsize').setValue(parte12[1])
            form2.get('footerizqpositionelementotext').setValue(parte12[2])
            form2.get('footerizqbold').setValue(JSON.parse(parte12[3]))
            form2.get('footerizqcolor').setValue(parte12[4])
          }
        }
        if(resp[0].texto5 && resp[0].foot2 &&(partes2[1]==="2"||partes2[1]==="3")){
          const parte22 = (resp[0].foot2).split('|')
          if(parte22[0]==="0"){
            this.mostrarDiv3Footer = false
            this.mostrarDiv4Footer = true
            form2.get('footercentertext').setValue(resp[0].texto5)
            form2.get('footercenterfontsize').setValue(parte22[1])
            form2.get('footercenterpositionelementotext').setValue(parte22[2])
            form2.get('footercenterbold').setValue(JSON.parse(parte22[3]))
            form2.get('footercentercolor').setValue(parte22[4])
          }
        }
        if(resp[0].texto6 && resp[0].foot3 &&partes2[1]==="3"){
          const parte32 = (resp[0].foot3).split('|')
          if(parte32[0]==="0"){
            this.mostrarDiv5Footer = false
            this.mostrarDiv6Footer = true
            form2.get('footerdertext').setValue(resp[0].texto6)
            form2.get('footerderfontsize').setValue(parte32[1])
            form2.get('footerderpositionelementotext').setValue(parte32[2])
            form2.get('footerderbold').setValue(JSON.parse(parte32[3]))
            form2.get('footerdercolor').setValue(parte32[4])
          }
        }
        this.GuardarFooter('inicio')
      }
    }
    this.GuardarEncabezado('inicio')
  }
  async AddItemsAuxiliares(array1,array2){
    let auxposit=0
    let valorBaseAuxiliar: string | null = null
    let prefijoAuxiliar: string
    let sufijoAuxiliar: string
    return array2.map((item) => {
      const depth = item.item? item.item.split('.').length:0
      if (depth === 1) {
        if(valorBaseAuxiliar && valorBaseAuxiliar.split('.').length>0){
          valorBaseAuxiliar = ''
        }
        for(let k=auxposit;k<array1.length;k++){
          if(item.item === array1[k].item){
            auxposit=k
          }
        }      
        valorBaseAuxiliar =array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[2] !== ''? valorBaseAuxiliar = array1[auxposit].alt_item.split('|')[2] :  array1[auxposit].item
        prefijoAuxiliar = array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[0]!==null&& array1[auxposit].alt_item.split('|')[0]!=="null"&& array1[auxposit].alt_item.split('|')[0]!=='' ?array1[auxposit].alt_item.split('|')[0] : ''
        sufijoAuxiliar = array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[1]!==null&& array1[auxposit].alt_item.split('|')[1]!=="null"&& array1[auxposit].alt_item.split('|')[1]!=='' ?array1[auxposit].alt_item.split('|')[1] : ''
        item['auxiliar'] = prefijoAuxiliar +' '+ valorBaseAuxiliar + ' '+sufijoAuxiliar
      } else if (depth === 2) {
        for(let k=auxposit;k<array1.length;k++){
          if(item.item === array1[k].item){
            auxposit=k
          }
        }      
        if( valorBaseAuxiliar &&valorBaseAuxiliar.split('.').length>1){
          valorBaseAuxiliar = valorBaseAuxiliar.split('.')[0]
        }
        if(array1[auxposit].alt_item && array1[auxposit].alt_item.split('|').length > 2 && array1[auxposit].alt_item.split('|')[2] !== '') {
          const altItemValue2 = array1[auxposit].alt_item.split('|')[2]; 
          valorBaseAuxiliar += '.' + altItemValue2
        }else{
          const subItem = array1[auxposit].item.slice(array1[auxposit].item.indexOf('.') + 1)
          valorBaseAuxiliar += '.' + subItem
        }
        item['auxiliar'] = prefijoAuxiliar +' '+ valorBaseAuxiliar + ' '+sufijoAuxiliar
      }else if (depth > 2) {
        const secondDotIndex = item.item.indexOf('.', item.item.indexOf('.') + 1);
        const subItem = item.item.slice(secondDotIndex);
        item['auxiliar'] = prefijoAuxiliar+' '+`${valorBaseAuxiliar}${subItem}`+' '+sufijoAuxiliar
      }
      return item
    });
  }
  FindAddItemsAuxiliares(array1,array2){
    if(array2.length>0){
      let auxposit=0
      let auxi=0
      let valorBaseAuxiliar: string | null = null
      let prefijoAuxiliar: string
      let sufijoAuxiliar: string
      let titulo1= array2[0].item.split('.')[0]
      if(valorBaseAuxiliar && valorBaseAuxiliar.split('.').length>0){
        valorBaseAuxiliar = ''
      }
      for(let k=auxposit;k<array1.length;k++){
        if(titulo1 === array1[k].item){
          auxposit=k
        }
      }      
      valorBaseAuxiliar =array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[2] !== ''? valorBaseAuxiliar = array1[auxposit].alt_item.split('|')[2] :  array1[auxposit].item
      prefijoAuxiliar = array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[0]!==null&& array1[auxposit].alt_item.split('|')[0]!=="null"&& array1[auxposit].alt_item.split('|')[0]!=='' ?array1[auxposit].alt_item.split('|')[0] : ''
      sufijoAuxiliar = array1[auxposit].alt_item && array1[auxposit].alt_item.split('|')[1]!==null&& array1[auxposit].alt_item.split('|')[1]!=="null"&& array1[auxposit].alt_item.split('|')[1]!=='' ?array1[auxposit].alt_item.split('|')[1] : ''
      return array2.map((item) => {
        const depth = item.item? item.item.split('.').length:0
        if (depth === 2) {
          for(let k=auxposit;k<array1.length;k++){
            if(item.item === array1[k].item){
              auxposit=k
            }
          }      
          if( valorBaseAuxiliar &&valorBaseAuxiliar.split('.').length>1){
            valorBaseAuxiliar = valorBaseAuxiliar.split('.')[0]
          }
          if(array1[auxposit].alt_item && array1[auxposit].alt_item.split('|').length > 2 && array1[auxposit].alt_item.split('|')[2] !== '') {
            const altItemValue2 = array1[auxposit].alt_item.split('|')[2]; 
            valorBaseAuxiliar += '.' + altItemValue2
          }else{
            const subItem = array1[auxposit].item.slice(array1[auxposit].item.indexOf('.') + 1)
            valorBaseAuxiliar += '.' + subItem
          }
          item['auxiliar'] = prefijoAuxiliar +' '+ valorBaseAuxiliar + ' '+sufijoAuxiliar
          auxi++
        }else if (depth > 2) {
          if(valorBaseAuxiliar.split('.').length===2){
            const secondDotIndex = item.item.indexOf('.', item.item.indexOf('.') + 1);
            const subItem = item.item.slice(secondDotIndex);
            item['auxiliar'] = prefijoAuxiliar+' '+`${valorBaseAuxiliar}${subItem}`+' '+sufijoAuxiliar
          }else{
            let second= array2[0].item.split('.')[1]
            for(let k=auxposit;k<array1.length;k++){
              if(titulo1+'.'+second === array1[k].item){
                auxposit=k
              }
            }
            if(array1[auxposit].alt_item && array1[auxposit].alt_item.split('|').length > 2 && array1[auxposit].alt_item.split('|')[2] !== '') {
              const altItemValue2 = array1[auxposit].alt_item.split('|')[2]; 
              valorBaseAuxiliar += '.' + altItemValue2
            }else{
              const subItem = array1[auxposit].item.slice(array1[auxposit].item.indexOf('.') + 1)
              valorBaseAuxiliar += '.' + subItem
            }
            const subItem = item.item.slice(item.item.indexOf('.') + 2)
            item['auxiliar'] = prefijoAuxiliar+' '+`${valorBaseAuxiliar}${subItem}`+' '+sufijoAuxiliar
          }
        }
        return item
      });
    }else{
      return array2
    }
  }

  formulario1 = new UntypedFormGroup({
    opciones1:new UntypedFormControl('A4'),
    opciones2:new UntypedFormControl('normal'),
    opciones3:new UntypedFormControl('color'),
    opciones4:new UntypedFormControl('Arial'),
    opcionzoom:new UntypedFormControl('2'),
    opciones5:new UntypedFormControl(),
    margensuperior:new UntypedFormControl('',[Validators.required,Validators.min(0),Validators.max(10)]),
    margeninferior:new UntypedFormControl('',[Validators.required,Validators.min(0),Validators.max(10)]),
    margenizq:new UntypedFormControl('',[Validators.required,Validators.min(0),Validators.max(10)]),
    margender:new UntypedFormControl('',[Validators.required,Validators.min(0),Validators.max(10)]),
    agregarencabezado:new UntypedFormControl(''),
    agregarpiepagina:new UntypedFormControl(false),
    tamanofuente:new UntypedFormControl('7',[Validators.required,Validators.min(2),Validators.max(30)]),
    // alineamientotabla:new FormControl('left'),
    agregarcostosindirectos:new UntypedFormControl(false),
    mostrarresumenes:new UntypedFormControl(false),
    mostrarsubtitulos:new UntypedFormControl(false),
    cambiaritems:new UntypedFormControl(false)
  })
  formularioHeader = new UntypedFormGroup({
    nuevomargenheader:new UntypedFormControl('1',Validators.min(0)),
    headerceldas:new UntypedFormControl('1',Validators.required),
    headeropacity: new UntypedFormControl('100',[Validators.required,Validators.min(0),Validators.max(100)]),
    headertamano1:new UntypedFormControl('30',[Validators.min(0),Validators.max(100)]),
    headertamano2:new UntypedFormControl('0',[Validators.min(0),Validators.max(100)]),
    headertamano3:new UntypedFormControl('0',[Validators.min(0),Validators.max(100)]),
    headerizqtext: new UntypedFormControl('Biplan.pe',Validators.maxLength(150)),
    headerizqfontsize: new UntypedFormControl('12',[Validators.min(5),Validators.max(30)]),
    headerizqcolor: new UntypedFormControl('#8b8d8d'),
    headerizqbold: new UntypedFormControl(false),
    headerizqpositionelementotext: new UntypedFormControl('left'),
    headerizqwidth: new UntypedFormControl('12',[Validators.min(5),Validators.max(60)]),
    headerizqnombre: new UntypedFormControl(),
    headerizqpositionelementoimg: new UntypedFormControl('left'),
    headercentertext: new UntypedFormControl('',Validators.maxLength(150)),
    headercenterfontsize: new UntypedFormControl('12',[Validators.min(5),Validators.max(30)]),
    headercentercolor: new UntypedFormControl(this.colorgeneral),
    headercenterbold: new UntypedFormControl(false),
    headercenterpositionelementotext: new UntypedFormControl('left'),
    headercenterwidth: new UntypedFormControl('12',[Validators.min(5),Validators.max(60)]),
    headercenternombre: new UntypedFormControl(),
    headercenterpositionelementoimg: new UntypedFormControl('left'),
    headerdertext: new UntypedFormControl('',Validators.maxLength(150)),
    headerderfontsize: new UntypedFormControl('12',[Validators.min(5),Validators.max(30)]),
    headerdercolor: new UntypedFormControl(this.colorgeneral),
    headerderbold: new UntypedFormControl(false),
    headerderpositionelementotext: new UntypedFormControl('left'),
    headerderwidth: new UntypedFormControl('12',[Validators.min(5),Validators.max(60)]),
    headerdernombre: new UntypedFormControl(),
    headerderpositionelementoimg: new UntypedFormControl('left'),
  },[this.Headerwidths()])
  // this.formularioHeader.get('headertamano1')?.valueChanges.subscribe(() => this.Headerwidths());
  // this.formularioHeader.get('headertamano2')?.valueChanges.subscribe(() => this.Headerwidths());
  // this.formularioHeader.get('headertamano3')?.valueChanges.subscribe(() => this.Headerwidths());
  ChangeBackColor(value: string,componente:string,lado:string) 
  {
    this['sel'+componente+lado]=value;
  }
  formularioFooter = new UntypedFormGroup({
    nuevomargenfooter:new UntypedFormControl('1',Validators.min(0)),
    footerceldas:new UntypedFormControl('1'),
    footeropacity: new UntypedFormControl('100',[Validators.required,Validators.min(0),Validators.max(100)]),
    footertamano1:new UntypedFormControl('100',[Validators.min(0),Validators.max(100)]),
    footertamano2:new UntypedFormControl('0',[Validators.min(0),Validators.max(100)]),
    footertamano3:new UntypedFormControl('0',[Validators.min(0),Validators.max(100)]),

    footerizqtext: new UntypedFormControl('',Validators.maxLength(150)),
    footerizqfontsize: new UntypedFormControl('8',[Validators.min(5),Validators.max(30)]),
    footerizqcolor: new UntypedFormControl(this.colorgeneral),
    footerizqbold: new UntypedFormControl(false),
    footerizqpositionelementotext: new UntypedFormControl('left'),
    footerizqwidth: new UntypedFormControl('10',[Validators.min(5),Validators.max(100)]),
    footerizqnombre: new UntypedFormControl(),
    footerizqpositionelementoimg: new UntypedFormControl('left'),
    
    footercentertext: new UntypedFormControl('',Validators.maxLength(150)),
    footercenterfontsize: new UntypedFormControl('8',[Validators.min(5),Validators.max(30)]),
    footercentercolor: new UntypedFormControl(this.colorgeneral),
    footercenterbold: new UntypedFormControl(false),
    footercenterpositionelementotext: new UntypedFormControl('left'),
    footercenterwidth: new UntypedFormControl('10',[Validators.min(5),Validators.max(100)]),
    footercenternombre: new UntypedFormControl(),
    footercenterpositionelementoimg: new UntypedFormControl('left'),
    
    footerdertext: new UntypedFormControl('',Validators.maxLength(150)),
    footerderfontsize: new UntypedFormControl('8',[Validators.min(5),Validators.max(30)]),
    footerdercolor: new UntypedFormControl(this.colorgeneral),
    footerderbold: new UntypedFormControl(false),
    footerderpositionelementotext: new UntypedFormControl('left'),
    footerderwidth: new UntypedFormControl('10',[Validators.min(5),Validators.max(100)]),
    footerdernombre: new UntypedFormControl(),
    footerderpositionelementoimg: new UntypedFormControl('left'),
  },[this.Footerwidths()])
  mostrarDivIzq(numero: number) {
    if (numero === 1) {
      this.mostrarDiv1 = true
      this.mostrarDiv2 = false
    } else if (numero === 2) {
      this.mostrarDiv1 = false
      this.mostrarDiv2 = true
    }else{
      this.mostrarDiv1 = false
      this.mostrarDiv2 = false
    }
  }
  mostrarDivCentro(numero: number) {
    if (numero === 1) {
      this.mostrarDiv3 = true;
      this.mostrarDiv4 = false;
    } else if (numero === 2) {
      this.mostrarDiv3 = false;
      this.mostrarDiv4 = true;
    }else{
      this.mostrarDiv3 = false;
      this.mostrarDiv4 = false;
    }
  }
  mostrarDivDer(numero: number) {
    if (numero === 1) {
      this.mostrarDiv5 = true
      this.mostrarDiv6 = false
    } else if (numero === 2) {
      this.mostrarDiv5 = false
      this.mostrarDiv6 = true
    }else{
      this.mostrarDiv5 = false
      this.mostrarDiv6 = false
    }
  }
  mostrarDivIzqFooter(numero: number) {
    if (numero === 1) {
      this.mostrarDiv1Footer = true
      this.mostrarDiv2Footer = false
    } else if (numero) {
      this.mostrarDiv1Footer = false
      this.mostrarDiv2Footer = true
    }else{
      this.mostrarDiv1Footer = false
      this.mostrarDiv2Footer = false
    }
  }
  mostrarDivCentroFooter(numero: number) {
    if (numero === 1) {
      this.mostrarDiv3Footer = true;
      this.mostrarDiv4Footer = false;
    } else if (numero === 2) {
      this.mostrarDiv3Footer = false;
      this.mostrarDiv4Footer = true;
    }else{
      this.mostrarDiv3Footer = false;
      this.mostrarDiv4Footer = false;
    }
  }
  mostrarDivDerFooter(numero: number) {
    if (numero === 1) {
      this.mostrarDiv5Footer = true;
      this.mostrarDiv6Footer = false;
    } else if (numero === 2 ) {
      this.mostrarDiv5Footer = false;
      this.mostrarDiv6Footer = true;
    }else{
      this.mostrarDiv5Footer = false;
      this.mostrarDiv6Footer = false;
    }
  }
  onFileSelected(event: any, imagenposicion:string) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (imagenposicion === 'imagenizq') {
          this.imagenBase64_izq = reader.result as string;
          this.formularioHeader.get('headerizqnombre').setValue(event.target.files[0].name)
        } else if (imagenposicion === 'imagencenter') {
          this.imagenBase64_center = reader.result as string;
          this.formularioHeader.get('headercenternombre').setValue(event.target.files[0].name)
        } else if (imagenposicion === 'imagender') {
          this.imagenBase64_der = reader.result as string;
          this.formularioHeader.get('headerdernombre').setValue(event.target.files[0].name)
        }else if(imagenposicion === 'footerimagenizq'){
          this.footerimagenBase64_izq = reader.result as string;
          this.formularioFooter.get('footerizqnombre').setValue(event.target.files[0].name)
        }else if(imagenposicion === 'footerimagencenter'){
          this.footerimagenBase64_center = reader.result as string;
          this.formularioFooter.get('footercenternombre').setValue(event.target.files[0].name)
        }else if(imagenposicion === 'footerimagender'){
          this.footerimagenBase64_der = reader.result as string;
          this.formularioFooter.get('footerderqnombre').setValue(event.target.files[0].name)
        }
      };
      reader.onerror = (error) => {
        console.error('Error al leer el archivo:', error)
      };
    }
  }
  Paginado(lado: number, valor:string) {
    let controlName: string;
    if (lado ===3) {
      controlName = 'footerdertext'
    } else if (lado === 2) {
      controlName = 'footercentertext'
    } else if (lado === 1) {
      controlName = 'footerizqtext'
    }
    const textoActual = this.formularioFooter.get(controlName).value;
    const textoNuevo = textoActual + valor;
    this.formularioFooter.get(controlName).setValue(textoNuevo);
  }
  contarSaltosDeLinea(textarea:any) {
    var lineas = textarea.split('\n');
    var contador = 0;
    for (var i = 0; i < lineas.length; i++) {
        if (lineas[i].trim() !== '') {
            contador++;
        }
    }
    return contador;
  }
  async actualizarMargenEncabezado(){
    if(this.formulario1.get('agregarencabezado').value===false){
      this.tamañoencabezado=0;
      }else{
        this.tamañoencabezado=this.margenauxiliar;
      }
    await this.crearpdf();
  }
  ModalEncabezado(){
    this.modalEncabezado.show();
  }
  ModalPiePagina(){
    this.modalFooter.show();
  }
  cerrarModal() {
    this.modalEncabezado.hide();
  }
  cerrarModal2(){
    this.modalFooter.hide();
  }
  async ChangeOption(){
    this.opciones(this.formulario1.get('opciones5').value,this.formulario1.get('opciones2').value)
   if( this.formulario1.valid){
      await this.crearpdf();
    }
  }
  GuardarEncabezado(string){
    var izqheadermayor=0;
    var centerheadermayor=0;
    var derheadermayor=0;
    var valueOpacity= parseInt(this.formularioHeader.get('headeropacity').value)/100
    if(this.formulario1.get('agregarencabezado').value===true && (this.formularioHeader.get('headerceldas').value==="1" || this.formularioHeader.get('headerceldas').value==="2" || this.formularioHeader.get('headerceldas').value==="3")){
      if(this.mostrarDiv1===true && this.mostrarDiv2===false && this.imagenBase64_izq!==null){
        this.arrayizq=[{image:this.imagenBase64_izq, 
                        fit:[this.cmToPoints(this.formularioHeader.get('headerizqwidth').value/10),this.cmToPoints(this.formularioHeader.get('headerizqwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioHeader.get('headerizqpositionelementoimg').value}]
                        izqheadermayor=this.cmToPoints(this.formularioHeader.get('headerizqwidth').value/8)
      }else if(this.mostrarDiv1===false && this.mostrarDiv2===true){
        this.arrayizq=[{text:this.formularioHeader.get('headerizqtext').value, 
              fontSize:this.formularioHeader.get('headerizqfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioHeader.get('headerizqbold').value,
              alignment:this.formularioHeader.get('headerizqpositionelementotext').value,
              color:this.formularioHeader.get('headerizqcolor').value,
              preserveLeadingSpaces: true}];
              const saltosizq=this.contarSaltosDeLinea(this.formularioHeader.get('headerizqtext').value)
              let extraizq= saltosizq===1? 6:(saltosizq-1)*this.formularioHeader.get('headercenterfontsize').value*0.9 
              izqheadermayor= this.formularioHeader.get('headerizqfontsize').value*saltosizq + extraizq
      }
      else{
        this.arrayizq=[];
      }
    }
    if(this.formulario1.get('agregarencabezado').value===true && (this.formularioHeader.get('headerceldas').value==="2" || this.formularioHeader.get('headerceldas').value==="3")){
      if(this.mostrarDiv3===true && this.mostrarDiv4===false && this.imagenBase64_center!==null){
        this.arraycenter=[{image:this.imagenBase64_center, 
                        fit:[this.cmToPoints(this.formularioHeader.get('headercenterwidth').value/10),this.cmToPoints(this.formularioHeader.get('headercenterwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioHeader.get('headercenterpositionelementoimg').value}]
                        centerheadermayor=this.cmToPoints((this.formularioHeader.get('headercenterwidth').value)/8)
      }else if(this.mostrarDiv3===false && this.mostrarDiv4===true){
        this.arraycenter=[{text:this.formularioHeader.get('headercentertext').value, 
              fontSize:this.formularioHeader.get('headercenterfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioHeader.get('headercenterbold').value,
              alignment:this.formularioHeader.get('headercenterpositionelementotext').value,
              color:this.formularioHeader.get('headercentercolor').value,
              preserveLeadingSpaces: true}];
              const saltoscenter=this.contarSaltosDeLinea(this.formularioHeader.get('headercentertext').value)
              let extracenter= saltoscenter===1? 6:(saltoscenter-1)*this.formularioHeader.get('headercenterfontsize').value*0.9 
              centerheadermayor= this.formularioHeader.get('headercenterfontsize').value*saltoscenter + extracenter
      }
      else {
        this.arraycenter=[];
      }
    }
    if(this.formulario1.get('agregarencabezado').value===true && this.formularioHeader.get('headerceldas').value==="3"){
      if(this.mostrarDiv5===true && this.mostrarDiv6===false && this.imagenBase64_der!==null){
        this.arrayder=[{image:this.imagenBase64_der, 
                        fit:[this.cmToPoints(this.formularioHeader.get('headerderwidth').value/10),this.cmToPoints(this.formularioHeader.get('headerderwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioHeader.get('headerderpositionelementoimg').value}]
                        derheadermayor=this.cmToPoints(this.formularioHeader.get('headerderwidth').value/8)
      }else if(this.mostrarDiv6===true && this.mostrarDiv5===false){
        this.arrayder=[{text:this.formularioHeader.get('headerdertext').value, 
              fontSize:this.formularioHeader.get('headerderfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioHeader.get('headerderbold').value,
              alignment:this.formularioHeader.get('headerderpositionelementotext').value,
              color:this.formularioHeader.get('headerdercolor').value,
              preserveLeadingSpaces: true}];
              const saltosder=this.contarSaltosDeLinea(this.formularioHeader.get('headerdertext').value)
              let extrader= saltosder===1? 6:(saltosder-1)*this.formularioHeader.get('headercenterfontsize').value*0.9 
              derheadermayor= this.formularioHeader.get('headerderfontsize').value*saltosder + extrader
      }else{
          this.arrayder=[]
      }
    }
    var margennuevo = this.formulario1.get('margensuperior').value>1? this.cmToPoints(this.formulario1.get('margensuperior').value-this.formularioHeader.get('nuevomargenheader').value) : 0
    this.maximo = Math.max(derheadermayor,centerheadermayor,izqheadermayor);
    this.tamañoencabezado=Math.max(derheadermayor,centerheadermayor,izqheadermayor,margennuevo);
    this. margenauxiliar= this.tamañoencabezado
    if(this.formularioHeader.valid){
      if(string==='checked'){
        this.modalEncabezado.hide()
        this.crearpdf()
      }
    }else{
      console.log('Formulario inválido');
      return;
    }
  }
  GuardarFooter(string){
    var izqfootermayor=0;
    var centerfootermayor=0;
    var derfootermayor=0;
    var valueOpacity= parseInt(this.formularioFooter.get('footeropacity').value)/100
    if(this.formulario1.get('agregarpiepagina').value===true && (this.formularioFooter.get('footerceldas').value==="1" || this.formularioFooter.get('footerceldas').value==="2" || this.formularioFooter.get('footerceldas').value==="3")){
      if(this.mostrarDiv1Footer===true && this.mostrarDiv2Footer===false && this.footerimagenBase64_izq!==null){
        this.arrayizqfooter=[{image:this.footerimagenBase64_izq, 
                        fit:[this.cmToPoints(this.formularioFooter.get('footerizqwidth').value/10),this.cmToPoints(this.formularioFooter.get('footerizqwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioFooter.get('footerizqpositionelementoimg').value}]
                        izqfootermayor=this.cmToPoints(this.formularioFooter.get('footerizqwidth').value/10)
      }else if(this.mostrarDiv1Footer===false && this.mostrarDiv2Footer===true){
        this.arrayizqfooter=[{text:this.formularioFooter.get('footerizqtext').value, 
              fontSize:this.formularioFooter.get('footerizqfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioFooter.get('footerizqbold').value,
              alignment:this.formularioFooter.get('footerizqpositionelementotext').value,
              color:this.formularioFooter.get('footerizqcolor').value,
              preserveLeadingSpaces: true}];
              const saltosizq=this.contarSaltosDeLinea(this.formularioFooter.get('footerizqtext').value)
              let extraizq= saltosizq===1? 6:(saltosizq-1)*this.formularioFooter.get('footercenterfontsize').value*0.9 
              izqfootermayor= this.formularioFooter.get('footerizqfontsize').value*saltosizq + extraizq
      }
      else{
        this.arrayizqfooter=[];
      }
    }
    if(this.formulario1.get('agregarpiepagina').value===true && (this.formularioFooter.get('footerceldas').value==="2" || this.formularioFooter.get('footerceldas').value==="3")){
      if(this.mostrarDiv3Footer===true && this.mostrarDiv4Footer===false && this.footerimagenBase64_center!==null){
        this.arraycenterfooter=[{image:this.footerimagenBase64_center, 
                        fit:[this.cmToPoints(this.formularioFooter.get('footercenterwidth').value/10),this.cmToPoints(this.formularioFooter.get('footercenterwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioFooter.get('footercenterpositionelementoimg').value}]
                        centerfootermayor=this.cmToPoints((this.formularioFooter.get('footercenterwidth').value)/8)
      }else if(this.mostrarDiv3Footer===false && this.mostrarDiv4Footer===true){
        this.arraycenterfooter=[{text:this.formularioFooter.get('footercentertext').value, 
              fontSize:this.formularioFooter.get('footercenterfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioFooter.get('footercenterbold').value,
              alignment:this.formularioFooter.get('footercenterpositionelementotext').value,
              color:this.formularioFooter.get('footercentercolor').value,
              preserveLeadingSpaces: true}];
              const saltoscenter=this.contarSaltosDeLinea(this.formularioFooter.get('footercentertext').value)
              let extracenter= saltoscenter===1? 6:(saltoscenter-1)*this.formularioFooter.get('footercenterfontsize').value*0.9 
              centerfootermayor= this.formularioFooter.get('footercenterfontsize').value*saltoscenter + extracenter
      }
      else {
        this.arraycenterfooter=[];
      }
    }
    if(this.formulario1.get('agregarpiepagina').value===true && this.formularioFooter.get('footerceldas').value==="3"){
      if(this.mostrarDiv5Footer===true && this.mostrarDiv6Footer===false && this.footerimagenBase64_der!==null){
        this.arrayderfooter=[{image:this.footerimagenBase64_der, 
                        fit:[this.cmToPoints(this.formularioFooter.get('footerderwidth').value/10),this.cmToPoints(this.formularioFooter.get('footerderwidth').value/10)],
                        opacity:valueOpacity,
                        alignment:this.formularioFooter.get('footerderpositionelementoimg').value}]
                        derfootermayor=this.cmToPoints(this.formularioFooter.get('footerderwidth').value/10)
      }else if(this.mostrarDiv6Footer===true && this.mostrarDiv5Footer===false){
        this.arrayderfooter=[{text:this.formularioFooter.get('footerdertext').value, 
              fontSize:this.formularioFooter.get('footerderfontsize').value,
              opacity:valueOpacity,
              bold:this.formularioFooter.get('footerderbold').value,
              alignment:this.formularioFooter.get('footerderpositionelementotext').value,
              color:this.formularioFooter.get('footerdercolor').value,
              preserveLeadingSpaces: true}];
              const saltosder=this.contarSaltosDeLinea(this.formularioFooter.get('footerdertext').value)
              let extrader= saltosder===1? 6:(saltosder-1)*this.formularioFooter.get('footercenterfontsize').value*0.9 
              derfootermayor= this.formularioFooter.get('footerderfontsize').value*saltosder + extrader
      }else{
          this.arrayderfooter=[];
      }
    }
    var margennuevo = this.formulario1.get('margeninferior').value>1? this.cmToPoints(this.formulario1.get('margeninferior').value-this.formularioFooter.get('nuevomargenfooter').value) : 0
    this.maximofooter = Math.max(derfootermayor,centerfootermayor,izqfootermayor);
    this.margenfooter=Math.max(derfootermayor,centerfootermayor,izqfootermayor,margennuevo);
    this. margenauxiliar= this.margenfooter
    if(this.formularioFooter.valid){
      if(string==='checked'){
        this.modalFooter.hide()
        this.crearpdf()
      }
    }else{
      console.log('Formulario inválido');
      return;
    }
    this.variablenumero1=1
    this.variablenumero2=1
    this.variablenumero3=1
   }
  opciones(orientacion_pagina,margen_pagina){
    this.orientacion_pagina2 = orientacion_pagina==='landscape'? 'landscape': ''
    const valores=this.opcionesMargen[margen_pagina]
    const form=this.formulario1
    if(valores){
        form.get('margensuperior').setValue(valores.superior)
        form.get('margeninferior').setValue(valores.inferior)
        form.get('margenizq').setValue(valores.izquierdo)
        if(this.datos.tipo_reporte===4){
          let aux=valores.derecho+0.20
          form.get('margender').setValue(aux.toFixed(2))
        }else{
          form.get('margender').setValue(valores.derecho)
        }
        form.get('margensuperior').disable();
        form.get('margeninferior').disable();
        form.get('margenizq').disable();
        form.get('margender').disable();
        this.margensuperior=this.cmToPoints(form.get('margensuperior').value);
        this.margeninferior=this.cmToPoints(form.get('margeninferior').value);
        this.margenizq=this.cmToPoints(form.get('margenizq').value);
        this.margender=this.cmToPoints(form.get('margender').value);
    }else{
        form.get('margensuperior').enable()
        form.get('margeninferior').enable()
        form.get('margenizq').enable()
        form.get('margender').enable()
        this.margensuperior=this.cmToPoints(form.get('margensuperior').value);
        this.margeninferior=this.cmToPoints(form.get('margeninferior').value);
        this.margenizq=this.cmToPoints(form.get('margenizq').value);
        this.margender=this.cmToPoints(form.get('margender').value);
    }
    var margennuevo= this.margensuperior<1? this.margensuperior : this.formulario1.get('agregarencabezado').value===true?  this.margensuperior - this.cmToPoints(this.formularioHeader.get('nuevomargenheader').value) : 0
    this.tamañoencabezado= margennuevo>this.maximo? margennuevo : this.formulario1.get('agregarencabezado').value===true? this.maximo : 0
    var margennuevofooter= this.margeninferior<1? this.margeninferior : this.formulario1.get('agregarpiepagina').value===true?  this.margeninferior - this.cmToPoints(this.formularioFooter.get('nuevomargenfooter').value) : 0
    this.margenfooter= margennuevofooter>this.maximofooter? margennuevofooter : this.formulario1.get('agregarpiepagina').value===true? this.maximofooter : 0
  }
  async actualizarPiePagina(){
    if(this.formulario1.get('agregarpiepagina').value===false){
      this.margenfooter=0;
      }else{
        this.margenfooter=this.margenauxiliar2;
      }
    await this.crearpdf();
  }
  separarPorCurrentPage(texto){
    const indiceCurrentPage = texto.indexOf('PaginaActual');
    if (indiceCurrentPage === -1) {
      return {
        antes: texto,
        despues: ''
      };
    }
    const antes = texto.substring(0, indiceCurrentPage);
    const despues = texto.substring(indiceCurrentPage + 'PaginaActual'.length);
    return {
      antes: antes,
      despues: despues
    };
  }
  createResponsiveHeader = (arrayizq, arraycenter, arrayder, margenizq, margender) => {
    if (!arrayizq.length && !arraycenter.length && !arrayder.length|| this.formulario1.get('agregarencabezado').value===false) {
      return null; // Si todos los arrays están vacíos, retornar null
  }else{
    const headerContent = [];
    function createHeaderPorcent(content1,content2,content3,width1,width2,width3) {
        return {
          table: {
              widths: [width1+'%',width2+'%',width3+'%'],
              body: [[content1,content2,content3]],
          },
          layout: 'noBorders'
      };
    }
    if(this.formularioHeader.get('headerceldas').value==="1"){ 
       headerContent.push(createHeaderPorcent(arrayizq,null,null,this.formularioHeader.get('headertamano1').value,this.formularioHeader.get('headertamano2').value,this.formularioHeader.get('headertamano3').value))
    }else if(this.formularioHeader.get('headerceldas').value==="2"){
       headerContent.push(createHeaderPorcent(arrayizq,arraycenter,null,this.formularioHeader.get('headertamano1').value,this.formularioHeader.get('headertamano2').value,this.formularioHeader.get('headertamano3').value))
    }else {
       headerContent.push(createHeaderPorcent(arrayizq,arraycenter,arrayder,this.formularioHeader.get('headertamano1').value,this.formularioHeader.get('headertamano2').value,this.formularioHeader.get('headertamano3').value))
    }
    return {
        columns: headerContent,
        margin: [margenizq, this.cmToPoints(this.formularioHeader.get('nuevomargenheader').value), margender,0],
    };
  }
  };
  createResponsiveFooter(arrayizqfooter, arraycenterfooter, arrayderfooter, margenizq, margender, currentPage, pageCount){
  const form =this.formularioFooter
   if (!arrayizqfooter.length && !arraycenterfooter.length && !arrayderfooter.length|| this.formulario1.get('agregarpiepagina').value===false) {
      return null; // Si todos los arrays están vacíos, retornar null
  }else{
    const footerContent = [];
    if(form.get('footerceldas').value==="1"){ 
      footerContent.push(this.createFooterPorcent2(arrayizqfooter,null,null,form.get('footertamano1').value,form.get('footertamano2').value,form.get('footertamano3').value,currentPage,pageCount))
   }else if(form.get('footerceldas').value==="2"){
      footerContent.push(this.createFooterPorcent2(arrayizqfooter,arraycenterfooter,null,form.get('footertamano1').value,form.get('footertamano2').value,form.get('footertamano3').value,currentPage,pageCount))
   }else {
      footerContent.push(this.createFooterPorcent2(arrayizqfooter,arraycenterfooter,arrayderfooter,form.get('footertamano1').value,form.get('footertamano2').value,form.get('footertamano3').value,currentPage,pageCount))
   }
    let variante = this.cmToPoints(this.formulario1.get('margensuperior').value)-this.cmToPoints(form.get('nuevomargenfooter').value)
    return {
        columns: footerContent,
        margin: [margenizq,variante, margender,this.cmToPoints(form.get('nuevomargenfooter').value)],
      };
    }
  }; 
  createFooterPorcent2(content1,content2,content3,width1,width2,width3,currentPage,pageCount) {
    // const content=[content1,content2,content3]
    // for (let i = 0; i < content.length; i++){
    //   content[i].map( item => {
    //     item.text = item.text.replace('TotalPaginas',pageCount);
    //     if(item.text.includes('PaginaActual')&&(this as any)['variablenumero'+i]===1){
    //       const partesSeparadas = this.separarPorCurrentPage(item.text);
    //       item.text = partesSeparadas.antes+' ' + currentPage.toString() + ' '+ partesSeparadas.despues;
    //       (this as any)['string1'+i]=partesSeparadas.antes
    //       (this as any)['string2'+i]=partesSeparadas.despues
    //       (this as any)['variablenumero'+i]++
    //     }else if( this['variablenumero'+i]===2)
    //     {
    //       item.text=  (this as any)['string1'+i] + currentPage.toString() +   (this as any)['string2'+i]
    //     }else{
    //       item.text=item.text
    //     }
    //   });
    // }
    if(content1 !==null){
      content1.map( item => {
        item.text = item.text.replace('TotalPaginas',pageCount);
        if(item.text.includes('PaginaActual')&&this.variablenumero1===1){
          const partesSeparadas = this.separarPorCurrentPage(item.text);
          item.text = partesSeparadas.antes+' ' + currentPage.toString() + ' '+ partesSeparadas.despues;
          this.string11=partesSeparadas.antes
          this.string21=partesSeparadas.despues
          this.variablenumero1++
        }else if(this.variablenumero1===2)
        {
          item.text=this.string11 + currentPage.toString() + this.string21
        }else{
          item.text=item.text
        }
      });
    }
    if(content2 !==null){
      content2.map( item => {
        item.text = item.text.replace('TotalPaginas',pageCount);
        if(item.text.includes('PaginaActual')&&this.variablenumero2===1){
          const partesSeparadas = this.separarPorCurrentPage(item.text);
          item.text = partesSeparadas.antes+' ' + currentPage.toString() + ' '+ partesSeparadas.despues;
          this.string12=partesSeparadas.antes
          this.string22=partesSeparadas.despues
          this.variablenumero2++
        }else if(this.variablenumero2===2)
        {
          item.text=this.string12 + currentPage.toString() + this.string22
        }else{
          item.text=item.text
        }
      });
    }
    if(content3 !==null){
      content3.map( item => {
          item.text = item.text.replace('TotalPaginas',pageCount);
          if(item.text.includes('PaginaActual')&&this.variablenumero3===1){
            const partesSeparadas = this.separarPorCurrentPage(item.text);
            item.text = partesSeparadas.antes+' ' + currentPage.toString() + ' '+ partesSeparadas.despues;
            this.string13=partesSeparadas.antes
            this.string23=partesSeparadas.despues
            this.variablenumero3++
          }else if(this.variablenumero3===2)
          {
            item.text=this.string13 + currentPage.toString() + this.string23
          }else{
            item.text=item.text
          }
      });
    }
      return {
          table: {
              widths: [width1+'%',width2+'%',width3+'%'],
              body: [[content1,content2,content3]],
          },
          layout: 'noBorders'
      };
  }
  filtratit(arrcomp:any,titulo:any){
    let arraux=[];
    let arrop=JSON.parse(JSON.stringify(arrcomp));
    for(let row of arrop){
      if (row.item != titulo){
        var palabra = row.item.toString().substring(0, titulo.toString().length + 1)
        if (palabra == (titulo + '.')) {
          arraux.push(row);
        }
      }
    }
    return arraux;
  }
  filtratit2(arrcomp:any,titulo:any){
    let arraux=[];
    let arrop=JSON.parse(JSON.stringify(arrcomp));
    for(let row of arrop){
      if(row.item===titulo){
        arraux.push(row)
      }
      if (row.item != titulo){
        var palabra = row.item.toString().substring(0, titulo.toString().length + 1)
        if (palabra == (titulo + '.')) {
          arraux.push(row);
        }
      }
    }
    return arraux;
  }
  AgregarLugar(texto,number){
    if(texto==='null'||texto===null||texto===undefined||!texto){
        return ''
    }else if(number===0){
      return texto +' - '
    }else{
      return texto
    }
  }
  async Recorteimagenes2(base64: string,margintop,marginbot,headerwidth): Promise<{ subimages: any[],headerimg:any[] }> {
    return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      //altura 50
      let subimages=[]
      let headerimg=[]
      var valores=this.opcionespaginas[this.formulario1.get('opciones1').value]
      let altura =this.orientacion_pagina2==='landscape'? (valores.width-(marginbot+margintop)) :(valores.height-(marginbot+margintop))
      let ancho =this.orientacion_pagina2==='landscape'? (valores.height-(this.margenizq+this.margender)) : (valores.width-(this.margenizq+this.margender))
      var reduccion=this.formulario1.get('opcionzoom').value
      var tituloheight= parseInt(this.formulario1.get('tamanofuente').value)
      var extrawidth= 7-(headerwidth%18)
      var extraheight=14
      var maxheight2 = parseInt(altura.toString())
      var maxwidth2=parseInt(ancho.toString())
      var maxSubWidth=parseInt((ancho*reduccion).toString())
      var maxSubHeight=parseInt((altura*reduccion).toString())
      var originalWidth = img.width
      var originalHeight = img.height
      // console.log(originalWidth)
      // console.log(originalHeight)
      // var widthtabla=originalWidth/(this.datos.tamanios.wgantt+this.datos.tamanios.wheader)
      var ExtraOriginalWidth = originalWidth % maxSubWidth
      var ExtraOriginalHeight= originalHeight%maxSubHeight
      var numCols = Math.ceil(originalWidth / maxSubWidth);
      var numRows = Math.ceil(originalHeight / maxSubHeight);
      if(ExtraOriginalWidth<500 && numCols>1){
          numCols--
        maxSubWidth=maxSubWidth+(ExtraOriginalWidth/numCols)
      }
      if(ExtraOriginalHeight<500 && numRows>1){
        numRows--
        maxSubHeight=maxSubHeight+(ExtraOriginalHeight/numRows)
      }
      // var variablewidth=widthtabla*25
      var widthcorte=Math.floor(maxSubWidth/25)*25
      var heightcorte=Math.floor(maxSubHeight/22)*22
      var heightactual=0
      for (let fila = 0; fila < numRows; fila++) {
        var widthactual=0
        for (let colum = 0; colum < numCols; colum++) {
          var cortex=widthcorte
          var cortey=heightcorte
          var maxheight=maxheight2
          var maxwidth=maxwidth2
          const startX = widthactual;
          const startY = heightactual;
          if(fila===0&&colum===0){
            cortey=heightcorte-extraheight
            cortex=widthcorte-extrawidth
          }else if(fila===0&&colum!==0){
            cortey=heightcorte-extraheight
          }else if(fila!==0&&colum===0){
            cortex=widthcorte-extrawidth
          }
          const width = Math.min(cortex, originalWidth - startX);
          const height = Math.min(cortey, originalHeight - startY);
          let canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
          let subimageBase64 = canvas.toDataURL('image/png');
          if(cortex> (originalWidth-startX)){
            maxwidth=width/reduccion
          }
          if(cortey> (originalHeight - startY)){
            maxheight=height/reduccion
          }
          if(fila===0){
            maxheight=maxheight-(tituloheight+25)
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, startX, 0, width, 50, 0, 0, width, 50);
            let HeadeBase64 = canvas.toDataURL('image/png');
            headerimg.push({image:HeadeBase64,width:maxwidth,height:''})
          }
          subimages.push({image:subimageBase64,width:maxwidth,height:maxheight})
          widthactual=widthactual+cortex
        }
        heightactual=heightactual+cortey
      }
      resolve({subimages:subimages, headerimg:headerimg});
    };
    img.onerror = reject; 
  })
  }
  async Recorteimagenes3(base64: string,margintop,marginbot,headerwidth): Promise<{ subimages: any[],headerimg:any[] }> {
    return new Promise((resolve, reject) => {
      //height de encabezado 50 wheader 1007 widths 18 heig 24
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let subimages=[]
      let headerimg=[]
      var valores=this.opcionespaginas[this.formulario1.get('opciones1').value]
      let altura =this.orientacion_pagina2==='landscape'? (valores.width-(marginbot+margintop)) :(valores.height-(marginbot+margintop))
      let ancho =this.orientacion_pagina2==='landscape'? (valores.height-(this.margenizq+this.margender)) : (valores.width-(this.margenizq+this.margender))
      var reduccion=this.formulario1.get('opcionzoom').value
      var tituloheight= parseInt(this.formulario1.get('tamanofuente').value)
      var extrawidth= (headerwidth%18)-7
      var extraheight=14
      var maxheight2 = parseInt(altura.toString())
      var maxwidth2=parseInt(ancho.toString())
      var maxSubWidth=parseInt((ancho*reduccion).toString())
      var maxSubHeight=parseInt((altura*reduccion).toString())
      var originalWidth = img.width
      var originalHeight = img.height
      var ExtraOriginalWidth = originalWidth % maxSubWidth
      var ExtraOriginalHeight= originalHeight%maxSubHeight
      var numCols = Math.ceil(originalWidth / maxSubWidth);
      var numRows = Math.ceil(originalHeight / maxSubHeight);
      if(ExtraOriginalWidth<500 && numCols>1){
          numCols--
        maxSubWidth=maxSubWidth+(ExtraOriginalWidth/numCols)
      }
      if(ExtraOriginalHeight<500 && numRows>1){
        numRows--
        maxSubHeight=maxSubHeight+(ExtraOriginalHeight/numRows)
      }
      // var variablewidth=widthtabla*25
      var widthcorte=Math.floor(maxSubWidth/18)*18
      var heightcorte=Math.floor(maxSubHeight/24)*24
      var heightactual=0
      for (let fila = 0; fila < numRows; fila++) {
        var widthactual=0
        for (let colum = 0; colum < numCols; colum++) {
          var cortex=widthcorte
          var cortey=heightcorte
          var maxheight=maxheight2
          var maxwidth=maxwidth2
          const startX = widthactual;
          const startY = heightactual;
          if(fila===0&&colum===0){
            cortey=heightcorte-extraheight
            cortex=widthcorte-extrawidth
          }else if(fila===0&&colum!==0){
            cortey=heightcorte-extraheight
          }else if(fila!==0&&colum===0){
            cortex=widthcorte-extrawidth
          }
          if((fila!==0) &&(fila!==numRows-1)){
            cortey=cortey-60
          }
          const width = Math.min(cortex, originalWidth - startX);
          const height = Math.min(cortey, originalHeight - startY);
          let canvas = document.createElement('canvas');
          let ctxResize = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          ctxResize.imageSmoothingEnabled = true;
          ctxResize.imageSmoothingQuality = 'high';
          ctxResize.drawImage(img, startX, startY, width, height, 0, 0, width, height);
          let subimageBase64 = canvas.toDataURL('image/jpeg', 1.00); 
          if(cortex> (originalWidth-startX)){
            maxwidth=width/reduccion
          }
          if(cortey> (originalHeight - startY)){
            maxheight=height/reduccion
          }
          if(fila===0){
            maxheight=maxheight-(tituloheight+25)
            if(numRows>0){
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = 50; 
            let ctxResize = canvas.getContext('2d');
            ctxResize.imageSmoothingEnabled = true;
            ctxResize.imageSmoothingQuality = 'high';
            ctxResize.drawImage(img, startX, 0, width, 50, 0, 0, width, 50);
            let HeadeBase64 = canvas.toDataURL('image/jpeg', 1.00); 
            headerimg.push({image:HeadeBase64,width:maxwidth,height:50/reduccion})
            }
          // }else if((fila!==0) &&(fila!==numRows-1)){
          }else if(fila!==0){
            maxheight=maxheight-50/reduccion
          }
          subimages.push({image:subimageBase64,width:maxwidth,height:maxheight})
          widthactual=widthactual+cortex
        }
        heightactual=heightactual+cortey
      }
      resolve({subimages:subimages, headerimg:headerimg});
    };
    img.onerror = reject; 
  })
  }
  createSVGImage(base64: string, width: number, height: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
              <image href="${base64}" width="${width}" height="${height}"/>
            </svg>`;
  }
  async Recorteimagenes(base64: string,margintop,marginbot,headerwidth): Promise<{ subimages: any[],headerimg:any[] }> {
    const scaleFactor = 1;
    let subimages=[]
    let headerimg=[]
    var valores=this.opcionespaginas[this.formulario1.get('opciones1').value]
    let altura =this.orientacion_pagina2==='landscape'? (valores.width-(marginbot+margintop)) :(valores.height-(marginbot+margintop))
    let ancho =this.orientacion_pagina2==='landscape'? (valores.height-(this.margenizq+this.margender)) : (valores.width-(this.margenizq+this.margender))
    var reduccion=this.formulario1.get('opcionzoom').value
    var tituloheight= parseInt(this.formulario1.get('tamanofuente').value)
    var extrawidth= 7-(headerwidth%25)
    var extraheight=14
    var maxheight2 = parseInt(altura.toString())
    var maxwidth2=parseInt(ancho.toString())
    var maxSubWidth=parseInt((ancho*reduccion).toString())*scaleFactor
    var maxSubHeight=parseInt((altura*reduccion).toString())*scaleFactor
    var originalWidth = this.datos.tamanios.w1imag*scaleFactor
    var originalHeight =this.datos.tamanios.h1imag*scaleFactor
    return new Promise((resolve, reject) => {
      const svgContent = this.createSVGImage(base64,originalWidth,originalHeight);
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const svgImage = new Image();
      svgImage.src = svgUrl;
      svgImage.onload = () => {
      //altura 50
      // var widthtabla=originalWidth/(this.datos.tamanios.wgantt+this.datos.tamanios.wheader)
      var ExtraOriginalWidth = originalWidth % maxSubWidth
      var ExtraOriginalHeight= originalHeight%maxSubHeight
      var numCols = Math.ceil(originalWidth / maxSubWidth);
      var numRows = Math.ceil(originalHeight / maxSubHeight);
      if(ExtraOriginalWidth<500 && numCols>1){
          numCols--
        maxSubWidth=maxSubWidth+(ExtraOriginalWidth/numCols)
      }
      if(ExtraOriginalHeight<500 && numRows>1){
        numRows--
        maxSubHeight=maxSubHeight+(ExtraOriginalHeight/numRows)
      }
      // var variablewidth=widthtabla*25
      var widthcorte=Math.floor(maxSubWidth/25)*25
      var heightcorte=Math.floor(maxSubHeight/22)*22
      var heightactual=0
      for (let fila = 0; fila < numRows; fila++) {
        var widthactual=0
        for (let colum = 0; colum < numCols; colum++) {
          var cortex=widthcorte
          var cortey=heightcorte
          var maxheight=maxheight2
          var maxwidth=maxwidth2
          const startX = widthactual;
          const startY = heightactual;
          if(fila===0&&colum===0){
            cortey=heightcorte-extraheight
            cortex=widthcorte-extrawidth
          }else if(fila===0&&colum!==0){
            cortey=heightcorte-extraheight
          }else if(fila!==0&&colum===0){
            cortex=widthcorte-extrawidth
          }
          const width = Math.min(cortex, originalWidth - startX);
          const height = Math.min(cortey, originalHeight - startY);
          let canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(svgImage, startX, startY, width*scaleFactor, height*scaleFactor, 0, 0, width*scaleFactor, height*scaleFactor);
          const subimageBase64 = canvas.toDataURL('image/png');
          if(cortex> (originalWidth-startX)){
            maxwidth=width*scaleFactor/reduccion
          }
          if(cortey> (originalHeight - startY)){
            maxheight=height*scaleFactor/reduccion
          }
          if(fila===0){
            maxheight=maxheight-(tituloheight+25)
            if(numRows>0){
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = 50; 
            let ctxResize = canvas.getContext('2d');
            ctxResize.drawImage(svgImage, startX, 0, width*scaleFactor, 50*scaleFactor, 0, 0, width*scaleFactor, 50*scaleFactor);
            let HeadeBase64 =  canvas.toDataURL('image/png');
            headerimg.push({image:HeadeBase64,width:maxwidth*scaleFactor,height:50*scaleFactor/reduccion})
            }
          // }else if((fila!==0) &&(fila!==numRows-1)){
          }else if(fila!==0){
            maxheight=maxheight-50/reduccion
          }
          subimages.push({image:subimageBase64,width:maxwidth,height:maxheight})
          widthactual=widthactual+cortex
        }
        heightactual=heightactual+cortey
      }
      resolve({subimages:subimages, headerimg:headerimg}); // Resolver la promesa con el array de imágenes recortadas
    };
    svgImage.onerror = reject; 
  })
  }
   ConvertHTML(html){
    var colorgeneral = this.colorgeneral;
    let tamano = parseInt(this.formulario1.get('tamanofuente').value);
    let pdfmakeContent = htmlToPdfmake(html, {
      defaultStyles: {
        p:{
          alignment:'justify',
          margin:[10,0,0,0],
          //margin:[10,-5,0,-5],
          fontSize:tamano,
          color:colorgeneral
        },
        strong:{
          alignment:'justify',
          fontSize:tamano,
          color:colorgeneral
        },
        b:{
          alignment:'justify',
          fontSize:tamano,
          color:colorgeneral
        },
        u:{
          alignment:'justify',
          fontSize:tamano,
          color:colorgeneral
        },
        s:{
          fontSize:tamano,
          color:colorgeneral
        },
        em:{
          fontSize:tamano,
          color:colorgeneral
        },
        i:{
          fontSize:tamano,
          color:colorgeneral
        },
        h1:{
          fontSize:tamano+10,
          color:colorgeneral
        },
        h2:{
          fontSize:tamano+8,
          color:colorgeneral
        },
        h3:{
          fontSize:tamano+6,
          color:colorgeneral
        },
        h4:{
          fontSize:tamano+4,
          color:colorgeneral
        },
        h5:{
          fontSize:tamano+2,
          color:colorgeneral
        },
        h6:{

          fontSize:tamano+1,
          color:colorgeneral
        },
        a:{
          fontSize:tamano,
          color:colorgeneral
        },
        strike:{
          fontSize:tamano,
          color:colorgeneral
        },
        ul:{

          fontSize:tamano,
          color:colorgeneral,
        },
        ol:{

          fontSize:tamano,
          color:colorgeneral,
        },
        th:{

          fontSize:tamano,
          color:colorgeneral
        },
        td:{

          fontSize:tamano,
          color:colorgeneral
        },
        li:{

          fontSize:tamano,
          color:colorgeneral
        },
        img:{
          alignment:'center'
        },
        table:{
          marginBottom:10
        }
      }
    })
    if (Array.isArray(pdfmakeContent)) {
      return pdfmakeContent.map(element => {
        if (element.table) {
          return {
            columns: [
              { width: '*', text: '' },
              { width: 'auto', table: element.table },
              { width: '*', text: '' }
            ]
          };
        }
        return element;
      });
    } else {
      // Manejar el caso en que pdfmakeContent no es un array
      console.error('El contenido de pdfmake no es un array');
      return [];
    }
  }
  async agregarError(partida: any, texto: any) {
    if(this.contador==1){
      this.errores.push({ partida, texto });
    }
  }
  async urlToDataURL(item,url: string): Promise<string | null> {
    try {
      // console.log(`Fetching image: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
          console.warn(`Error fetching image (${url}): ${response.status} ${response.statusText}`);
          return null
      }
      const blob = await response.blob();
      return new Promise<string | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => {
              let texto='la imagen no se pudo visualizar'
              this.agregarError(item,texto)
              resolve(null);
          };
          reader.readAsDataURL(blob);
      });
    } catch (error) {
        console.warn(`Error processing image (${url}):`, error);
        return null
    }
  }
  async processHTMLWithImages(item,htmlContent: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');
    for (const img of Array.from(images)) {
        const imgUrl = img.src;
        const dataURL = await this.urlToDataURL(item,imgUrl);
        //const dataURL = await this.convertImageToBase64(imgUrl);
        if (dataURL) {
            img.src = dataURL;
        } else {
            console.warn(`Omitting image: ${imgUrl}`);
            img.remove();
        }
    }
    return doc.documentElement.outerHTML;
  }
  ajustarHTML(partida, html: string, tipo) {
      const ulRegex = /<ul>([\s\S]*?)<\/ul>/g;
      const olRegex = /<ol>([\s\S]*?)<\/ol>/g;
      let contadorUL = 0;
      let contadorOL = 0;
      const reemplazarUL = (contenido: string): string => {
          contadorUL++;
          let contenidoProcesado = contenido.replace(/<li style="list-style-type: none;">/g, '');
          let ulProcesado = `<ul style="margin-left: ${contadorUL * 20}px;">${contenidoProcesado}</ul>`;
          contadorUL--;
          return ulProcesado;
      };
      const reemplazarOL = (contenido: string): string => {
          contadorOL++;
          let contenidoProcesado = contenido.replace(/<li style="list-style-type: none;">/g, '');
          let olProcesado = `<ol style="margin-left: ${contadorOL * 20}px;">${contenidoProcesado}</ol>`;
          contadorOL--;
          return olProcesado;
      };
      let htmlProcesado = html === null ? '' : tipo === "pdf" ?
          (() => {
              const regexImg = /<img[^>]+src=["'](?!data:image\/(?:png|jpeg)[^"']+)data:image\/[^"']+["'][^>]*>/gi;
              const match = html.match(regexImg);
              if (match) {
                  let texto = 'Imagen no está en formato PNG o JPGE';
                  this.agregarError(partida, texto);
              }
              html = this.procesarSiExistenTablas(html,partida)
              // html=this.extractAndFixTables(html)
              return html
                  .replace(/id=/g, '')
                  .replace(/<\/p>/g, '</p>&nbsp;')
                  .replace(/padding-left: auto; padding-right: auto;/g, '')
                  .replace(/margin-left: auto; margin-right: auto;/g, '')
                  .replace(ulRegex, reemplazarUL)
                  .replace(olRegex, reemplazarOL)
                  .replace(/font-family/g, '')
                  .replace(regexImg, '')
                  .replace(/font-size: 800/g,'font-weight:800')
          })()
          :html.replace(/<ul><li><ul><li>/g,'<ul><li>').replace(/<\/li><\/ul><\/li><\/ul>/g,'</li></ul>')
          .replace(/<h5/g,'<p')
          .replace(/<\/h5/g,'</p')
          .replace(ulRegex, reemplazarUL)
          .replace(olRegex, reemplazarOL)
          .replace(/font-size: 800/g,'font-weight:800')
          .replace(/<b([^>]*)>([^<]*)(<\/p>|<\/div>|<\/h[1-6]>)/g, '<b$1>$2</b>$3');

      return { htmlProcesado: htmlProcesado };
  }
//    adjustMarginsAndPaddings(html: string){
//     // Crear un contenedor temporal para procesar el HTML
//     const container = document.createElement('div');
//     container.innerHTML = html;
//     // Seleccionar todos los elementos con estilos de margen o relleno
//     const elements = container.querySelectorAll<HTMLElement>('*'); // Asegúrate de que sea HTMLElement
//     elements.forEach(element => {
//         const style = window.getComputedStyle(element);
//         let marginLeft = parseFloat(style.marginLeft);
//         let paddingLeft = parseFloat(style.paddingLeft);
//         // Ajustar el margen izquierdo y el relleno izquierdo
//         if (marginLeft >= 20) {
//             (element.style as CSSStyleDeclaration).marginLeft = `${marginLeft - 20}px`;
//         }
//         if (paddingLeft >= 20) {
//             (element.style as CSSStyleDeclaration).paddingLeft = `${paddingLeft - 20}px`;
//         }
//     });
//     return  container.innerHTML;
// }

  extractAndFixTables(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Encuentra todas las tablas en el HTML
  const tables = doc.querySelectorAll('table');
  if (tables.length === 0) return html;
  let fixedHtml = html;
  tables.forEach((table) => {
      const fixedTableHtml = this.fixTableHtml(table.outerHTML);
      // Recombina el contenido antes, la tabla arreglada y el contenido después
      fixedHtml = fixedHtml.replace(table.outerHTML, fixedTableHtml);
  });
  return fixedHtml; // Devuelve el HTML corregido
  }
  fixTableHtml(html: string): string {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const table = doc.querySelector('table');
      if (!table) return html;

      const tbody = table.querySelector('tbody') || doc.createElement('tbody');
      table.appendChild(tbody);

      const rows = Array.from(tbody.querySelectorAll('tr'));
      const maxColumns = this.calculateMaxColumns(rows);

      this.adjustRows(rows, maxColumns);

      const serializer = new XMLSerializer(); 
      return serializer.serializeToString(doc);
  }
  calculateMaxColumns(rows: HTMLTableRowElement[]): number {
      let maxColumns = 0;

      rows.forEach((row) => {
          let currentColumn = 0;
          const cells = row.querySelectorAll('td, th');

          cells.forEach((cell) => {
              const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
              currentColumn += colspan;
          });

          maxColumns = Math.max(maxColumns, currentColumn);
      });

      return maxColumns;
  }
  adjustRows(rows: HTMLTableRowElement[], maxColumns: number): void {
    rows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          let currentColumn = 0;

          // Primer paso: contar el número de columnas ocupadas
          cells.forEach((cell) => {
              const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
              currentColumn += colspan;
          });

          // Segundo paso: ajustar celdas
          if (currentColumn < maxColumns) {
              // Agregar celdas vacías
              while (currentColumn < maxColumns) {
                  const newCell = document.createElement(cells.length === 0 ? 'th' : 'td');
                  newCell.innerHTML = '';
                  row.appendChild(newCell);
                  currentColumn++;
              }
          } else if (currentColumn > maxColumns) {
              // Eliminar celdas extra
              while (currentColumn > maxColumns) {
                  const lastCell = cells.pop();
                  if (lastCell) {
                      row.removeChild(lastCell);
                      currentColumn--;
                  }
              }
          }
    });
  }
  async CrearEspecificaciones(array) {
    var tablasfinales = [];
    var colorgeneral = this.colorgeneral;
    var monocromado = this.formulario1.get('opciones3').value;
    let tamano = parseInt(this.formulario1.get('tamanofuente').value);
    if(this.datos.html!==null){
      tablasfinales.push( this.ConvertHTML(this.ajustarHTML(' ',this.datos.html,"pdf").htmlProcesado))
    }
    tablasfinales.push({text:this.datos.titulo2,bold:true,alignment:'center',style:'allheader',margin:[0,5,0,5]})
    for (let n = 0; n < array.length; n++) {
      let color = monocromado === 'monocromado' ? colorgeneral : array[n].color ? array[n].color : colorgeneral
      let bold = array[n].tipoletra === "4" || array[n].tipoletra === "3"||array[n].tipoletra === "1" ? true : false
      let italics = array[n].tipoletra === "4" || array[n].tipoletra === "2" ? true : false
      // const htmlima=await  this.processHTMLWithImages(array[n].item,array[n].especificacion)
      let htmlSinIds = this.ajustarHTML(array[n].item,array[n].especificacion,"pdf").htmlProcesado
      let convertedHTML =   this.ConvertHTML(htmlSinIds)
      tablasfinales.push({
        margin: [0,5,0,10],
        columns: [
          {
            width: 'auto',
            text: this.opcestado==="1"? array[n].auxiliar:array[n].item,
            color: color,
            bold: bold,
            italics: italics,
            fontSize: tamano
          },
          {
            width: '*',
            text: array[n].descripcion,
            color: color,
            bold: bold,
            italics: italics,
            fontSize: tamano,
            margin: [10, 0],
          },
          {
            width: 25+tamano-4,
            text: array[n].unidad,
            color: color,
            bold: bold,
            italics: italics,
            fontSize: tamano,
            alignment: 'right'
          }
        ],
       },convertedHTML);
    }
    this.contador++
    return  tablasfinales;
  }
  FormulaTabla():{ Tabla1: any[],Tabla2:any[],imagen:any,texto:any,tablainicial:any[]} {
    this.exceldatos=this.datos.tabla
    this.exceltabla2=this.datos.tabla3
    this.exceltabla3=this.datos.tabla4
    if(this.contador===1){
      this.excelheader = (JSON.parse(JSON.stringify(this.datos.header3)))
    }
    let tamano = parseInt(this.formulario1.get('tamanofuente').value)+2
    var ColumnasSeleccionadas2 = this.datos.keys_body2
    var ColumnasSeleccionadas = this.datos.keys_body;
    var ColumnasSeleccionadas3 = this.datos.keys_body3;
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    var auxiliar2 = this.datos.col_alig2
    var auxiliar3=this.datos.col_alig3
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -1:0
    var monocromado = this.formulario1.get('opciones3').value
    var image={image:this.datos.img_formula,alignment:'center' ,margin:[0,10,0,25],width:400}
    var texto= 	{columns: [
        {text:this.datos.data_fp.text2,alignment:'right',color:colorgeneral,fontSize:tamano},
        {text:this.datos.data_fp.estado2,alignment:'left',color:'red',fontSize:tamano}],columnGap: 10
    }
    var tableData = []
    var tableData2=[]
    var tablainicial=[]
    var encabezado= this.AgregarSpan(this.datos.header,monocromado,0,'center','#F4F9FF')
    var encabezado2= this.AgregarSpan(this.datos.header2,monocromado,0,'center','#F4F9FF')
    var encabezado3= this.AgregarSpanFormula(this.datos.header3,monocromado,0,'center','#F4F9FF',2)
    tableData=tableData.concat(encabezado)
    tableData2=tableData2.concat(encabezado2)
    tablainicial=tablainicial.concat(encabezado3)
    this.datos.tabla4.forEach((persona)=> {
      let array1=[]
      for(let i=0;i<ColumnasSeleccionadas3.length;i++){
        const column =ColumnasSeleccionadas3[i];
        let alignment = persona.alinea? persona.alinea:auxiliar3[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if((column==='total_costos'||column==='monto_gru')&& (persona[column]!=='')){
          var numerofor= this.formatearNumero(persona[column],2)
          array1.push({text:moneda,color : color , bold:bold,margin:[-2,0,-2,0] ,italics:italics,alignment:'left',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({ text:numerofor,alignment: 'right' , margin:[-2,0,-2,0] , borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else  if((column==='total_costos'||column==='monto_gru') &&  ((persona[column]==='')||(persona[column]===null))){
          array1.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({text:'',borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],border:[false,true,true,true] })
        }else{
          array1.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics});
        }
      }
      tablainicial.push(array1);
    });
    this.datos.tabla.forEach(function(persona) {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7): persona.alinea? '#DEDDE6':''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales=persona.tipoletra==="3"?0:4
        if (persona.hasOwnProperty(column)) {
          const value = persona[column];
          if (typeof value === 'object') {
            array.push({ text:value.text?value.text:'', alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }else {
            array.push({ text:value,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }
        } else {
          array.push({ text:'',margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array);
    });
    this.datos.tabla3.forEach(function(persona) {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas2.length;i++){
        const column =ColumnasSeleccionadas2[i];
        let alignment = persona.alinea? persona.alinea:auxiliar2[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7): persona.alinea? '#DEDDE6':''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        const value = persona[column];
        // if (typeof value === 'object' && column!=='indice_inicial'&& value!==null) {
        //     // Si la propiedad es un objeto
        //     // array.push({
        //     //   margin:[0,-2],
        //     //   borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
        //     //   columns:[
        //     //     {width:'*',text:''},
        //     //     {width:'auto',	table: {
        //     //     body: [
        //     //       [{text:value.text,color :'#fefefe',bold:bold ,italics:italics,fillColor:value.fondo,margin:[7,0]}],
        //     //     ]
        //     //   },layout:'noBorders'}
        //     //   ,{width:'*',text:''}
        //     //     ]
        //     // })
        //     // array.push({
        //     //   borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
        //     //   stack: [
        //     //     { text:'   '+value.text+'   ', color :'#fefefe',bold:bold ,italics:italics,background:value.fondo,alignment:'center' }
        //     // ]
        //     // })
        //   }else if(typeof value === 'object'&& column==='indice_inicial'&&value!==null){
        //     array.push({ text:value.text,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:value.fondo, color : color, bold:bold ,italics:italics});
        //   }else {
        //     array.push({ text:value,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        //   }
        if (typeof value === 'object' && column==='menor5'&& value!==null) {
            if(value.text==='SI'){
              array.push({
                borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
                stack: [
                  { text:'   '+value.text+'   ', color :'#fefefe',bold:bold ,italics:italics,background:value.fondo,alignment:'center' }
                ]
              })
            }else{
              array.push({
                borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
                stack: [
                  { text:'   '+value.text+'   ',bold:bold ,italics:italics,background:value.fondo,alignment:'center' }
                ]
              })
            }
          }else if(typeof value === 'object'&& column!=='menor5'&&value!==null){
            array.push({ text:value.text,margin:[padd,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics});
          }else if(column==='id_indice'&& persona['menor5'].text==='NO'&& persona['agrupamiento']===''){
            array.push({ text:'', alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }else if(column==='desc_indice'&& persona['menor5'].text==='NO'&& persona['agrupamiento']===''){
            array.push({ text: persona['id_indice']+ ' '+ value,margin:[padd+8,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }else {
            array.push({ text:value,margin:[padd,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }
      }
      tableData2.push(array);
    });
    return { Tabla1: tableData,Tabla2:tableData2,imagen:image,texto,tablainicial:tablainicial}
  }
  CrearTablaindirectos(array,indice){
    const datos= array.filter((item)=>item.indice==indice)
    this.excelheader=this.datos.header
    this.exceldatos=datos
    var ColumnasSeleccionadas = this.datos.keys_body
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value 
    var tableData = []
    var prueba=[]
    var total=0
    var nuevatabla=[]
    this.exceltabla2=[]
    var opc = JSON.parse(JSON.stringify(this.datos.header))
    for (let i = 0; i < opc.length; i++) {
      if (typeof this.datos.header[i] === 'string') {
        let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[i].color? this.datos.header[i].color:this.colorgeneral 
          if(i<7){
           nuevatabla.push({ text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
          }else{
            nuevatabla.push({ text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
            nuevatabla.push(null)
          }
      }
    }
    tableData.push(nuevatabla)
    this.contador++
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    const primerNoNulo =  this.datos.keys_dec.find(item => item !== null)
    datos.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea&&column=='descripcion'? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '':  persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= column=='descripcion'? persona.tipofila?persona.tipofila.toString()*5:0:0
        if(persona[column]!==null &&persona[column]!==undefined &&persona[column]!==''&&persona[column]!=0 &&column=='total'&&this.isNumber(persona[column])){
          var numerofor= this.formatearNumero(this.formService.redondeo(persona[column],primerNoNulo),2) 
          array.push({text:moneda,color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:numerofor,alignment: 'right' ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else if((persona[column]==null ||persona[column]==undefined||persona[column]==''||persona[column]==0) && column=='total'){
          array.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:'',alignment: 'right' ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground,border:[false,true,true,true]});
        }else{
          if((column=='incidencia'||column=='cantidad'||column=='tiempo'||column=='tarifa')&&(persona[column]!=''&&persona[column]!=null&&persona[column]!=0)&&this.isNumber(persona[column])){
            var numerofor= this.formatearNumero(persona[column],2)
            array.push({ text:numerofor,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
          }else{
            if(persona[column]==0){
              array.push({ text:'',margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
            }else{
              array.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
            }
          }
        }
        if((persona.tipofila==1||persona.tipofila==2)&&column=='item'){
          prueba.push(persona)
          this.exceltabla2.push([{alinea: "left",colSpan: 1,color: "",fondo: "",text:persona.item,tipoletra: "3"},{alinea: "center",colSpan: 1,color: "",fondo: "",text:persona.descripcion,tipoletra: "3"},{alinea: "right",colSpan: 1,color: "",fondo: "",text:persona.total,tipoletra: "3"}])
        }else if(persona.tipofila===3&&column=='item'&&this.formulario1.get('mostrarsubtitulos').value){
          prueba.push(persona)
          this.exceltabla2.push([{alinea: "left",colSpan: 1,color: "",fondo: "",text:persona.item,tipoletra: "1"},{alinea: "center",colSpan: 1,color: "",fondo: "",text:persona.descripcion,tipoletra: "1"},{alinea: "right",colSpan: 1,color: "",fondo: "",text:persona.total,tipoletra: "1"}])
        }
      }
      tableData.push(array);
    });
    let tabla2=[]
    var header2=[{ text:'CODIGO', fillColor: '#D6E3F4', alignment: 'center',color:this.colorgeneral ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']},
    { text:'ESPECIFICA DE GASTOS', fillColor: '#D6E3F4', alignment: 'center',color:this.colorgeneral ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']},
    { text:'COSTO', fillColor: '#D6E3F4', alignment: 'center',color:this.colorgeneral ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']}]    
    tabla2.push(header2)
    for(let k=0;k-prueba.length;k++){
      let color = monocromado==='monocromado'? colorgeneral:prueba[k].color&&prueba[k].tipofila==1&&this.formulario1.get('mostrarsubtitulos').value? prueba[k].color:colorgeneral 
      let bold = this.formulario1.get('mostrarsubtitulos').value? prueba[k].tipofila==2? true:false:false
      let valor=prueba[k].total==''||prueba[k].total<0.0001? '':this.formatearNumero(this.formService.redondeo(prueba[k].total,primerNoNulo),2) 
      tabla2.push([{ text:prueba[k].item ,alignment: 'left',colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],bold:bold,color:color},
        { text:prueba[k].descripcion ,alignment:'left' ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
          margin:[prueba[k].tipofila*5,0],bold:bold,color:color
        },
        { text:valor,alignment: 'right' ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],bold:bold,color:color}
      ])
      if(prueba[k].tipofila==2){
        total=total+prueba[k].total
      }
    }
    tabla2.push([{ text:'TOTAL GASTOS EXPEDIENTE TECNICO' ,alignment: 'center',color:this.colorgeneral ,colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],bold:true},
      null,
      { text:this.formatearNumero(this.formService.redondeo(total,primerNoNulo),2) ,alignment: 'right',color:this.colorgeneral ,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],bold:true}
    ])
    this.exceltabla2.push([{text:'TOTAL GASTOS EXPEDIENTE TECNICO',alinea: "center",colSpan:2,color: "",fondo: "",tipoletra: "3"},{alinea: "right",colSpan: 1,color: "",fondo: "",text:total,tipoletra: "3"}])
    return { Tabla1: tableData,Tabla2:tabla2}
  }
  WidthNormal(array,number){
    var widths=[]
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    if(number===1){
      for(let n=0;n<array.length;n++){
        if(array[n]==='agrupamiento'){
          widths.push('*')
        }else{
          widths.push('auto')
        }
      }
    }else if(number===2){
      for(let n=0;n<array.length;n++){
        if(array[n]==='desc_indice'){
          widths.push('*')
        }else if(array[n]==='agrupamiento'){
          widths.push(96)
        }else{
          widths.push('auto')
        }
      }
    }else if(number===3){
      for(let n=0;n<array.length;n++){
        if(array[n]==='descripcion'){
          widths.push('*')
        }else if(array[n]==='precio'||array[n]==='parcial'){
          widths.push(sol)
          widths.push('auto')
        }else{
          widths.push('auto')
        }
      }
    }else{
      for(let n=0;n<array.length;n++){
        if(array[n]==='detalle_estructura'){
          widths.push('*')
        }else if(array[n]==='agrupamiento'){
          widths.push(96)
        }else if(array[n]==='total_CD'||array[n]==='total_CI'||array[n]==='total_costos'||array[n]==='monto_gru'){
          widths.push(sol)
          widths.push('auto')
        }else{
          widths.push('auto')
        }
      }
    }
    return widths  
  }
  CrearTablaSimple(content,header,number){
    let aux = number===3? 1:2
    let aux2 = number===1? 'after':''
    return{
      table:{
        widths:this.WidthNormal(header,number),
        headerRows: aux,
        body: content,
      },  
      style: 'tablaConAlineacion',
      pageBreak:aux2, 
      margin:[0,0,0,15]
    }
  }
  TablaIndices(){
    this.exceldatos=this.datos.tabla
    this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    var encabezado=[]
    for (let i = 0; i < this.datos.header.length; i++) {
      if (typeof this.datos.header[i] === 'string') {
        let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[i].color? this.datos.header[i].color:this.colorgeneral 
          if(this.datos.header[i]==='PARCIAL'|| this.datos.header[i]==='PRECIO'){
            encabezado.push({text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
            encabezado.push(null)
          }else{
            encabezado.push({text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
          }
      }
    }
    tableData.push(encabezado);
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    this.datos.tabla.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7): persona.alinea? '#DEDDE6':''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if(persona[column]!==null &&persona[column]!=='' &&persona[column]!==undefined &&((column==='precio')|| (column==='parcial'))){
          var numerofor= this.formatearNumero(persona[column],2)
          array.push({text:moneda,color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:numerofor,alignment: 'right' ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else if((persona[column]===''||persona[column]===null )&&((column==='precio')|| (column==='parcial'))){
          array.push({text:'',color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:'',alignment: alignment ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else{
          array.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array);
    });
    return tableData
  }
  WidthIndirectos(array){
  let widths=[]
  var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    for(let n=0;n<array.length;n++){
          if(array[n]==='descripcion'){
            widths.push('*')
          }else if(array[n]==='total'){
            widths.push(sol)
            widths.push('auto')
          }else{
            widths.push('auto')
          }
    }
    return widths
  }
  CrearTablasindi(array,keys){
    return{
      table:{
        widths:this.WidthIndirectos(keys),
        headerRows:1,
        body:array,
      },
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearTablaResumen(array){
    return{
      table:{
        widths:['auto','*','auto'],
        headerRows:1,
        body:array,
      },
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  // async CrearWord(){
  //   let isDesktop = this.isDesktopCondition();
  //   let canUseIframe = this.canUseIframeCondition();
  //   this.IframeOr = isDesktop && canUseIframe;
  //   console.log(this.IframeOr)
  //   this.descargarWord().then((wordBuffer) => {
  //     let wordBlob = new Blob([wordBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  //     const url = URL.createObjectURL(wordBlob);
  //     this.documentopdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //   });
  // }
  cargapdf=false
  async crearpdf(){ 
    let isDesktop = this.isDesktopCondition();
    let canUseIframe = this.canUseIframeCondition();
    this.IframeOr = isDesktop && canUseIframe;
    pdfMake.fonts= {
      Arial: {
        normal: 'arial.ttf',
        bold: 'arialb.ttf',
        italics: 'ariali.ttf',
        bolditalics: 'arialbi.ttf'
      },
      Consola: {
        normal: 'consola.ttf',
        bold: 'consolab.ttf',
        italics: 'consolai.ttf',
        bolditalics: 'consolaz.ttf'
      },
      Georgia: {
        normal: 'georgia.ttf',
        bold: 'georgiab.ttf',
        italics: 'georgiai.ttf',
        bolditalics: 'georgiaz.ttf'
      },
      Gothic: {
        normal: 'GOTHIC.TTF',
        bold: 'GOTHICB.TTF',
        italics: 'GOTHICI.TTF',
        bolditalics: 'GOTHICBI.TTF'
      },
      TimesNewRoman: {
          normal: 'times.ttf',
          bold: 'timesbd.ttf',
          italics: 'timesi.ttf',
          bolditalics: 'timesbi.ttf'
      }
    }
  try{
    var aux2= this.tamañoencabezado===0? this.margensuperior: this.cmToPoints(this.formularioHeader.get('nuevomargenheader').value)+this.tamañoencabezado> this.margensuperior? this.cmToPoints(this.formularioHeader.get('nuevomargenheader').value)+this.tamañoencabezado : this.margensuperior
    var aux3= this.margenfooter===0? this.margeninferior: this.cmToPoints(this.formularioFooter.get('nuevomargenfooter').value)+this.margenfooter> this.margeninferior? this.cmToPoints(this.formularioFooter.get('nuevomargenfooter').value)+this.margenfooter : this.margeninferior  
    var titulo
    var ultimo
    var valornumerico
    if(this.datos.datos_proyecto.cui && this.datos.datos_proyecto.cod_pais!==227){
      const partes=this.datos.datos_proyecto.cui.split('|')
      this.ubicacion=  this.AgregarLugar(partes[0],0) +  this.AgregarLugar(partes[1],0) + this.AgregarLugar(partes[2],0) + this.AgregarLugar(this.datos.datos_proyecto.direccion,1)
    }else{
      this.ubicacion = this.AgregarLugar(this.datos.datos_proyecto.deptact,0) +  this.AgregarLugar(this.datos.datos_proyecto.provact,0) + this.AgregarLugar(this.datos.datos_proyecto.distact,0) + this.AgregarLugar(this.datos.datos_proyecto.direccion,1)
    }
    let tabla1=[
      [{text:'PROYECTO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.datos_proyecto.descripcion,style:'subtitle'}],
      [{text:'PROPIETARIO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.datos_proyecto.desc_grupo,style:'subtitle'}],
      [{text:'UBICACION',style: 'subtitle'},{text:':',style: 'subtitle'},{ text:this.ubicacion ,style:'subtitle'}],
      [{text:'FECHA ELAB.',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: moment(this.datos.datos_proyecto.fecha_elaboracion).format('DD-MM-YYYY'),style:'subtitle'}]
      ]
      var tituloext
     //tablas para costos unitarios que tienen titulos 
      if(this.datos.tipo_reporte===1 && this.datos.titulos && this.datos.titulos.length>0){
        if(this.reportetitulo==='C'){
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
          ultimo =this.CrearTablas(this.datos.tabla)
        }else{
          ultimo =this.CrearTablas(this.filtratit(this.datos.tabla,this.reportetitulo))
          tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.titulos.find(titulo => titulo.item === this.reportetitulo.toString()).descripcion,style:'subtitle'}],
          tabla1.splice(2, 0, tituloext)
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        }
          this.hasitematlt=true
      }else if(this.datos.tipo_reporte===1){
        //ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS Relacion de SubPartidas
        ultimo =this.CrearTablas(this.datos.tabla)
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
      }else if(this.datos.tipo_reporte===5 && this.datos.header2){
        //FORMULA POLINOMICA
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const { Tabla1,Tabla2,imagen,texto,tablainicial} = this.FormulaTabla()
        ultimo=[this.CrearTablaSimple(tablainicial,this.datos.keys_body3,4),texto,imagen,this.CrearTablaSimple(Tabla1,this.datos.keys_body,1),{text:"Agrupamiento Preliminar:",margin:[0,0,0,10],bold:true,alignment:'center'},this.CrearTablaSimple(Tabla2,this.datos.keys_body2,2)]
      }else if(this.datos.tipo_reporte===5 && this.datos.titulo==='INDICES UNIFICADOS'){
        //INDICES UNIFICADOS
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        ultimo=this.CrearTablaSimple(this.TablaIndices(),this.datos.keys_body,3)
      }else if(this.datos.tipo_reporte===5&& this.datos.titulo==='GRAFICOS DIAGRAMA CURVA S Y DIAGRAMA GAUSS'){
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const {Tabla1,imagen1,imagen2} = await this.FormulaGrafico()
        ultimo=[this.CrearTablasGrafico(Tabla1,3,this.datos.keys_body),imagen1,imagen2]
      }else if(this.datos.tipo_reporte===5){
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        ultimo = this.CrearTablaSimple(this.FormulaPrincipal(),this.datos.keys_body,4)
      }else if(this.datos.tipo_reporte===7){
        if(this.reportetitulo==''){
          let res = await this.presuservice.ListarPresuIndirecto({
            id_usuario: this.datos.datos_proyecto.id_usuario,
            id_proyecto: this.datos.datos_proyecto.id_proyecto,
            titulo: 0,
          })
          let tabs = JSON.parse(res.tabla);
          let datasourcePri = tabs[0];
          let arrtit = datasourcePri.filter(
            (item) => item.tipo_registro === 4
          );
          this.datos["titulos"]=arrtit
          this.reportetitulo=arrtit[0].indice
          // this.reportetitulo=this.datos.actual?this.datos.actual:arrtit[0].indice
        }
        let arr= this.datos.titulos.find(titulo => titulo.indice == this.reportetitulo.toString())
        tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: arr.descripcion,style:'subtitle'}],
        tabla1.splice(2, 0, tituloext)
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const {Tabla1,Tabla2} = this.CrearTablaindirectos(this.datos.tabla,this.reportetitulo)
        ultimo= this.formulario1.get('mostrarresumenes').value!=true? this.CrearTablasindi(Tabla1,this.datos.keys_body):[this.CrearTablaResumen(Tabla2),this.CrearTablasindi(Tabla1,this.datos.keys_body)]
      }else if(this.datos.tipo_reporte===2 && this.datos.header.length===2&& this.datos.concat_tabla2===false){
        //HOJA METRADOS ACEROS
        titulo=this.CrearTitulo2(this.datos.titulo,this.datos.datos_proyecto.descripcion,this.datos.datos_proyecto,this.ubicacion)
        ultimo=this.CrearTablaMetrado(this.CrearTablas3(this.datos.tabla),2,this.datos.keys_body)
        this.hasitematlt=true
      }else if(this.datos.tipo_reporte===2 && this.datos.concat_tabla2===true&&this.datos.header.length===2){
        //CRONOGRAMA VALORIZADO
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        ultimo=this.CrearTablaCronograma(this.CrearTablasProgramacion(this.datos.tabla,this.formulario1.get('agregarcostosindirectos').value),this.datos.header.length,this.datos.keys_body)
        this.hasitematlt=true
      }else if(this.datos.tipo_reporte===2 && this.datos.concat_tabla2===true&&this.datos.header.length===3){
        //CRONOGRAMA ADQUISICIONES
        if(this.contador===1){
          this.datos["titulos"]=[{ item:'', descripcion:'COMPLETO'},{ item:'1', descripcion:'MANO DE OBRA (MO)'},{ item:'2', descripcion:'MATERIALES (MAT)'},{ item:'3', descripcion:'EQUIPOS (EQ)'},{ item:'4', descripcion:'SUBCONTRATOS (SUBCONT)'}]
        }
        if(this.reportetitulo===''){
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }else{
          tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.titulos.find(titulo => titulo.item === this.reportetitulo.toString()).descripcion,style:'subtitle'}],
          tabla1.splice(2, 0, tituloext)
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }
        ultimo=this.CrearTablasCalendario2(this.CrearTablasCalendario(this.datos.tabla,this.reportetitulo),3,this.datos.keys_body)
      }else if(this.datos.tipo_reporte===2){
        //HOJA DE METRADO DESAGREGADO
        titulo=this.CrearTitulo2(this.datos.titulo,this.datos.datos_proyecto.descripcion,this.datos.datos_proyecto,this.ubicacion)
        const { tableData} = this.CuerpoPDFSinSpan()
        ultimo=this.CrearTablaMetrado(tableData,2,this.datos.keys_body)
        this.hasitematlt=true
      }else if(this.datos.concat_tabla2===true && this.datos.titulo==='RESUMEN DEL PROYECTO'){
        //RESUMEN DEL PROYECTO
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const { datosCombinados,header,numerototal} = this.ResumenTotales()
        ultimo=this.CrearAlineartablaResumen(datosCombinados,header)
        let respr= await this.NumeroALetras(numerototal)
        valornumerico= {text:'SON ' + respr, style: 'subtitle'}
        this.hasitematlt=true
      }else if(this.datos.concat_tabla2===true && this.datos.titulo==='PROGRAMACIÓN DE TIEMPOS'){
        //PROGRAMACION DE TIEMPOS
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const { datosCombinados,header} = this.CuerpoPDF(this.datos.tabla,null)
        ultimo=this.CrearAlineartabla(datosCombinados,header)
        this.hasitematlt=true
      }else if(this.datos.concat_tabla2===true && this.datos.tabaux1){
        //RELACIÓN DE INSUMOS DEL PROYECTO
        if(this.datos.tabaux1 && this.contador===1){
          let arrtit=[{ item:'', descripcion:'COMPLETO',}]
            for(let row of this.datos.tabaux1){
              if(!(row.item.includes('.'))){
                arrtit.push({
                  item:row.item,
                  descripcion:row.descripcion
                })
              }
            } 
            this.datos["titulos"] = arrtit;
        }
        if(this.reportetitulo===''){
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }else{
          tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.titulos.find(titulo => titulo.item === this.reportetitulo.toString()).descripcion,style:'subtitle'}],
          tabla1.splice(2, 0, tituloext)
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }
        let prueba =this.getTablaRelInsumostit(this.filtratit(this.datos.tabaux1,this.reportetitulo),this.datos.tabaux2,this.datos.tabaux3,this.datos.dec_parcial,this.datos.dec_cant)
        var nuevo=this.reportetitulo===''? this.datos.tabla: prueba.tabresult 
        const { datosCombinados,header,numerototal} = this.CuerpoPDF(nuevo,prueba.nuevototal)
        ultimo=this.CrearAlineartabla(datosCombinados,header)
        let respr=  await this.NumeroALetras(numerototal)
        valornumerico= {text:'SON ' + respr, style: 'subtitle'}
      }else if(this.datos.concat_tabla2===true && this.datos.titulo!=='RESUMEN DEL PROYECTO'){
        //COSTO DEL PROYECTO DESAGREGADO,CLASIFICACIÓN COMERCIAL DE INSUMOS DEL PROYECTO
        if(this.reportetitulo===''){
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }else{
          tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.titulos.find(titulo => titulo.item === this.reportetitulo.toString()).descripcion,style:'subtitle'}],
          tabla1.splice(2, 0, tituloext)
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }
        var nuevo=this.reportetitulo===''? this.datos.tabla:this.filtratit2(this.datos.tabla,this.reportetitulo)
        const { datosCombinados,header,numerototal} = this.CuerpoPDF(nuevo,null)
        ultimo=this.CrearAlineartabla(datosCombinados,header)
        let respr= await this.NumeroALetras(numerototal)
        valornumerico= {text:'SON ' + respr, style: 'subtitle'}
        this.hasitematlt=true
      }else if(this.datos.titulo=="PRESUPUESTO DE OBRA"){
        //PRESUPUESTO DE OBRA
        if(this.reportetitulo===''){
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }else{
          tituloext= [{text:'TITULO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text: this.datos.titulos.find(titulo => titulo.item === this.reportetitulo.toString()).descripcion,style:'subtitle'}],
          tabla1.splice(2, 0, tituloext)
          titulo=this.CrearTitulo1(this.datos.titulo,tabla1)  
        }
      var nuevo=this.reportetitulo===''? this.datos.tabla: this.filtratit2(this.datos.tabla,this.reportetitulo)
      const {tableData,tablafoot,header,numerototal} = this.CuerpoPDF(nuevo,null);
      ultimo=[this.CrearAlineartabla(tableData,header),this.CrearAlineartabla2(tablafoot,header)]
      let respr= await this.NumeroALetras(numerototal)
      valornumerico= {text:'SON ' + respr, style: 'subtitle'}
      this.hasitematlt=true
      }else if(this.datos.image){
        //para el cronograma,imagen
        ultimo= []
        titulo= {text:this.datos.datos_proyecto.descripcion,fontSize:parseInt(this.formulario1.get('tamanofuente').value),margin:[0,0,0,10],bold:true, alignment: 'center'}
          const {subimages,headerimg} = await this.Recorteimagenes3(this.datos.image,aux2,aux3,this.datos.tamanios.wheader);
          subimages.forEach((imagen, index) => {
            let headerToUse = headerimg[index % headerimg.length];  
            if(index>=headerimg.length){
              ultimo.push({
                image: headerToUse.image,
                width: headerToUse.width,  
                height: headerToUse.height,  
              });
            }   
            ultimo.push({
              image: imagen.image,         
              height: imagen.height,       
              width: imagen.width,         
              pageBreak: index === subimages.length - 1 ? '' : 'after'  
            });
          });
      }else if(this.datos.tipo_reporte===4){
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        ultimo= await this.CrearEspecificaciones(this.datos.tabla)
        this.hasitematlt=true
      }else{
        //RESUMEN DEL METRADO
        titulo=this.CrearTitulo1(this.datos.titulo,tabla1)
        const { datosCombinados} = this.CuerpoPDF(this.datos.tabla,null)
        ultimo=this.AlinearTablaMetrado1(datosCombinados,this.datos.keys_body,this.datos.titulo)
        this.hasitematlt=true
      }
    console.log(ultimo)
    var docDefinition = {
    header: this.createResponsiveHeader(this.arrayizq,this.arraycenter,this.arrayder, this.margenizq,this.margender), 
    pageOrientation: this.orientacion_pagina2,
    pageSize:this.formulario1.get('opciones1').value,
    pageMargins:  [this.margenizq,aux2 ,this.margender,aux3],
    footer: function(currentPage, pageCount){
      const footerResult = this.createResponsiveFooter(this.arrayizqfooter, this.arraycenterfooter, this.arrayderfooter, this.margenizq, this.margender,currentPage, pageCount);
      return footerResult;
    }.bind(this),
    info: {  title: this.datos.titulo } ,
    content: [
    titulo,
    ultimo,
    valornumerico
    ],
    styles: {
      allheader: {
        fontSize: parseInt(this.formulario1.get('tamanofuente').value) + 2,
        bold: true,
        alignment: 'center',
        margin:[0,0,0,10],
        color: this.colorgeneral
      },
      subtitle:{
        fontSize: parseInt(this.formulario1.get('tamanofuente').value) + 1,
        color: this.colorgeneral,
      },
      tablaConAlineacion: {
        fontSize: this.formulario1.get('tamanofuente').value, // Tamaño de fuente de la tabla,
      },
    },
    defaultStyle: {
       font:this.formulario1.get('opciones4').value,
    },
  };
  this.pdfDocGenerator = pdfMake.createPdf(docDefinition);
  this.pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      // this.documentopdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.documentopdf =url;//+'#zoom=118&toolbar=0.5'
      setTimeout(() => {
        this.cargapdf = true; // Mostrar el iframe cuando el PDF esté listo
      }, 100);
    });
  }catch (error) {
    console.error('Ocurrió un error al generar el PDF:', error);
    if (error.message === "Cannot read properties of undefined (reading 'rowSpan')") {
      SwalService.showTable('En la partida: ' +this.partidaglobal+' tiene una tabla de formato incorrecto se sugiere volver a copiarla o eliminarla:',this.tablaglobal)
    }
    this.closeModal();
    }
  }
  async descargarPDF() {
    if (this.pdfDocGenerator) {
      await this.pdfDocGenerator.download('documento.pdf');
    } else {
      console.error('El generador de PDF no está disponible. Asegúrate de generar el PDF primero.');
    }
  }

  isDesktopCondition(): boolean {
    const userAgent = navigator.userAgent;
    return !/iPhone|iPad|iPod|Android/i.test(userAgent); // Si no es móvil, es escritorio
  }
  canUseIframeCondition(): boolean {
    try {
      // Solo verificamos si el iframe puede ser insertado, sin crear realmente el iframe.
      return 'contentWindow' in document.createElement('iframe');
    } catch (e) {
      return false;  // Si ocurre un error, retornamos false.
    }
  }
  addNullElements(array=[],monocromado,padd,extra):{newArray, numerototal} {
    array=array??[]
    var numerototal
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j];
            let margin =cell.margin? cell.margin:[padd,0,padd,0]
            let alignment=cell.alinea? cell.alinea:''
            let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral
            let colorbackground =  monocromado==='monocromado'? '': cell.fondo? cell.fondo:''
            let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
            let bold = cell.tipoletra ==="4"|| cell.tipoletra==="3"? true:false;
            let italics =cell.tipoletra ==="4"|| cell.tipoletra==="2"? true:false;
            let moneda = this.datos.moneda? this.datos.moneda : 'S/'
            let colSpan=cell.colSpan?cell.colSpan:''
            if((i===array.length-1) &&(j===array[i].length-1)){
              numerototal= extra!==null && extra!==undefined? this.formService.redondeo(extra,2):cell.text
              var numerofor= this.formatearNumero(numerototal,2)
              newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
              newRow.push({ text:numerofor,alignment: alignment ,margin:margin ,colSpan:colSpan,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
            }else if(j===array[i].length-1){
              var numerofor= this.formatearNumero(cell.text,2)
              newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
              newRow.push({ text:numerofor,alignment: alignment ,margin:margin ,colSpan:colSpan,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
            }else{
              newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,preserveLeadingSpaces: true});
            }
            if (cell.colSpan && cell.colSpan > 1) {
                for (let k = 1; k < cell.colSpan; k++) {
                    newRow.push(null);
                }
              }
            // if(cell && cell.length>columnas[i]){
            //   columnas[i]=cell.length;
            // }
        }
        newArray.push(newRow);
    }
    return {newArray:newArray,numerototal:numerototal}
  }
  WidthNoConcat(array: string[]): any[] {
    const resultado: any[] = [];
    //debemos darle porcentual
    //como sacamos el 1er elemento al header empezamos desde ahi y antes del PARCIAL creamos el sol
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    for (let i = 1; i < array.length-1; i++) {
      var valor=array[i]
      if(valor['text']==='DESCRIPCION'){
        resultado.push('*')
      }else if(valor['text']==='PRECIO'){
        resultado.push(sol)
        resultado.push('auto')
      }else{
        resultado.push('auto')
      }
    }
    return resultado;
  }
  CrearAlineartabla2(content,header){
    var widths=this.WidthNoConcat(header)
    return{
      columns: [
        { width: '*', text: '' },
        { width: '*', text: '' },
          {
              width: '80%',
              unbreakable: true,
              table: {
                widths:widths,
                body: content,
              },  
              style: 'tablaConAlineacion' ,
              margin:[0,0,0,15]
          },
      ]
    }
  }
  CrearTitulo1(content,tabla1){
    const estructura= [
      {text:content,style:'allheader'},
      {
          widths: [100, 10, '*'],
          table: {
              body: tabla1
          },
          layout: 'noBorders',
          style: 'tablaConAlineacion',
          margin: [0, 0, 0, 15]
      }
  ];
  return estructura;
  }
  CrearTitulo2(titulo,proyecto,datos,ubicacion){
    const estructura= [
      {text:titulo,style:'allheader'},
      {table:{
        widths:[80,10,'*'],
        body:[[{text:'PROYECTO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text:proyecto,style:'subtitle'}]]
      },layout: 'noBorders'
      },
      {
        table: {
            widths: ['62%','38%'],
            body: [[{
              table:{
                widths:[80,10,'*'],
                body:[[{text:'SUBPROYECTO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text:datos.subproyecto,style:'subtitle'}],
                [{text:'PROPIETARIO',style: 'subtitle'},{text:':',style: 'subtitle'},{ text:datos.desc_grupo,style:'subtitle'}]]
              },layout: 'noBorders'
            },{table:{
                widths:[50,10,'*'],
                body:[[{text:'UBICACION',style: 'subtitle'},{text:':',style: 'subtitle'},{ text:ubicacion,style:'subtitle'}],
                [{text:'FECHA ELAB',style: 'subtitle',margin:[0,0]},{text:':',style: 'subtitle'},{ text:moment(datos.fecha_elaboracion).format('DD-MM-YYYY'),style:'subtitle'}]]
            },layout: 'noBorders'
          }]]
        },
        layout: 'noBorders',
        style: 'tablaConAlineacion',
        margin: [0, 0, 0, 10]
      }
  ];
  return estructura;
  }
  CrearAlineartabla(content,header){
      var widths=this.Widthsmoneda(header)
      return{
        table:{
          widths:widths,
          headerRows: 1,
          body: content,
        },  
        style: 'tablaConAlineacion',
        margin:[0,0,0,15]
      }
  }
  CrearAlineartablaResumen(content,header){
    var widths=this.WidthsmonedaTotal(header)
    return{
      table:{
        widths:widths,
        headerRows: 1,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  AlinearTablaMetrado1(content,header,titulo){
    var widths=this.CrearTablaCompleta(header,titulo)
    return{
      table:{
        widths:widths,
        headerRows: 1,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearTablaMetrado(content,headerRows,header){
    var widths=this.CrearTablaCompleta(header)
    return{
      table:{
         widths:widths,
        headerRows: headerRows,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearTablaCronograma(content,headerRows,header){
    var widths=this.CrearWidthsCronograma(header)
    return{
      table:{
         widths:widths,
        headerRows: headerRows,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearTablasCalendario2(content,headerRows,header){
    var widths=this.CrearWidthsCalendario(header)
    return{
      table:{
         widths:widths,
        headerRows: headerRows,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearWidthsCalendario(array: string[]): any[] {
    const resultado: any[] = [];
    var palabra='monto'
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    for (let i = 0; i < array.length; i++) {
      if(array[i]==='precio'||array[i]==='costo_partida'||array[i].includes(palabra.toLowerCase())){
        resultado.push('auto')
        resultado.push('auto')
      }else{
        resultado.push('auto')
      }
    }
    return resultado;
  }
  CrearTablasGrafico(content,headerRows,keys_body){
    var widths=this.CrearWidthsGrafico(keys_body)
    return{
      table:{
         widths:widths,
        headerRows: headerRows,
        body: content,
      },  
      style: 'tablaConAlineacion',
      margin:[0,0,0,15]
    }
  }
  CrearWidthsGrafico(array: string[]): any[] {
    const resultado:any[]= []
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    for(let i=0;i<array.length;i++){
     if(array[i]==='mensualMonto'||array[i]==='acumuladoMonto'){
      resultado.push(sol)
      resultado.push('auto')
     }else if(array[i]==='mes'){
       resultado.push('*')
     }else{
       resultado.push('auto')
     }
    }
    return resultado
  }
  CrearTablaCompleta(array,titulo=null){
    const resultado:any[]= [];
   for(let i=0;i<array.length;i++){
    if(array[i]==='descripcion'){
      resultado.push('*')
    }else if(titulo=='SALDO PRESUPUESTALpreuba reg 1'&&array[i]=='parcial'){
      resultado.push('auto')
      resultado.push('auto')
    }else{
      resultado.push('auto')
    }
   }
   return resultado
  }
  CrearWidthsCronograma(array: string[]): any[] {
    const resultado: any[] = [];
    var auxili=500
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+2
    for (let i = 0; i < array.length; i++) {
      if(array[i]==='costo_partida'){
        resultado.push('auto')
        resultado.push('auto')
        auxili=i
      }else if (auxili<i){
        resultado.push(sol)
        resultado.push('auto')
      }else{
        resultado.push('auto')
      }
    }
    return resultado;
  }
  Widthsmoneda(array: string[]): any[] {
    const resultado: any[] = [];
    for (let i = 0; i < array.length-1; i++) {
      var valor=array[i]
      if((valor['text']==='PARCIAL')||(valor['text']==='COSTO PARCIAL')||(valor['text']==='TOTAL')||(valor['text']==='Parcial')||(valor['text']==='PRESUPUESTO')){
        resultado.push('auto')
        resultado.push('auto')
      }else if(valor['text']==='DESCRIPCION'||valor['text']==='DETALLE DE ESTRUCTURA'||valor['text']==='DESCRIPCIÓN'){
        resultado.push('*')
      }else{
        resultado.push('auto')
      }
    }
    return resultado;
  }
  WidthsmonedaTotal(array: string[]): any[] {
    const resultado: any[] = [];
    for (let i = 0; i < array.length; i++) {
      if(i>1){
        resultado.push('auto')
        resultado.push('auto')
      }else if(array[i]==='descripcion'){
        resultado.push('*')
      }else{
        resultado.push('auto')
      }
    }
    return resultado;
  }
  CuerpoPDF(array,extra):{ datosCombinados: any[],tablafoot:any[],tableData :any[],header:any[],numerototal} {
    this.exceldatos=array
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    let tablaindire=this.datos.tabla2
    for (let i = 0; i < this.datos.header.length; i++) {
      if (typeof this.datos.header[i] === 'string') {
        let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[i].color? this.datos.header[i].color:this.colorgeneral 
          if(this.datos.header[i]==='PARCIAL'|| this.datos.header[i]==='COSTO PARCIAL'||this.datos.header[i]==='TOTAL'||this.datos.header[i]==='Parcial'||this.datos.header[i]==='PRESUPUESTO'){
            this.datos.header[i] = { text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']};
            this.datos.header.push(null)
          }else{
            this.datos.header[i] = { text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']};
          }
      }
    }
    this.contador++
    tableData.push(this.datos.header);
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    array.forEach((persona)=>{
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7): persona.alinea? '#DEDDE6':''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if(i===0 && this.reportetitulo!=='' && extra===null){
          extra=persona.parcial
        }
        if(persona[column]!==null &&persona[column]!=='' &&persona[column]!==undefined &&((column==='parcial')|| (column==='total')))//(column==='parcial'||column==='mate'||column==='mano'||column==='equi'||column==='subcont'||column==='subpart')){
          {
          var numerofor= this.formatearNumero(persona[column],2)
          array.push({text:moneda,color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:numerofor,alignment: 'right' ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else if((persona[column]===''||persona[column]===null )&&((column==='parcial')|| (column==='total'))){
          array.push({text:'',color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:'',alignment: alignment ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else if(column==='cant_metrado'&& persona[column]<0.001){
          array.push({ text:'',margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }else{
          let aux=this.esNumero(persona[column])===true&& column!=='item'&&column!=='auxiliar' && column!=='codigo' ? this.formatearNumero(persona[column],2) : persona[column]
          array.push({ text:aux,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array);
    })
    if(this.datos.concat_tabla2===false && this.datos.tabla2){
      let array = JSON.parse(JSON.stringify(this.datos.tabla2))
       for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < 2; j++) {
            const cell = array[i][j];
            if (j===0){
              cell.text=''
            }
          }
        }
        this.exceltabla2= array
    }else{
        this.exceltabla2=this.datos.tabla2
    }
    if(this.reportetitulo!=='' && tablaindire.length>1){
      let total = extra;
      let monto = this.datos.tindirecto[0].monto
      let array = JSON.parse(JSON.stringify(this.datos.tabla2));
      for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j];
            if(i===array.length-1 && j===array[i].length-1){
                extra =this.formService.redondeo((cell.text/monto)*total,2) 
                cell.text=extra
            }else if(j===array[i].length-1){
              cell.text=this.formService.redondeo((cell.text/monto)*total,2) 
            }else if (j===0){
              cell.text=''
            }
        }
      }
      tablaindire=array
    this.exceltabla2=tablaindire
    }else if(this.reportetitulo!=='' && tablaindire.length===1){
      this.exceltabla2[0][this.exceltabla2[0].length-1].text=extra
    }else if(array.length<1 && this.reportetitulo!=='' && extra===undefined){
      extra=0.00
    }
    const {newArray,numerototal }= this.addNullElements(tablaindire,monocromado,padd,extra)
    const tablafoot= newArray.map(function(objeto) {
       return objeto.slice(1); // Elimina el primer elemento de cada objeto
     } );    
    const datosCombinados = this.datos.tabla2? tableData.concat(newArray) : tableData
    return { datosCombinados: datosCombinados,tableData:tableData,tablafoot:tablafoot,header:this.datos.header,numerototal:numerototal}
  }
  formatearNumero(numero: any,decimales){
    if (typeof numero !== 'string') {
        return numero;
    }
    let numeroFloat = parseFloat(numero);
    if (isNaN(numeroFloat)) {
        return numero;
    }
    let [parteEntera, parteDecimal] = numero.split('.')
    parteEntera  = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    let ultimaComillaIndex = parteEntera.lastIndexOf("'");
    if (ultimaComillaIndex !== -1) {
        let nuevaExpresion = parteEntera.substring(0, ultimaComillaIndex) + "," + parteEntera.substring(ultimaComillaIndex + 1);
        return `${nuevaExpresion}.${parteDecimal}`
    }else {
        let auxiliar= parteDecimal===undefined? numero:`${parteEntera}.${parteDecimal}`
        return auxiliar
    }
  }
  CuerpoPDFSinSpan():{ datosCombinados: any[],tablafoot:any[],tableData :any[],header:any[],numerototal} {
    this.exceldatos=this.datos.tabla
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    var ColumnasSeleccionadas = this.datos.keys_body
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value 
    var tableData = []
    var aux=[]
    var opc = JSON.parse(JSON.stringify(this.datos.header))
    for(let k=0;k<this.datos.header.length;k++){
      let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[k].color? this.datos.header[k].color:this.colorgeneral 
      if(this.datos.header[k]==='LARGO'){
        aux[k]={text:this.datos.header[k],fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']}
        this.datos.header[k]={text:'MEDIDAS',colSpan:3 ,fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],margin:[0,5,0,0]}
        auxiliar=k
      }else if((k===auxiliar+1)||(k===auxiliar+2)){
        aux[k]={text:this.datos.header[k], fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']}
      }else{
        var aux23=this.datos.header[k]==='N VECES'? 5:10
        this.datos.header[k]={text:this.datos.header[k],rowSpan:2, fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],margin:[0,aux23,0,0]}
        aux[k]=null
      }
    }
    this.contador++
    tableData.push(this.datos.header)
    tableData.push(aux)
    this.datos.header=opc
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    this.datos.tabla.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i]
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:(persona['item']!==undefined&&persona['item']!==null&&persona.tipoletra!=="2")? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        let aux=persona[column]
        if((column==='descripcion')&&(!persona['item'])&&(!persona['subtotal'])){
          alignment=persona.alinea? persona.alinea:auxiliar[i]
          espaciosinciales= 8
        }else if((column==='descripcion')&&(!persona['item'])){
          alignment=persona.alinea? persona.alinea:auxiliar[i]
          espaciosinciales= 4
        }
        if(column==='cant_metrado' && persona[column]<0.001){
          aux=''
        }else if(column!=='item'&&column!=='auxiliar'&&column!=='largo'&&column!=='ancho'&&column!=='altura'&&column!=='parcial'&&column!=='subtotal'){
          aux =this.esNumero(aux)===true? this.formatearNumero(persona[column],2) : aux
        }
        array.push({ text:aux,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
      }
      tableData.push(array);
    });
    const {newArray,numerototal} = this.addNullElements(this.datos.tabla2,monocromado,padd,null)
    const tablafoot= newArray.map(function(objeto) {
       return objeto.slice(1); // Elimina el primer elemento de cada objeto
     } );    
    const datosCombinados = this.datos.tabla2? tableData.concat(newArray) : tableData
    return { datosCombinados: datosCombinados,tableData:tableData,tablafoot:tablafoot,header:this.datos.header,numerototal:numerototal}
  }
  ResumenTotales():{ datosCombinados: any[],header:any[],numerototal} {
    this.exceldatos = JSON.parse(JSON.stringify(this.datos.tabla))
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    this.exceltabla2 = JSON.parse(JSON.stringify(this.datos.tabla2))
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    var nuevatabla=[]
    for (let i = 0; i < this.datos.header.length; i++) {
      if (typeof this.datos.header[i] === 'string') {
        let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[i].color? this.datos.header[i].color:this.colorgeneral 
          if(i<2){
           nuevatabla.push({ text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:1,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
          }else{
            nuevatabla.push({ text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']})
            nuevatabla.push(null)
          }
      }
    }
    tableData.push(nuevatabla);
    this.contador++
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    this.datos.tabla.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '':  persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if(persona[column]!==null &&persona[column]!==undefined && column!=='item'&&column!=='auxiliar' && column!=='descripcion'){
          var numerofor= this.formatearNumero(persona[column],2)
          array.push({text:moneda,color : color,margin:[padd+espaciosinciales,0,0,0], bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array.push({ text:numerofor,alignment: 'right' ,margin:[espaciosinciales,0,padd,0],  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else{
          array.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array);
    });
    const {newArray,numerototal }= this.FooterSolesCompleto(this.datos.tabla2,monocromado,padd)
    const datosCombinados = this.datos.tabla2? tableData.concat(newArray) : tableData
    return { datosCombinados: datosCombinados,header:this.datos.keys_body,numerototal:numerototal}
  }
  FooterSolesCompleto(array=[],monocromado,padd):{newArray, numerototal} {
    array=array??[]
    var numerototal
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j];
            let margin =cell.margin? cell.margin:[padd,0,padd,0]
            let alignment=cell.alinea? cell.alinea:''
            let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral
            let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:''
            let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
            let bold = cell.tipoletra ==="4"|| cell.tipoletra==="3"? true:false;
            let italics =cell.tipoletra ==="4"|| cell.tipoletra==="2"? true:false;
            let moneda = this.datos.moneda? this.datos.moneda : 'S/'
            let aux
            if((i===array.length-1) &&(j===array[i].length-1)){
              numerototal= cell.text
            }
            let valor=this.esNumero(cell.text)
            if(j<1&&cell.colSpan<3){
              aux=cell.colSpan
              newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,preserveLeadingSpaces: true});
            }else if(j<1&&cell.colSpan>=3){
              aux= (cell.colSpan-2)*2+2
              var numerofor= this.formatearNumero(cell.text,2)
              newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold,colSpan:aux,italics:italics,preserveLeadingSpaces: true});
            }else if(valor===true){
              aux= (cell.colSpan*2)-1
              var numerofor= this.formatearNumero(cell.text,2)
              newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
              newRow.push({text:numerofor,alignment: alignment ,margin:margin ,colSpan:aux,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]})
            }else if(valor===false){
              aux= (cell.colSpan*2)
              newRow.push({ text:cell.text,alignment: alignment ,margin:margin ,colSpan:aux,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]})
            }
            if (aux && aux > 1) {
              for (let k = 1; k < aux; k++) {
                  newRow.push(null);
              }
            }
        }
        newArray.push(newRow);
    }
    return {newArray:newArray,numerototal:numerototal}
  }
  esNumero(input: string): boolean {
    const numero = parseFloat(input);
    if (!isNaN(numero)) {
        return true;
    } else {
        return false;
    }
  }
  isNumber(value: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(value);
  }
  CrearTablas(array) {
    var datosEnArray1
    var tablasfinales = []
    var colorgeneral=this.colorgeneral
    var monocromado = this.formulario1.get('opciones3').value;
    var moneda = this.datos.moneda? this.datos.moneda : 'S/'
    var ColumnasSeleccionadas = this.datos.keys_body;   
    var auxiliar = this.datos.col_alig
    this.exceldatos= array
    var encabe=null
    var encabe2=null
    let widths=this.AgregarWidths(ColumnasSeleccionadas)
    if(this.opcestado==="1"&&this.datos.titulo!=="ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO"){
        this.FindAddItemsAuxiliares(this.itemsaux,array)
    }
    for (let i = 0; i < array.length; i++) {
      var total= this.formatearNumero(array[i].precio,2)   
      var cabeceraFormateada = [];
      for (let n = 0; n < this.datos.header.length; n++) {
        if (typeof this.datos.header[n] === 'string') {
            let color = monocromado === 'monocromado' ? this.colorgeneral : this.datos.header[n].color ? this.datos.header[n].color : this.colorgeneral
            if(this.datos.header[n]==='Parcial'){
                cabeceraFormateada.push({ text: this.datos.header[n], alignment: 'center', color: color, borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'], tipoletra:"3",colSpan:2 })
                cabeceraFormateada.push(null)
            }else{
              cabeceraFormateada.push({ text: this.datos.header[n], alignment: 'center', color: color, borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'], tipoletra:"3"})
            }
        }
      }
      let tableData;  // Declara 'tableData' aquí también si es necesario
      if(this.datos.titulo==='ANALISIS DE COSTOS UNITARIOS'){
        var ratio=array[i].ratio?  array[i].ratio :''
        var unidad_ratio=array[i].und_ratio?array[i].und_ratio :''
        let auxitexto =this.opcestado==="1"?array[i].auxiliar :array[i].item
        encabe={  
          table: {
            widths:['auto','*'],
          body: [
          [{ text: 'Partida: ' + auxitexto ,fillColor:'#F4F9FF',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],color:colorgeneral,border: [true,true,false,false],bold:true}, {text:'  '+ array[i].descripcion,color:colorgeneral,fillColor:'#F4F9FF' ,borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'], border: [false,true,true,false],bold:true}]
          ]
          }, style: 'tablaConAlineacion',
        }
        encabe2={
            table: {
              widths:['auto','*','auto'],
            body: [
              [{text: 'Rendimiento  :  ' + array[i].rendimiento +' '+array[i].und_rendi+'   ', bold:true,borderColor: ['#acb2b4', '#acb2b4', '', ''], border: [true,true,false,false], color:this.colorgeneral,margin:[0,5]}, {text:'Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio, bold:true, borderColor: ['', '#acb2b4', '', ''], border: [false,true,false,false], color:this.colorgeneral,margin:[0,5]}, 
                { 
                border: [false,true,true,false],
                borderColor: ['', '#acb2b4', '#acb2b4', ''],
                table:{
                  widths: ['auto','*'],
                  borderColor: ['white', '#acb2b4', '#acb2b4', '#acb2b4'],
                  body:[[
                    {text: 'Costo unitario por ' + array[i].unidad,alignment:'center', border: [true,true,false,true],borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],fillColor:'#F4F9FF',bold:true,color:this.colorgeneral },
                    {text:moneda+' '+total+' ',alignment:'right', border: [false,true,true,true],borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],fillColor:'#F4F9FF',bold:true ,color:this.colorgeneral},
                  ]]
                },
                      }
              ],
            ]
            }, style: 'tablaConAlineacion',
        }
         datosEnArray1 = [
          // [{ text: 'Partida: ' + array[i].item + '                                 ' + array[i].descripcion, colSpan: this.datos.keys_body.length,fondo:'#F4F9FF' , tipoletra:"3"}],
          // [{ text: 'Rendimiento   :  ' + array[i].rendimiento +' '+array[i].und_rendi+ '                                Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio , colSpan: (this.datos.keys_body.length-4), borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true],tipoletra:"3",margin:[0,2,0,0]},
          // { 
          //   colSpan:5,
          //   tipoletra:"3",
          //   border: [false,true,true,true],
          //   borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],
          //   table:{
          //      widths: ['auto','*'],
          //      borderColor: ['white', '#acb2b4', '#acb2b4', '#acb2b4'],
          //      body:[[
          //        {text: 'Costo unitario por ' + array[i].unidad,alignment:'center', border: [true,true,false,true],borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],fillColor:'#F4F9FF' },
          //        {text:moneda+total+'',alignment:'right', border: [false,true,true,true],borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],fillColor:'#F4F9FF' },
          //      ]]
          //   },
          //  }]
        ]
      }else if(this.datos.titulo==='ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO'){
        var ratio=array[i].ratio?  array[i].ratio :''
        var unidad_ratio=array[i].und_ratio?array[i].und_ratio :''
        encabe={  
          table: {
            widths:['auto','*'],
          body: [
          [{ text: 'Codigo: ' + array[i].codigo ,fillColor:'#F4F9FF',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],color:colorgeneral,border: [true,true,false,false],bold:true}, {text:'  '+ array[i].descripcion,color:colorgeneral,fillColor:'#F4F9FF' ,borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'], border: [false,true,true,false],bold:true}]
          ]
          }, style: 'tablaConAlineacion',
        }
        encabe2={
          table: {
            widths:['auto','*','auto'],
          body: [
            [{text: 'Rendimiento  :  ' + array[i].rendimiento +' '+array[i].und_rendi+ '   ', bold:true,borderColor: ['#acb2b4', '#acb2b4', '', ''], border: [true,true,false,false], color:this.colorgeneral,margin:[0,5]}, {text:'Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio, bold:true, borderColor: ['', '#acb2b4', '', ''], border: [false,true,false,false], color:this.colorgeneral,margin:[0,5]}, 
              { 
              border: [false,true,true,false],
              borderColor: ['', '#acb2b4', '#acb2b4', ''],
              table:{
                widths: ['auto','*'],
                borderColor: ['white', '#acb2b4', '#acb2b4', '#acb2b4'],
                body:[[
                  {text: 'Costo unitario por ' + array[i].unidad,alignment:'center', border: [true,true,false,true],borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],fillColor:'#F4F9FF',bold:true,color:this.colorgeneral },
                  {text:moneda+' '+total+' ',alignment:'right', border: [false,true,true,true],borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],fillColor:'#F4F9FF',bold:true ,color:this.colorgeneral},
                ]]
              },
                    }
            ],
          ]
          }, style: 'tablaConAlineacion',
        }
         datosEnArray1 = [
          // [{ text: 'Codigo: ' + array[i].codigo, colSpan:1,fondo:'#F4F9FF' , tipoletra:"3",borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'], border: [true,true,false,true]},{ text:array[i].descripcion, colSpan: this.datos.keys_body.length,fondo:'#F4F9FF' , tipoletra:"3",borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'], border: [false,true,true,true]}],
          // [{ text: 'Rendimiento   :  ' + array[i].rendimiento +' '+array[i].und_rendi+ '                                Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio , colSpan: (this.datos.keys_body.length-4), borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true],tipoletra:"3",margin:[0,2,0,0]},
          // { 
          //   colSpan:5,
          //   tipoletra:"3",
          //   border: [false,true,true,true],
          //   borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],
          //   table:{
          //      widths: ['auto','*'],
          //      borderColor: ['white', '#acb2b4', '#acb2b4', '#acb2b4'],
          //      body:[[
          //        {text: 'Costo unitario por ' + array[i].unidad,alignment:'center', border: [true,true,false,true],borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],fillColor:'#F4F9FF' },
          //        {text:moneda+total+'',alignment:'right', border: [false,true,true,true],borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],fillColor:'#F4F9FF' },
          //      ]]
          //   },
          //  }]
      ];
      }else{
        encabe={  
          table: {
            widths:['auto','*'],
          body: [
          [{ text:this.opcestado==="1"?array[i].auxiliar :array[i].item ,fillColor:'#F4F9FF',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],color:colorgeneral,border: [true,true,false,false],bold:true}, {text:'  '+ array[i].descripcion,color:colorgeneral,fillColor:'#F4F9FF' ,borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'], border: [false,true,true,false],bold:true}]
          ]
          }, style: 'tablaConAlineacion',
        }
        encabe2={
          table: {
            widths:['*','auto'],
          body: [
            [{text:' Cantidad Total :          ' + array[i].cantidad+' '+array[i].unidad, bold:true,borderColor: ['#acb2b4', '#acb2b4', '', ''], border: [true,true,false,false], color:this.colorgeneral,margin:[0,2]}, {text:'COSTO TOTAL: '+moneda+total, bold:true, borderColor: ['', '#acb2b4', '#acb2b4', ''], border: [false,true,true,false], color:this.colorgeneral,margin:[0,2,10,2]}]
          ]
          }, style: 'tablaConAlineacion',
        }
        datosEnArray1=[
          // [{ tipoletra:"3",fondo:'#F4F9FF',fillColor:'#F4F9FF',text:  array[i].item + '           ' + array[i].descripcion , colSpan: (this.datos.keys_body.length),borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] }],
          // [{ tipoletra:"3",fondo:'#F4F9FF',fillColor:'#F4F9FF',text:this.opcestado==="1"?array[i].auxiliar :array[i].item , colSpan:2,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'], border: [true,true,false,true] },{ tipoletra:"3",fondo:'#F4F9FF',fillColor:'#F4F9FF',text:array[i].descripcion , colSpan: this.datos.keys_body.lengt,borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'], border: [false,true,true,true] }],
          // [{text:' Cantidad Total :          ' + array[i].cantidad+' '+array[i].unidad,colSpan:(this.datos.keys_body.length-3),borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'], border: [true,true,false,true],tipoletra:"3",margin:[0,2,0,0]},
          // { 
          //   colSpan:4,
          //   tipoletra:"3",
          //   border: [false,true,true,true],
          //   borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],
          //   table:{
          //      widths: ['auto','auto'],
          //      borderColor: ['white', '#acb2b4', '#acb2b4', '#acb2b4'],
          //      body:[[
          //        {text: 'COSTO TOTAL: ',alignment:'center', border: [false,false,false,false]},
          //        {text:moneda+total,alignment:'center', border: [false,false,false,false] },
          //      ]]
          //   },
          //  }],  
        ];
      }
        var encabezado = this.AgregarSpan(datosEnArray1, monocromado, 0,'',false);
        tableData = [];
        tableData = tableData.concat(encabezado);
        tableData = tableData.concat([cabeceraFormateada]);
        array[i].detalle.forEach((persona) =>{
        let array=[]
        let botmargin=0
        if(persona['unidad']===null){
            persona['tipoletra']="3"
             botmargin=3
        }else if(persona['cuadrilla']===null||persona['cuadrilla']===0 ){
            persona['cuadrilla']='-'
        }
        for(let m=0;m<ColumnasSeleccionadas.length;m++){
            const column =ColumnasSeleccionadas[m];
            let alignment = auxiliar[m];
            let aux
            let nowrap
            let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
            let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
            let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
            let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
            let espaciosinciales= (column==='descripcion'&& botmargin===0)? 4:0
            if(persona[column]!==null&& persona[column]!==undefined &&(column==='parcial')){
              var numerofor= this.formatearNumero(persona[column],2)
              array.push({text:moneda,color : color , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,noWrap: true})
              array.push({ text:numerofor,alignment: 'right' ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,noWrap: true});
            }else{
              if(this.esNumero(persona[column])===true&& column!=='codigo' && column!=='cantidad'){
                aux =this.formatearNumero(persona[column],2)
                nowrap=false
              }else{
                nowrap = column==='codigo' && column==='cantidad'? true:false
                aux= persona[column]
              }
              array.push({ text:aux,margin:[espaciosinciales,0,0,0] , alignment:alignment,fillColor:colorbackground, color : color, bold:bold ,italics:italics,noWrap: nowrap})
            }
          }
          tableData.push(array);
        });
        tablasfinales.push(
        {
          unbreakable: true,
          stack:[encabe,encabe2,{
          table: {
          widths:widths,
              body: tableData,
          },
          layout:{
            hLineColor: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? '#acb2b4' : 'white';
            },
            vLineColor: function (i, node) {
              return i===node.table.widths.length-1? 'white':(i === 0 || i === node.table.widths.length) ? '#acb2b4' : '#acb2b4';
            },
          },
          style: 'tablaConAlineacion',
          margin:[0,0,0,20]
          }]}
    );
    }
    return tablasfinales;
  }
  AgregarWidths(array){
    var widths=[]
    var sol= parseInt(this.formulario1.get('tamanofuente').value)+3
    for(let n=0;n<array.length;n++){
      if(array[n]==='descripcion'){
        widths.push('*')
      }else if(array[n]==='parcial'){
        widths.push(sol)
        widths.push(50)
      }else if(array[n]==='codigo'){
        widths.push(50+sol-7)
        // widths.push('auto')
      }else if(array[n]==='unidad'){
        widths.push(29)
      }else if(array[n]==='precio'){
        widths.push(29)
      }else{
        widths.push('auto')
      }
    }
    return widths
  }
  AgregarSpan(array=[],monocromado,padd,posicion,colorfondo) {
    array=array??[]
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        let numero=0
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j]
            if(cell!==null){ 
              numero++
              let margin =cell.margin? cell.margin:[padd,0,padd,0]
              let alignment=cell.alinea? cell.alinea:posicion!==''? posicion:''
              let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral 
              let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:colorfondo? colorfondo:''
              let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
              let bold = cell.tipoletra ==="4" || cell.tipoletra==="3"? true:false;
              let italics =cell.tipoletra ==="4" || cell.tipoletra==="2"? true:false;
              if (cell.rowSpan && cell.rowSpan > 1) {
                margin = [0, 5, 0, 5]; // Modificar la margin según sea necesario
              }
              newRow.push({...cell, alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
              if (cell.colSpan && cell.colSpan > 1) {
                  for (let k = 1; k < cell.colSpan; k++) {
                      newRow.push(null);
                      numero++
                  }
              }
              if ((cell.rowSpan && cell.rowSpan > 1 && this.contador===1) || (cell.rowSpan && cell.rowSpan > 1 && this.datos.titulo==="HOJA DE METRADO DE ACERO")) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    for(let a=0;a<cell.colSpan;a++){
                      array[i+k].splice(numero-1,0, null);
                    }       
                }
              }
            }else{
              newRow.push(null);
            }
        }
        newArray.push(newRow);
    }
    return newArray;
  }
  AgregarSpanProgramacion(array=[],monocromado,padd,posicion,colorfondo) {
    array=array??[]
    const newArray = [];
    var auxili=500
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        let numero=0
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j]
            if(cell!==null){ 
              numero++
              let alignment=cell.alinea? cell.alinea:posicion!==''? posicion:''
              let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral 
              let colorbackground = monocromado==='monocromado'? '':  cell.fondo? cell.fondo:colorfondo? colorfondo:''
              let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
              let bold = cell.tipoletra ==="4" || cell.tipoletra==="3"? true:false;
              let italics =cell.tipoletra ==="4" || cell.tipoletra==="2"? true:false;
              let margin = [0,0]
              if(cell.text==='COSTO POR PARTIDA' &&this.contador===1){
                cell.colSpan=cell.colSpan+1
                 auxili=j
                 numero--
              }else if(auxili<=j &&this.contador===1){
                cell.colSpan=cell.colSpan*2
              }
              if(cell.rowSpan && cell.rowSpan>1&& this.esNumero(cell.text)===false){
                margin=[0,10,0,0]
              }
              newRow.push({...cell, alignment: alignment ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,margin:margin});
              if (cell.colSpan && cell.colSpan > 1) {
                  for (let k = 1; k < cell.colSpan; k++) {
                      newRow.push(null);
                      numero++
                  }
              }
              if (cell.rowSpan && cell.rowSpan > 1 && this.contador===1) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    for(let a=0;a<cell.colSpan;a++){
                      array[i+k].splice(numero-1,0, null);
                    }       
                }
              }
            }else{
              newRow.push(null);
            }
        }
        newArray.push(newRow);
    }
    this.contador++
    return newArray;
  }
  AgregarSpanCalendario(array=[],monocromado,padd,posicion,colorfondo) {
    array=array??[]
    const newArray = [];
    var auxili=500
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        let numero=0
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j]
            if(cell!==null){ 
              numero++
              let margin =cell.margin? cell.margin:[padd,0,padd,0]
              let alignment=cell.alinea? cell.alinea:posicion!==''? posicion:''
              let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral 
              let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:colorfondo? colorfondo:''
              let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
              let bold = cell.tipoletra ==="4" || cell.tipoletra==="3"? true:false;
              let italics =cell.tipoletra ==="4" || cell.tipoletra==="2"? true:false;
              if (cell.rowSpan && cell.rowSpan > 1) {
                margin = [0, 10, 0, 0]; // Modificar la margin según sea necesario
              }
              if(i===0 && this.contador===1){
                if(cell.text==='PRECIO' ){
                  cell.colSpan=cell.colSpan+1
                   numero--
                }else if(cell.text==='PARCIAL' ){
                  cell.colSpan=cell.colSpan+1
                  auxili=j
                  numero--
                }else if(auxili<j){
                  cell.colSpan=cell.colSpan +cell.colSpan/2
                }
              }else if(i===1 &&this.contador===1){
                cell.colSpan=cell.colSpan+1
              }else if(cell.text==='MONTO' && this.contador===1){  
                cell.colSpan=cell.colSpan+1
              }
              newRow.push({...cell, alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
              if (cell.colSpan && cell.colSpan > 1) {
                  for (let k = 1; k < cell.colSpan; k++) {
                      newRow.push(null);
                      numero++
                  }
              }
              if (cell.rowSpan && cell.rowSpan > 1 && this.contador===1) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    for(let a=0;a<cell.colSpan;a++){
                      array[i+k].splice(numero-1,0, null);
                    }       
                }
              }
            }else{
              newRow.push(null);
            }
        }
        newArray.push(newRow);
    }
    this.contador++
    return newArray;
  }
  escapeHtmlEntities(str: string): string {
    if (str === null || str === undefined||str==='') {
     return ''
    }
    return he.encode(str);
  }
  async descargarWord(){
    var htmlContent = '';
    var colorgeneral = this.colorgeneral;
    let tamano = 10;
    htmlContent += `
     <html>
      <head>
        <meta charset="UTF-8">
        <style> 
         body {
            font-family: 'Arial', serif;
            font-size: ${tamano}pt;
            color: ${colorgeneral};
        }
        table {
          display: flex;
          justify-content:center;
        }
        img {
          display: flex;
          justify-content:center;
        }
        </style>
      </head>
     <body>
        <h1 style="text-align: center; margin: 10px 0; font-size: ${tamano + 2}pt; font-weight: bold;">
          ${this.escapeHtmlEntities(this.datos.titulo)}
        </h1>
           <div>
               <span >PROYECTO :</span>
               <span >${this.escapeHtmlEntities(this.datos.datos_proyecto.descripcion)}</span>
           </div>
           <div >
               <span>PROPIETARIO :</span>
               <span>${this.escapeHtmlEntities(this.datos.datos_proyecto.desc_grupo)}</span>
           </div>
           <div>
               <span>UBICACION :</span>
               <span>${this.escapeHtmlEntities(this.ubicacion)}</span>
           </div>
           <div>
               <span>FECHA ELAB. :</span>
               <span>${moment(this.datos.datos_proyecto.fecha_elaboracion).format('DD-MM-YYYY')}</span>
           </div>
     `
     if(this.datos.html!==null){
      htmlContent += ` 
        <div style="margin: 10px 0;">
          ${this.ajustarHTML(' ',this.datos.html,"word").htmlProcesado}
        </div>`
    }
    let array =this.datos.tabla
    for (let n = 0; n < array.length; n++) {
      let color = array[n].color ? array[n].color : colorgeneral;
      let bold = array[n].tipoletra === "4" || array[n].tipoletra === "3"||array[n].tipoletra === "1" ? 'bold' : ''
      let italics = array[n].tipoletra === "4" || array[n].tipoletra === "2" ? 'italic' : 'normal';
      let htmlSinIds =this.ajustarHTML(' ',array[n].especificacion,"word").htmlProcesado
      let unidadHtml = array[n].unidad !== null && array[n].unidad !== undefined && array[n].unidad!=='' ? `(${this.escapeHtmlEntities(array[n].unidad)})` : ''
      let espacios = unidadHtml ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : ''; 
      htmlContent += `
        <div style="width: 100%; display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="color: ${color}; font-weight: ${bold}; font-style: ${italics};  flex: 1;">${this.opcestado==="1"?this.escapeHtmlEntities(array[n].auxiliar):this.escapeHtmlEntities(array[n].item)}</span>
          <span style="color: ${color}; font-weight: ${bold}; font-style: ${italics};  flex: 2;">${this.escapeHtmlEntities(array[n].descripcion)}</span>
            <span style="color: ${color}; font-weight: ${bold}; font-style: ${italics};  flex: 2;">
            ${espacios}${unidadHtml}
          </span>
        </div>
        <div style="margin: 10px 5px;">
          ${htmlSinIds}
        </div>
      `
    }
    htmlContent += `</body></html>`
    var converted = await asBlob(htmlContent/* , {
      orientation: 'landscape',
      margins: { top: 720 },
    } */);
    //  return converted
  //  var converted = HtmlDocx.asBlob(htmlContent);
  //  // Crear un enlace para descargar el archivo DOCX
  //  var link = document.createElement('a');
  //  link.href = URL.createObjectURL(converted);
  //  link.download = 'documento.docx';
  //  document.body.appendChild(link);
  //  link.click();
  //  document.body.removeChild(link);

  saveAs(converted, 'documento.docx');
  }
  CuerpoPDFmetrado():{ datosCombinados: any[]}
   {
    var ColumnasSeleccionadas = this.datos.keys_body
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    for (let i = 0; i < this.datos.header.length; i++) {
      if (typeof this.datos.header[i] === 'string') {
        let color = monocromado==='monocromado'? this.colorgeneral:this.datos.header[i].color? this.datos.header[i].color:this.colorgeneral 
         this.datos.header[i] = { text: this.datos.header[i], fillColor: '#D6E3F4', alignment: 'center',color:color,borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']}
      }
    }
    tableData.push(this.datos.header)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    this.datos.tabla.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment =auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if((column==='descripcion')&&(!persona['item'])){
          alignment=persona.alinea? persona.alinea:auxiliar[i]
          espaciosinciales= 4
        }
        array.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
      }
      tableData.push(array)
    });
    const tabla2 = this.addNullElements(this.datos.tabla2,monocromado,padd,null)
    const datosCombinados = this.datos.tabla2? tableData.concat(tabla2) : tableData
    return { datosCombinados: datosCombinados}
  }
  ExcelHeaderRow(array){
    array=array??[]
    for (let i = 0; i < array.length; i++) {
      let numero=0
      for (let j = 0; j < array[i].length; j++) {
        const cell = array[i][j]
        if(this.datos.titulo==='GRAFICOS DIAGRAMA CURVA S Y DIAGRAMA GAUSS'){
          if(cell!==null){
            numero++
            if (cell.rowSpan && cell.rowSpan > 1) {
              for (let k = 1; k < cell.rowSpan; k++) {
                  if (!array[i + k]) {
                      array[i + k] = [];
                  }
                  for(let a=0;a<cell.colSpan;a++){
                        array[i+k].splice(numero-1,0, {text:'',colSpan:1});
                  } 
              }
            }
          }
        }else{
          if(cell!==null){
            let aux=cell.colSpan?cell.colSpan:1
              numero=numero + aux
              if (cell.rowSpan && cell.rowSpan > 1) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    array[i+k].splice(numero-1,0,{text:'',colSpan:1})
                }
              }
            }
        }         
      }
    }
    return array
  }
  CrearTablas3(array) {
    var constan=JSON.parse(JSON.stringify(this.datos.header))
    this.exceldatos=array
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    if(this.opcestado==="1"){
      this.FindAddItemsAuxiliares(this.itemsaux,array)
      if( this.datos.keys_body[0]==='item'){
        this.datos.keys_body[0]='auxiliar'
      }
  }
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    var encabezado= this.AgregarSpan(this.datos.header,monocromado,0,'center','#F4F9FF')
    this.datos.header=constan
    tableData=tableData.concat(encabezado)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    array.forEach((persona)=> {
      let array=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:(persona['item']!==undefined&&persona['item']!==null&&persona.tipoletra!=="2")? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        let aux=persona[column]
        if((column==='descripcion')&&(!persona['item'])){
          alignment=persona.alinea? persona.alinea:auxiliar[i]
          espaciosinciales= 8
        }else if((column==='descripcion')&&(persona['item'])){
          alignment=persona.alinea? persona.alinea:auxiliar[i]
          espaciosinciales= 4
        }
        if((column==='subtotal'||column==='parcial') && persona[column]<0.001){
          aux=''
        }else if(column==='item'||column==='auxiliar'){
          aux =aux
        } else if(column!=='pesodiametro'||column!=='diametro'||column!=='longitud'||column!=='parcial'||column!=='subtotal'){
          aux =this.esNumero(aux)===true? this.formatearNumero(persona[column],2) : aux
        }
        array.push({ text:aux,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
      }
      tableData.push(array);
    });
    return tableData
  }
  CrearTablasProgramacion(array,costoindirecto) {
    this.exceldatos=array
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    var tablasub= JSON.parse(JSON.stringify(this.datos.tabla2[0]))
    this.exceltabla2= JSON.parse(JSON.stringify(this.datos.tabla2))
    var ColumnasSeleccionadas = this.datos.keys_body;
    var padd=-2
    var monocromado = this.formulario1.get('opciones3').value;
    var tablaindire=[]
    var tableData = []
    var encabezado= this.AgregarSpanProgramacion(this.datos.header,monocromado,0,'center','#F4F9FF')
    tableData=tableData.concat(encabezado)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    let moneda=this.datos.moneda?this.datos.moneda:'S/'
    array.forEach((persona)=> {
      let array1=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if(i>2 && (persona[column]!=='')){
          var numerofor= this.formatearNumero(persona[column],2)
            array1.push({text:moneda,color : color , bold:bold,margin:[padd,0,padd,0] ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
            array1.push({ text:numerofor,alignment: 'right' , margin:[padd,0,padd,0] , borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else if(i>2 && (persona[column]===''|| persona[column]===null)){
            array1.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
            array1.push({text:'',borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],border:[false,true,true,true],fillColor:colorbackground })
        }else{
          array1.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array1);
    })
      const tabla2 = this.AgregarmonedaFooter(this.datos.tabla2,monocromado,padd)
      var datosCombinados = this.datos.tabla2? tableData.concat(tabla2.newArray) : tableData
      if (costoindirecto === true) {
        let total = tabla2.total;
        this.datos.tabla3.forEach((persona) => {
            let auxiliar = JSON.parse(JSON.stringify(tablasub));
            auxiliar.forEach((item) => {
                if (item.text === "Monto Presupuesto") {
                    item.text = persona.descripcion;
                } else if (item.text !== ' ' && item.text !== "Monto Presupuesto") {
                    item.text = this.formService.redondeo(item.text * persona.monto / total,2) 
                }
            });
            tablaindire.push(auxiliar);
        });
        this.exceltabla3=tablaindire
        const tabla4 = this.AgregarmonedaFooterIndirectos(tablaindire,monocromado,padd)
        datosCombinados= datosCombinados.concat(tabla4)
    }
      return datosCombinados
  }
  AgregarExcelFooter(array){
  array=array??[]
  const newArray = [];
  for (let i = 0; i < array.length; i++) {
    const newRow = [];
    for (let j = 0; j < array[i].length; j++) {
      const cell = array[i][j];
      let aux=cell.colSpan+1
      if(j>1){
        newRow.push({text:cell.text,colSpan:aux,alinea:cell.alinea,color:cell.color,fondo:cell.fondo,tipoletra:cell.tipoletra})
      }else{
        newRow.push(cell)
      }
    }
    newArray.push(newRow)
    }
    return newArray
  }
  FormulaPrincipal() {
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    var encabezado= this.AgregarSpanFormula(this.datos.header,monocromado,0,'center','#F4F9FF',1)
    tableData=tableData.concat(encabezado)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    let moneda=this.datos.moneda?this.datos.moneda:'S/'
    this.datos.tabla.forEach((persona)=> {
      let array1=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if(column==='estado'){
          array1.push({
            borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'],
            stack: [
              { text:'  '+persona[column]+'  ', color :'#fefefe',bold:bold ,italics:italics,background:colorbackground,alignment:'center' }
          ]
          })
        }else 
        if((column==='total_CD'||column==='total_CI'||column==='total_costos'||column==='monto_gru')&& (persona[column]!=='')){
          var numerofor= this.formatearNumero(persona[column],2)
          array1.push({text:moneda,color : color , bold:bold,margin:[-2,0,-2,0] ,italics:italics,alignment:'left',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({ text:numerofor,alignment: 'right' , margin:[-2,0,-2,0] , borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else  if((column==='total_CD'||column==='total_CI'||column==='total_costos'||column==='monto_gru') &&  ((persona[column]==='')||(persona[column]===null))){
          array1.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({text:'',borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],border:[false,true,true,true] })
        }else{
          array1.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array1);
    });
    return tableData
  }

  async FormulaGrafico():Promise<{ Tabla1: any[]; imagen1: any; imagen2: any}> {
    this.exceldatos=this.datos.tabla
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    var ColumnasSeleccionadas = this.datos.keys_body;
    var paginado=this.formulario1.get('opciones1').value
    var padd=(paginado==='A4'|| paginado==='A5'||paginado==='FOLIO'||paginado==='LETTER')? -2:0
    var monocromado = this.formulario1.get('opciones3').value;
    var image1={image:this.datos.img_curva ,alignment:'center' ,margin:[0,10,0,15],width:500}
    var image2={image:this.datos.img_gauss ,alignment:'center' ,margin:[0,10,0,15],width:500}
    var tableData = []
    var encabezado= this.AgregarSpanGrafico(this.datos.header,monocromado,0,'center','#F4F9FF')
    tableData=tableData.concat(encabezado)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    let moneda=this.datos.moneda?this.datos.moneda:'S/'
    this.datos.tabla.forEach((persona)=> {
      let array1=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if((column==='acumuladoMonto'||column==='mensualMonto')&& (persona[column]!=='')){
          var numerofor= this.formatearNumero(persona[column],2)
          array1.push({text:moneda,color : color , bold:bold,margin:[-2,0,-2,0] ,italics:italics,alignment:'left',borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({ text:numerofor,alignment: 'right' , margin:[-2,0,-2,0] , borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else  if((column==='acumuladoMonto'||column==='mensualMonto') &&  ((persona[column]==='')||(persona[column]===null))){
          array1.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({text:'',borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],border:[false,true,true,true] })
        }else if((column==='mensualPorcentaje'||column==='acumuladoPorcentaje')&& (persona[column]!=='')){
          array1.push({ text:persona[column]+'%',alignment: alignment , margin:[-2,0,-2,0] , borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics});
        }else{
          array1.push({ text:persona[column],margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] , color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array1);
    });
    return {Tabla1:tableData,imagen1:image1,imagen2:image2}
  }
  AgregarSpanGrafico(array=[],monocromado,padd,posicion,colorfondo) {
    array=array??[]
    const newArray = [];
    let cont=0
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        let numero=0
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j]
            if(cell!==null){ 
              numero++
              let margin =cell.margin? cell.margin:[padd,0,padd,0]
              let alignment=cell.alinea? cell.alinea:posicion!==''? posicion:''
              let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral 
              let colorbackground = monocromado==='monocromado'? '':  cell.fondo? cell.fondo:colorfondo? colorfondo:''
              let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
              let bold = cell.tipoletra ==="4" || cell.tipoletra==="3"? true:false;
              let italics =cell.tipoletra ==="4" || cell.tipoletra==="2"? true:false;
              if((cell.text==='PROGRAMADO' ||cell.text==='COSTO EJECUCION PROGRAMADO')&&this.contador===1){
                  cell.colSpan=cell.colSpan+2
              }else if((cell.text==='MENSUAL' ||cell.text==='ACUMULADO')&&this.contador===1&&cont<2){
                cell.colSpan=cell.colSpan+1
                cont++
              }
              newRow.push({...cell, alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
              if (cell.colSpan && cell.colSpan > 1) {
                  for (let k = 1; k < cell.colSpan; k++) {
                      newRow.push(null);
                  }
              }
              if (cell.rowSpan && cell.rowSpan > 1 && this.contador===1) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    for(let a=0;a<cell.colSpan;a++){
                      array[i+k].splice(numero-1,0, null);
                    }       
                }
              }
            }else{
              newRow.push(null);
              numero++
            }
        }
        newArray.push(newRow);
    }
    this.contador++
    return newArray;
  }
  AgregarSpanFormula(array=[],monocromado,padd,posicion,colorfondo,tabla) {
    array=array??[]
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
        const newRow = [];
        let numero=0
        for (let j = 0; j < array[i].length; j++) {
            const cell = array[i][j]
            if(cell!==null){ 
              numero++
              let margin =cell.margin? cell.margin:[padd,0,padd,0]
              let alignment=cell.alinea? cell.alinea:posicion!==''? posicion:''
              let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral 
              let colorbackground = monocromado==='monocromado'? '':  cell.fondo? cell.fondo:colorfondo? colorfondo:''
              let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
              let bold = cell.tipoletra ==="4" || cell.tipoletra==="3"? true:false;
              let italics =cell.tipoletra ==="4" || cell.tipoletra==="2"? true:false;
              if (cell.rowSpan && cell.rowSpan > 1) {
                margin = [0, 10, 0, 10]; // Modificar la margin según sea necesario
              }
              if(cell.text==='ESTRUCTURA INICIAL' &&this.contador===1){
                if(tabla===1){
                  cell.colSpan=cell.colSpan+3
                }else{
                  cell.colSpan=cell.colSpan+1
                }
              }else if((cell.text==='ESTRUCTURA MODIFICADA' ||cell.text==='MONTO'||cell.text==='T. CD' ||cell.text==='T. CI' ||cell.text==='TOTAL COSTOS')&&this.contador===1){
                cell.colSpan=cell.colSpan+1
              }
              newRow.push({...cell, alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
              if (cell.colSpan && cell.colSpan > 1) {
                  for (let k = 1; k < cell.colSpan; k++) {
                      newRow.push(null);
                      numero++
                  }
              }
              if (cell.rowSpan && cell.rowSpan > 1 && this.contador===1) {
                for (let k = 1; k < cell.rowSpan; k++) {
                    if (!array[i + k]) {
                        array[i + k] = [];
                    }
                    for(let a=0;a<cell.colSpan;a++){
                      array[i+k].splice(numero-1,0, null);
                    }       
                }
              }
            }else{
              newRow.push(null);
              numero++
            }
        }
        newArray.push(newRow);
    }
    this.contador++
    return newArray;
  }
  EncontrarDescripcion(item,titulos){
    const found = titulos.find(entry => entry.item === item);
    return found?.descripcion;
  }
  AfterKey(array, titulo): { table: any[], sumas: number[] } {
    let palabra = "monto";
    let columnas = ['costo_partida'];
    const table: any[] = [];
    let sumas: Record<string, number> = {};
    let foundKey = false;
    for (let k = 0; k < this.datos.keys_body.length; k++) {
      if (this.datos.keys_body[k].includes(palabra.toLowerCase())) {
        columnas.push(this.datos.keys_body[k]);
      }
    }
    // Inicializar sumas para cada columna
    columnas.forEach(columna => {
      sumas[columna] = 0;
    });
  
    // Procesar el array para sumar los valores
    for (const cont of array) {
      if (foundKey) {
        if (cont.ind !== '' && cont.ind !== undefined) {
          table.push(cont);
          columnas.forEach(columna => {
            const valor = parseFloat(cont[columna] || "0");
            sumas[columna] = (sumas[columna] || 0) + valor;
          });
        } else {
          break;
        }
      }
      if (cont.descripcion === titulo) {
        foundKey = true;
        table.push(cont);
      }
    }
  
    // Convertir el objeto de sumas en un array de valores
    const sumasArray = columnas.map(columna => sumas[columna] || 0);
    return { table, sumas: sumasArray };
  }
  CrearTablasCalendario(array,titulo) {
    if(this.contador===1){
      this.excelheader = this.ExcelHeaderRow(JSON.parse(JSON.stringify(this.datos.header)))
    }
    var ColumnasSeleccionadas = this.datos.keys_body;
    var padd=0
    var monocromado = this.formulario1.get('opciones3').value;
    var tableData = []
    var encabezado= this.AgregarSpanCalendario(this.datos.header,monocromado,0,'center','#F4F9FF')
    tableData=tableData.concat(encabezado)
    var colorgeneral=this.colorgeneral
    var auxiliar = this.datos.col_alig
    let moneda=this.datos.moneda?this.datos.moneda:'S/'
    var palabra="monto"
    let tablaaux
    let tablafooter
    if(titulo===''){
      tablaaux=array
      tablafooter=JSON.parse(JSON.stringify(this.datos.tabla2))
    }else{
      let busqueda=this.EncontrarDescripcion(titulo,this.datos.titulos)
      tablafooter=JSON.parse(JSON.stringify(this.datos.tabla2))
      //tablafooter calcular
      const result =this.AfterKey(array,busqueda)
      tablaaux=result.table
      tablafooter[0].slice(1).forEach((cell, index) => {
        cell.text = this.formService.redondeo(result.sumas[index],2)
      })
      let totalMonto=tablafooter[0][1].text
      tablafooter[1].slice(1).forEach((cell, index) => {
        if (totalMonto > 0) {
            const porcentaje = this.formService.redondeo((result.sumas[index] / totalMonto * 100),2)
            cell.text = `${porcentaje}%`;
        } else {
            cell.text = "0.00%";
        }
      });
    }
    tablaaux.forEach((persona)=> {
      let array1=[]
      for(let i=0;i<ColumnasSeleccionadas.length;i++){
        const column =ColumnasSeleccionadas[i];
        let alignment = persona.alinea? persona.alinea:auxiliar[i];
        let colorbackground = monocromado==='monocromado'? '': persona.fondo? persona.fondo.substring(0, 7):''
        let color = monocromado==='monocromado'? colorgeneral:persona.color? persona.color:colorgeneral 
        let bold = persona.tipoletra ==="4"|| persona.tipoletra==="3"? true:false
        let italics =persona.tipoletra ==="4"|| persona.tipoletra==="2"? true:false
        let espaciosinciales= (/^\s+/).test(persona[column])? persona[column].match(/^\s+/)![0].length:0
        if((column==='precio'||column==='costo_partida'||column.includes(palabra.toLowerCase()))&& (persona[column]!=='')){
          var numerofor= this.formatearNumero(persona[column],2)
          array1.push({text:moneda,color : color , bold:bold,margin:[padd,0,padd,0] ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({ text:numerofor,alignment: 'right' , margin:[padd,0,padd,0] , borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
        }else  if((column==='precio'||column==='costo_partida'||column.includes(palabra.toLowerCase())) &&  ((persona[column]==='')||(persona[column]===null))){
          array1.push({text:'',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          array1.push({text:'',borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'],border:[false,true,true,true],fillColor:colorbackground })
        }else{
          let aux=this.esNumero(persona[column])===true&& column!=='item' && column!=='codigo' ? this.formatearNumero(persona[column],4) : persona[column]
          array1.push({ text:aux,margin:[padd+espaciosinciales,0,padd,0], alignment: alignment ,  borderColor: ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics});
        }
      }
      tableData.push(array1);
    });
    this.exceldatos=tablaaux
    this.exceltabla2=this.AgregarExcelFooter(tablafooter)
    const tabla2 = this.AgregarmonedaFooter2(tablafooter,monocromado,padd)
    const datosCombinados = this.datos.tabla2? tableData.concat(tabla2) : tableData
    return datosCombinados
  }
  AgregarmonedaFooter(array=[],monocromado,padding){
    array=array??[]
    const newArray = [];
    let total
    for (let i = 0; i < array.length; i++) {
      const newRow = [];
      for (let j = 0; j < array[i].length; j++) {
          const cell = array[i][j];
          let margin =cell.margin? cell.margin:[padding,0,padding,0]
          let alignment=cell.alinea? cell.alinea:''
          let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral
          let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:''
          let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
          let bold = cell.tipoletra ==="4"|| cell.tipoletra==="3"? true:false;
          let italics =cell.tipoletra ==="4"|| cell.tipoletra==="2"? true:false;
          let moneda = this.datos.moneda? this.datos.moneda : 'S/'
          if(j===3&&i===0){
            total=cell.text
          }
          if(j>2&&i===0){
            var numerofor= this.formatearNumero(cell.text,2)
            newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
            newRow.push({ text:numerofor,alignment: 'right' ,margin:margin ,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
          }else if(j>2){
            newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,colSpan:2})
            newRow.push(null)
          }else{
            newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
          }
      }
      newArray.push(newRow);
  }
  return {newArray,total}    
  }
  AgregarmonedaFooterIndirectos(array=[],monocromado,padding){
    array=array??[]
    const newArray = [];
    let total
    for (let i = 1; i < array.length; i++) {
      const newRow = [];
      for (let j = 0; j < array[i].length; j++) {
          const cell = array[i][j];
          let margin =cell.margin? cell.margin:[padding,0,padding,0]
          let alignment=cell.alinea? cell.alinea:''
          let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral
          let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:''
          let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
          let bold = cell.tipoletra ==="4"|| cell.tipoletra==="3"? true:false;
          let italics =cell.tipoletra ==="4"|| cell.tipoletra==="2"? true:false;
          let moneda = this.datos.moneda? this.datos.moneda : 'S/'
          if(j>2){
            var numerofor= this.formatearNumero(cell.text,2)
            newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
            newRow.push({ text:numerofor,alignment: 'right' ,margin:margin ,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
          }else{
            newRow.push({...cell,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics});
          }
      }
      newArray.push(newRow);
  }
  return newArray
  }
  AgregarmonedaFooter2(array=[],monocromado,padding){
    array=array??[]
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
      const newRow = [];
      for (let j = 0; j < array[i].length; j++) {
          const cell = array[i][j];
          let margin =cell.margin? cell.margin:[padding,0,padding,0]
          let alignment=cell.alinea? cell.alinea:''
          let color = monocromado==='monocromado'? this.colorgeneral:cell.color? cell.color:this.colorgeneral
          let colorbackground = monocromado==='monocromado'? '': cell.fondo? cell.fondo:''
          let borderColor=cell.borderColor? cell.borderColor : ['#acb2b4', '#acb2b4', '#acb2b4', '#acb2b4']
          let bold = cell.tipoletra ==="4"|| cell.tipoletra==="3"? true:false;
          let italics =cell.tipoletra ==="4"|| cell.tipoletra==="2"? true:false;
          let moneda = this.datos.moneda? this.datos.moneda : 'S/'
          let nuevocol
          if ((j===0)||(j===1 && i===1)){
            nuevocol=cell.colSpan+1
            newRow.push({text:cell.text,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,colSpan:nuevocol})
          }else if(j===1 && i===0){
            nuevocol=0
            var numerofor= this.formatearNumero(cell.text,2)
            newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
            newRow.push({ text:numerofor ,alignment: 'right' ,margin:margin ,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
          }else if(i===1){  
            nuevocol=cell.colSpan+2
            newRow.push({text:cell.text,alignment: alignment,margin:margin ,borderColor: borderColor,fillColor:colorbackground, color : color,bold:bold ,italics:italics,colSpan:nuevocol})
          }else{
            nuevocol=cell.colSpan+1
          var numerofor= this.formatearNumero(cell.text,2)
          newRow.push({text:moneda,color : color,margin:margin , bold:bold ,italics:italics,alignment:'left',fillColor:colorbackground,borderColor: ['#acb2b4', '#acb2b4', '', '#acb2b4'],border:[true,true,false,true]})
          newRow.push({ text:numerofor ,alignment: 'right' ,margin:margin ,  borderColor: ['', '#acb2b4', '#acb2b4', '#acb2b4'] ,fillColor:colorbackground,colSpan:nuevocol, color : color, bold:bold ,italics:italics,border:[false,true,true,true]});
          }
          if (nuevocol> 1) {
            for (let k = 1; k < nuevocol; k++) {
                newRow.push(null);            }
          }
      }
      newArray.push(newRow);
    }
  return newArray; 
  }
  convertToNumber(string) {
    let value = string|| '';
    if(typeof value === 'object'){
      value=string.text
    }else if((value?.toString() || '').includes('%')){
      value = value
    }else if (value != null &&(value !== '') && isNaN(Number(value.toString()))) {
       value = value
    }else if (value===''|| value===null|| value===' '||(this.datos.titulo==="HOJA DE METRADO DESAGREGADO"&& value===0||this.datos.titulo==='RESUMEN DEL METRADO'&&value===0||this.datos.titulo==='HOJA DE METRADO DE ACERO' && value===0)){
      value = ''
    }else{
      value= parseFloat(value.toString().replace(/^'/, '')); 
    }
    return value
  }
  DecimalesAdquisiciones(array){
    let sub=[]
    for(let k=0;k<array.length;k++){
      if(k===0||(k%2===1)&&(k>4)){
        sub.push(array[k])
      }
    }
    return sub
  }
  FindNextMetrado(position){
    let addi=0
    for(let k=position+1;k<this.datos.tabla.length;k++){
      if((this.datos.tabla[k].item&&this.datos.tabla[k].cant_metrado!==''&&this.datos.tabla[k].cant_metrado!==null)||this.datos.item||k===this.datos.tabla.length-1){
        return addi
      }else{
        addi++
      }
    }
  }
  FindNextSubTotal(position) {
    var addi = 0;
    for (let k = position + 1; k < this.datos.tabla.length; k++) {
      if ((!this.datos.tabla[k].item && this.datos.tabla[k].parcial === '' && this.datos.tabla[k].subtotal !== '') ||(!this.datos.tabla[k].item && this.datos.tabla[k].parcial !== '' && this.datos.tabla[k].subtotal !== '')) {
        return addi
      } else {
        addi++
      }
    }
  }
  FindNextSubtitutlo(position){
    var addi = 0;
    var total=this.exceldatos.length-1
    for (let k = position + 1; k < this.exceldatos.length; k++) {
      if (this.exceldatos[k].tipofila<4||k==total){
        return addi
      } else {
        addi++
      }
    }
  }
  FindNextTitutlo(position){
    let array=[]
    var addi=0
    var total=this.exceldatos.length-1
    for (let k = position + 1; k < this.exceldatos.length; k++) {
      if (this.exceldatos[k].tipofila<3||k==total){
        return array
      } else if(this.exceldatos[k].tipofila==3){
        addi++
        array.push(addi)
      }else{
        addi++
      }
    }
  }
  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    let color='FF415764'
    let borde='FFCCCCCC'
    let titulos= [
      [ {
          "text": this.datos.titulo,
          "colSpan": this.datos.keys_body.length,
          "alignment":'center',
          "background":'#dfebf8',
          "bold":true
      }
      ],
      [
        {
          "text":'',
          "colSpan":1,
        }
      ],
      [
          {
              "text": "PROYECTO :",
              "colSpan": 1,
          },
          {
            "text": this.datos.datos_proyecto.descripcion,
            "colSpan": this.datos.keys_body.length-1,
          }
      ],
      [
          {
              "text": "PROPIETARIO :",
              "colSpan": 1,
          },
          {
            "text": this.datos.datos_proyecto.desc_grupo,
            "colSpan": this.datos.keys_body.length-1,
          }
      ],
      [
          {
              "text": "UBACION :",
              "colSpan": 1,
          },
          {
            "text": this.ubicacion,
            "colSpan": this.datos.keys_body.length-1,
          }
      ],
      [
          {
              "text": "FECHA ELAB. :",
              "colSpan": 1,
          },
          {
            "text":  moment(this.datos.fecha_elaboracion).format('DD-MM-YYYY'),
            "colSpan": this.datos.keys_body.length-1,
          }
      ]
    ]
    if(this.reportetitulo!==''&&this.reportetitulo!=='C'&& this.datos.titulos ){
    var tituloext= [{"text":"TITULO","colSpan":1},{ "text": this.datos.titulos.find(titulo => this.datos.tipo_reporte===7? titulo.indice:titulo.item === this.reportetitulo.toString()).descripcion,"colSpan":this.datos.keys_body.length-1}]
      titulos.splice(4, 0, tituloext)
    }
    const worksheet = workbook.addWorksheet('Datos');
    let startColumn = this.opcestado === "1"&& this.datos.tipo_reporte!==1&&this.datos.keys_body[0] === 'auxiliar' ? 2 : 1;
    titulos.forEach(rowData => {
        let row = worksheet.addRow([]);  
        rowData.forEach((cellData,index)=> {
            let cell = row.getCell(startColumn + index); 
            cell.value = cellData.text;
            let alignment= cellData.alignment? cellData.alignment :'left'
            let bold = cellData.bold? cellData: false
            let background = cellData.background? this.hexShortToRGBA(cellData.background):''
            cell.font={size:9 , color: { argb: color },bold: bold}
            cell.alignment={vertical: 'middle', horizontal: alignment}
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: { style: 'thin',color: { argb: borde } },
              right: { style: 'thin',color: { argb: borde } }
            }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            if (cellData.colSpan > 1) {
                // Calcular las coordenadas de las celdas a fusionar
                let startCol = Number(cell.col);
                let endCol = startCol + cellData.colSpan - 1;
                let rowNumber = row.number;
                worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
            }
        });
    });
    worksheet.addRow([]);
    if(this.datos.tipo_reporte===1){
      this.exceldatos.forEach(item => {
        let titaxu =item.item
        let extra:any=''
        if(this.opcestado==="1"&&this.datos.titulo!=='ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO'){  
          worksheet.getColumn(this.datos.keys_body.length+1).hidden = true;
          titaxu= item.auxiliar
          extra ={text:item.item,colSpan:1, fondo:'',tipoletra:"3"}
        }
        if (item.detalle && item.detalle.length > 0) {
          var ratio=item.ratio?  item.ratio :''
            var unidad_ratio=item.und_ratio?item.und_ratio :''
          if(this.datos.titulo==='ANALISIS DE COSTOS UNITARIOS'){
            var aux=[[{text:'Partida:  '+ titaxu + '             '+item.descripcion,fondo:'#dfebf8',colSpan:this.datos.keys_body.length, tipoletra:"3"}  ,  { ...extra } ],[{text:'Rendimiento  :  ' + item.rendimiento +' '+ item.und_rendi + '                   Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio,colSpan:this.datos.keys_body.length-3},{text:'Costo unitario por '+item.unidad + '             '+ this.datos.moneda+' '+item.precio,colSpan:3}]]
          }else if(this.datos.titulo==='ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO'){
            var aux=[[{text:'Codigo : ' + item.codigo + '          '+item.descripcion,colSpan:this.datos.keys_body.length,fondo:'#dfebf8', tipoletra:"3"},  { ...extra }],[{text:'Rendimiento :  ' + item.rendimiento +' '+ item.und_rendi+ '                     Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio,colSpan:this.datos.keys_body.length-3},{text:'Costo unitario por '+item.unidad + '             '+ this.datos.moneda+' '+item.precio,colSpan:3}]]
          }else {
            var aux=[[{text: titaxu + '           ' +item.descripcion,colSpan:this.datos.keys_body.length,fondo:'#dfebf8', tipoletra:"3"}, { ...extra }],[{text:' Cantidad Total  :  ' + item.cantidad +' '+ item.unidad+ '                     Ratio Unitario Productividad : ' + ratio +' '+unidad_ratio,colSpan:this.datos.keys_body.length-3},{text:'COSTO TOTAL :  ' + this.datos.moneda+' '+item.precio,colSpan:3}]]
          }
              aux.forEach(rowData => {
                let row = worksheet.addRow([]);  
                rowData.forEach(cellData => {
                    let cell = row.getCell(row.actualCellCount + 1);
                    let background =  cellData.fondo? this.hexShortToRGBA(cellData.fondo) : ''
                    cell.value = cellData.text;
                    let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
                    let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
                    cell.font={bold: bold,italic:italic,size:9 , color: { argb: color }}
                    cell.border = {
                        top: {style: 'thin',color: { argb: borde } },
                        left: {style: 'thin',color: { argb: borde } },
                        bottom: { style: 'thin',color: { argb: borde } },
                        right: { style: 'thin',color: { argb: borde } }
                    }
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:(background)} };
                    if (cellData.colSpan > 1) {
                        // Calcular las coordenadas de las celdas a fusionar
                        let startCol = Number(cell.col);
                        let endCol = startCol + cellData.colSpan - 1;
                        let rowNumber = row.number;
                        worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
                    }
                });
            });
            let detalleHeader = worksheet.addRow(this.datos.header)
            detalleHeader.eachCell((cell) => {
                cell.border = { top: { style: 'thin',color: { argb: borde } }, left: { style: 'thin',color: { argb: borde } }, bottom: { style: 'thin',color: { argb: borde } }, right: { style: 'thin',color: { argb: borde } } }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.font = { size:9 , color: { argb: color } }
            })
            item.detalle.forEach((detalle, rowIndex) => {
              let detalleValues = this.datos.keys_body.map(clave => {
               return this.convertToNumber(detalle[clave])
              });
              let row = worksheet.addRow(detalleValues);
              row.eachCell((cell, colNumber) => {
                  let alinea =this.datos.col_alig[colNumber-1]?this.datos.col_alig[colNumber-1]:'left'
                  cell.alignment={vertical:'middle',horizontal:alinea}
                  let bold = detalle.unidad === null ? true : false;
                  cell.font = { bold: bold, size: 9, color: { argb: color } };
                  if (rowIndex === item.detalle.length - 1) {
                      cell.border = {
                          top: {},
                          left: { style: 'thin', color: { argb: borde } },
                          bottom: { style: 'thin', color: { argb: borde } },
                          right: { style: 'thin', color: { argb: borde } }
                      };
                  } else {
                      cell.border = {
                          top: {},
                          left: { style: 'thin', color: { argb: borde } },
                          bottom: {},
                          right: { style: 'thin', color: { argb: borde } }
                      };
                  }
                  cell.numFmt = !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[colNumber-1]===''|| this.datos.keys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[colNumber-1]))}`
              });
          });
            for (let i = 0; i < 3; i++) {
                worksheet.addRow([]);
            }
        }
    })
    }else if(this.datos.tipo_reporte===5 && this.datos.titulo==='GRAFICOS DIAGRAMA CURVA S Y DIAGRAMA GAUSS'){
      this.excelheader.forEach((rowData) => {
        let row = worksheet.addRow([])
        rowData.forEach(cellData => {
            let cell = row.getCell(row.actualCellCount + 1);
            cell.value = cellData.text? cellData.text:''
            let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
            let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
            cell.font={bold: bold,italic:italic,size:9 , color: { argb: color }}
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb: this.hexShortToRGBA('#dfebf8')} }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (cellData.colSpan > 1) {
                let startCol = Number(cell.col);
                let endCol = startCol + cellData.colSpan - 1;
                let rowNumber = Number(cell.row);
                worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
            }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
            }
          })
        })
        this.exceldatos.forEach((detalle) => {
          let detalleValues = this.datos.keys_body.map(clave => {
            return this.convertToNumber(detalle[clave])
        });
          let row= worksheet.addRow(detalleValues);
          row.eachCell((cell,colNumber) => {
             cell.numFmt =  !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[colNumber-1]===''|| this.datos.keys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[colNumber-1]))}`
              // if (this.datos.col_alig[colNumber-1] === 'center') {
              //     cell.alignment = { vertical: 'middle', horizontal: 'center' };
              // } else if (this.datos.col_alig[colNumber-1] === 'left') {
              //     cell.alignment = { vertical: 'middle', horizontal: 'left' };
              // } else {
              //     cell.alignment = { vertical: 'middle', horizontal: 'right' };
              // }
              let alinea =this.datos.col_alig[colNumber-1]?this.datos.col_alig[colNumber-1]:'left'
              cell.alignment={vertical:'middle',horizontal:alinea}
              let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
              let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
              let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'? true:false
              let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
              cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
              cell.border = {
                top: {style: 'thin',color: { argb: borde } },
                left: {style: 'thin',color: { argb: borde } },
                bottom: {style:'thin',color: { argb: borde }  },
                right: { style: 'thin',color: { argb: borde } }
            };
          });
      })
      for (let i = 0; i < 6; i++) {
        worksheet.addRow([]);
    }
      let formulaRow = worksheet.addRow([]);
      let formulaRowNumber = formulaRow.number;
      const imageId = workbook.addImage({
          base64: this.datos.img_curva,
          extension: 'png',
      });
      worksheet.addImage(imageId, {
          tl: { col: 0, row: formulaRowNumber }, // Coloca la imagen en la fila de la fórmula
          ext: { width: 500, height: 200 }, // Ajusta el tamaño según sea necesario
      });

      for (let i = 0; i < 6; i++) {
          worksheet.addRow([]);
      }
       worksheet.addRow([]);
      const imageId2 = workbook.addImage({
          base64: this.datos.img_gauss,
          extension: 'png',
      });
      worksheet.addImage(imageId2, {
          tl: { col: 0, row: formulaRowNumber+10 }, // Coloca la imagen en la fila de la fórmula
          ext: { width: 500, height: 200 }, // Ajusta el tamaño según sea necesario
      });
    }else if(this.datos.tipo_reporte===0 ||this.datos.tipo_reporte===2||this.datos.tipo_reporte===5 && !this.datos.tabla3 ) {
      if(this.excelheader.length===2|| this.excelheader.length===3){
        const headerauxiliar = [...this.excelheader];
        if(this.opcestado==="1"&&this.datos.keys_body[0]==='auxiliar'&&this.excelheader.length===2){  
          headerauxiliar[0][0].colSpan = parseInt(headerauxiliar[0][0].colSpan)+1;
          headerauxiliar[1].unshift({ "text": "ITEM", "colSpan": 1, "rowSpan": 1 });
        }
        headerauxiliar.forEach((rowData) => {
          let row = worksheet.addRow([])
          rowData.forEach(cellData => {
              let cell = row.getCell(row.actualCellCount + 1);
              cell.value = cellData.text? cellData.text:''
              let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
              let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
              cell.font={bold: bold,italic:italic,size:9 , color: { argb: color }}
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:this.hexShortToRGBA('#dfebf8')} }
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
              if (cellData.colSpan > 1) {
                  let startCol = Number(cell.col);
                  let endCol = startCol + cellData.colSpan - 1;
                  let rowNumber = Number(cell.row);
                  worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
              }
              cell.border = {
                top: {style: 'thin',color: { argb: borde } },
                left: {style: 'thin',color: { argb: borde } },
                bottom: {style:'thin',color: { argb: borde }  },
                right: { style: 'thin',color: { argb: borde } }
              }
            })
          })
      }else{
        const headerauxiliar = [...this.excelheader];
        if(this.opcestado==="1"&&this.datos.keys_body[0]==='auxiliar'){  
          headerauxiliar.unshift("ITEM");
        }
        let detalleHeader = worksheet.addRow(headerauxiliar)
        detalleHeader.eachCell((cell) => {
            cell.value= cell.text||'',
            cell.border = { top: { style: 'thin',color: { argb: borde } }, left: { style: 'thin',color: { argb: borde } }, bottom: { style: 'thin',color: { argb: borde } }, right: { style: 'thin',color: { argb: borde } } }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.font = { size:9 , color: { argb: color } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:this.hexShortToRGBA('#dfebf8')} }
        })
      }
      const auxiliarclaves = [...this.datos.keys_body];
      const auxiliaralinea = [...this.datos.col_alig];
      const auxkeys_dec = this.datos.keys_dec ? [...this.datos.keys_dec] : [];
      const arrayaux=this.exceldatos
      let colnumberaux=2
      if(this.opcestado==="1"&&this.datos.keys_body[0]==='auxiliar'){  
        colnumberaux=3
        auxiliarclaves.unshift("item");
        auxiliaralinea.unshift("left");
        if (auxkeys_dec) {
          auxkeys_dec.unshift(null);
        }
        worksheet.getColumn(1).hidden = true;
      }
      arrayaux.forEach((detalle,index) => {
        let detalleValues = auxiliarclaves.map(clave => {
          return this.convertToNumber(detalle[clave])
      });
        let row= worksheet.addRow(detalleValues);
        row.eachCell((cell,colNumber) => {
           cell.numFmt =  !auxkeys_dec|| auxkeys_dec===undefined|| auxkeys_dec===null? '0.00': auxkeys_dec[colNumber-1]===''|| auxkeys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(auxkeys_dec[colNumber-1]))}`
            let alinea =auxiliaralinea[colNumber-1]?auxiliaralinea[colNumber-1]:'left' 
            cell.alignment={vertical:'middle',horizontal:alinea}
            let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
            let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
            let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'||detalle.item? true:false
            let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
            cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
          };
          if ((!detalle.item || detalle.item === '' || detalle.item === null)&&colNumber==2) {
            if(detalle.esmetrado==1&&detalle.estitulo==0){
              cell.value = '        ' + cell.value
            }else if(detalle.esmetrado==0&&detalle.estitulo==0){
              cell.value = '            ' + cell.value;
            }else if(detalle.esmetrado==1&&detalle.estitulo==1){
              cell.value = '    ' + cell.value;
            }else if(detalle.estitulo==2){
              cell.value = '                ' + cell.value;
            }
          }
          if (detalle.item&&this.datos.titulo==="HOJA DE METRADO DESAGREGADO"&&detalle.cant_metrado&&detalle.cant_metrado!==0) {
            let formula = null;
            const final=this.FindNextMetrado(index)
            if(final>0){
              if(this.opcestado==="1"){
                formula = `SUM(J${row.number+1}:J${row.number+final})`
                worksheet.getCell(`K${row.number}`).value = { formula: `=${formula}` };
              }else{
                formula = `SUM(I${row.number+1}:I${row.number+final})`
                worksheet.getCell(`J${row.number}`).value = { formula: `=${formula}` };
              }
            }
          }else if(!detalle.item&&this.datos.titulo==="HOJA DE METRADO DESAGREGADO"&&detalle.parcial===''&&detalle.subtotal!==''){
            let formula = null;
            let final= this.FindNextSubTotal(index)
            if(final>0){
              if(this.opcestado==="1"){
                formula = `SUM(I${row.number+1}:I${row.number+final})`
                worksheet.getCell(`J${row.number}`).value = { formula: `=${formula}` };
              }else{
                formula = `SUM(H${row.number+1}:H${row.number+final})`
                worksheet.getCell(`I${row.number}`).value = { formula: `=${formula}` };
              }
            }
          }else if(!detalle.item&&this.datos.titulo==="HOJA DE METRADO DESAGREGADO"&&detalle.parcial!==''&&detalle.subtotal!==''&& detalle.estitulo==0){
             if(detalle.cantidad!==''||detalle.n_veces!==''||detalle.largo!==''||detalle.ancho!==''||detalle.altura!==''){
              let formula
              if(this.opcestado==="1"){
                if(!detalle.formula || detalle.formula === ''){
                  formula = `ROUND(PRODUCT(D${row.number}:H${row.number}),2)`
                }else {
                  formula = detalle.formula
                  .replace(/G/g, `H${row.number}`)
                  .replace(/F/g, `G${row.number}`)
                  .replace(/E/g, `F${row.number}`)
                  .replace(/D/g, `E${row.number}`)
                  .replace(/C/g, `D${row.number}`)  
                  formula=`ROUND(${formula}, 2)`;
                }
                if (formula) {
                  worksheet.getCell(`J${row.number}`).value = { formula: `=${formula}` };
                  worksheet.getCell(`I${row.number}`).value = { formula: `=${formula}` };
                }
              }else{
                if(!detalle.formula || detalle.formula === ''){
                  formula = `ROUND(PRODUCT(C${row.number}:G${row.number}),2)`
                }else {
                  formula = detalle.formula
                  .replace(/C/g, `C${row.number}`)
                  .replace(/D/g, `D${row.number}`)
                  .replace(/E/g, `E${row.number}`)
                  .replace(/F/g, `E${row.number}`)
                  .replace(/G/g, `G${row.number}`)
                  formula=`ROUND(${formula}, 2)`;  
                }
                  if (formula) {
                    worksheet.getCell(`I${row.number}`).value = { formula: `=${formula}` };
                    worksheet.getCell(`H${row.number}`).value = { formula: `=${formula}` };
                }
              }
             }
          }else if ((!detalle.item || detalle.item === '' || detalle.item === null)&&this.datos.titulo==="HOJA DE METRADO DESAGREGADO"&& detalle.estitulo==0) {
            let formula = null;
            if(this.opcestado==="1"){
              if(!detalle.formula || detalle.formula === ''){
                formula = `ROUND(PRODUCT(D${row.number}:H${row.number}), 2)`
              }else {
                 formula = detalle.formula
                .replace(/G/g, `H${row.number}`)
                .replace(/F/g, `G${row.number}`)
                .replace(/E/g, `F${row.number}`)
                .replace(/D/g, `E${row.number}`)
                .replace(/C/g, `D${row.number}`)  
                formula=`ROUND(${formula}, 2)`;
              }
              if (formula) {
                worksheet.getCell(`I${row.number}`).value = { formula: `=${formula}` };
              }
            }else{
              if(!detalle.formula || detalle.formula === ''){
                formula = `ROUND(PRODUCT(C${row.number}:G${row.number}),2)`
              }else {
                 formula = detalle.formula
                .replace(/C/g, `C${row.number}`)
                .replace(/D/g, `D${row.number}`)
                .replace(/E/g, `E${row.number}`)
                .replace(/F/g, `E${row.number}`)
                .replace(/G/g, `G${row.number}`)
                formula=`ROUND(${formula}, 2)`;  
              }
                if (formula) {
                  worksheet.getCell(`H${row.number}`).value = { formula: `=${formula}` };
              }
            }
          }
        });
      })
    if(this.datos.concat_tabla2===false){
      for (let i = 0; i < 3; i++) {
        worksheet.addRow([]);
      }
    }
    let aumento = this.opcestado === "1"&&this.datos.keys_body[0] === 'auxiliar'? 1 : 0
    if(this.exceltabla2){
      // this.datos.keys_dec = this.datos.titulo==='CRONOGRAMA DE ADQUISICIONES'? this.DecimalesAdquisiciones(this.datos.keys_dec) :this.datos.keys_dec
      this.exceltabla2.forEach(rowData => {
          let row = worksheet.addRow([]);
          rowData.forEach(cellData => {
              let cell = row.getCell(row.actualCellCount + 1+aumento);
               cell.value = this.convertToNumber(cellData.text);
               cell.numFmt = !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[row.actualCellCount-1]===''|| this.datos.keys_dec[row.actualCellCount- 1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[row.actualCellCount-1]))}`
                let nuevocolor= cellData.color? this.hexShortToRGBA(cellData.color) : color
                let background = cellData.fondo? this.hexShortToRGBA(cellData.fondo) : ''
                let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
                let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
                cell.font={bold: bold,italic:italic,size:9 , color: { argb: nuevocolor }}
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
                let alinea =cellData.alinea?cellData.alinea :'left' 
                cell.alignment={vertical:'middle',horizontal:alinea}
                if (cellData.colSpan > 1) {
                    let startCol = Number(cell.col);
                    let endCol = startCol + cellData.colSpan - 1;
                    let rowNumber = row.number;
                    worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
                }
                cell.border = {
                  top: {style: 'thin',color: { argb: borde } },
                  left: {style: 'thin',color: { argb: borde } },
                  bottom: {style:'thin',color: { argb: borde }  },
                  right: { style: 'thin',color: { argb: borde } }
                }
              });
        });
    }
    if(this.exceltabla3 && this.formulario1.get('agregarcostosindirectos').value===true){
        this.exceltabla3.forEach(rowData => {
            let row = worksheet.addRow([]);
            rowData.forEach(cellData => {
                let cell = row.getCell(row.actualCellCount + 1+aumento);
                cell.value  = this.convertToNumber(cellData.text);
                cell.numFmt =  !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[row.actualCellCount - 1]===''|| this.datos.keys_dec[row.actualCellCount - 1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[row.actualCellCount - 1]))}`
                  let nuevocolor= cellData.color? this.hexShortToRGBA(cellData.color) : color
                  let background = cellData.fondo? this.hexShortToRGBA(cellData.fondo) : ''
                  let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
                  let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
                  cell.font={bold: bold,italic:italic,size:9 , color: { argb: nuevocolor }}
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
                  let alinea =cellData.alinea?cellData.alinea :'left' 
                  cell.alignment={vertical:'middle',horizontal:alinea}
                  if (cellData.colSpan > 1) {
                      let startCol = Number(cell.col);
                      let endCol = startCol + cellData.colSpan - 1;
                      let rowNumber = row.number;
                      worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
                  }
                cell.border = {
                  top: {style: 'thin',color: { argb: borde } },
                  left: {style: 'thin',color: { argb: borde } },
                  bottom: {style:'thin',color: { argb: borde }  },
                  right: { style: 'thin',color: { argb: borde } }
                }
              });
            });
    }
    }else if(this.datos.tipo_reporte===5 && this.datos.titulo==='FORMULA POLINÓMICA' && this.datos.tabla3){
      CrearHeader(this.excelheader)
      this.exceltabla3.forEach((detalle) => {
        let detalleValues = this.datos.keys_body3.map(clave => {
          return this.convertToNumber(detalle[clave])
      });
        let row= worksheet.addRow(detalleValues);
        row.eachCell((cell,colNumber) => {
           cell.numFmt =  !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[colNumber-1]===''|| this.datos.keys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[colNumber-1]))}`
           let alinea =this.datos.col_alig3[colNumber-1]?this.datos.col_alig3[colNumber-1]:'left' 
           cell.alignment={vertical:'middle',horizontal:alinea}
            let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
            let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
            let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'? true:false
            let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
            cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
          };
        });
      })
      for (let i = 0; i < 3; i++) {
        worksheet.addRow([]);
      }
      // Crear la fórmula
      let formulaParts = this.datos.data_fp.fp_definida.map(item => `${item.coeficiente} * ${item.variacion_iu} / ${item.monomio}`);
      let formula = `K = ${formulaParts.join(' + ')}`;
      let formulaRow = worksheet.addRow([formula]);
      let formulaRowNumber = formulaRow.number;
      worksheet.addRow([])
      const imageId = workbook.addImage({
          base64: this.datos.img_formula,
          extension: 'png',
      });
      worksheet.addImage(imageId, {
          tl: { col: 0, row: formulaRowNumber }, // Coloca la imagen en la fila de la fórmula
          ext: { width: 800, height: 100 }, // Ajusta el tamaño según sea necesario
      });
      for (let i = 0; i < 6; i++) {
          worksheet.addRow([]);
      }
      CrearHeader(this.datos.header)
      this.exceldatos.forEach((detalle) => {
        let detalleValues = this.datos.keys_body.map(clave => {
          return this.convertToNumber(detalle[clave])
      });
        let row= worksheet.addRow(detalleValues);
        row.eachCell((cell,colNumber) => {
           cell.numFmt =  !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[colNumber-1]===''|| this.datos.keys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[colNumber-1]))}`
           let alinea =this.datos.col_alig[colNumber-1]?this.datos.col_alig[colNumber-1]:'left' 
           cell.alignment={vertical:'middle',horizontal:alinea}
            let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
            let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
            let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'? true:false
            let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
            cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
          };
        });
      })
      for (let i = 0; i < 3; i++) {
        worksheet.addRow([]);
      }
      CrearHeader(this.datos.header2)
      this.exceltabla2.forEach((detalle) => {
        let detalleValues = this.datos.keys_body2.map(clave => {
          return this.convertToNumber(detalle[clave])
      });
        let row= worksheet.addRow(detalleValues);
        row.eachCell((cell,colNumber) => {
           cell.numFmt =  !this.datos.keys_dec|| this.datos.keys_dec===undefined|| this.datos.keys_dec===null? '0.00': this.datos.keys_dec[colNumber-1]===''|| this.datos.keys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(this.datos.keys_dec[colNumber-1]))}`
           let alinea =this.datos.col_alig2[colNumber-1]?this.datos.col_alig2[colNumber-1]:'left' 
           cell.alignment={vertical:'middle',horizontal:alinea}
            let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
            let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
            let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'? true:false
            let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
            cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
          };
        });
      })
    function CrearHeader(datos){
      datos.forEach((rowData) => {
        let row = worksheet.addRow([])
        rowData.forEach(cellData => {
            let cell = row.getCell(row.actualCellCount + 1);
            cell.value = cellData.text? cellData.text:''
            let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
            let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false 
            let background =  (('#dfebf8').substring(1)).toUpperCase();
            cell.font={bold: bold,italic:italic,size:9 , color: { argb: color }}
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb: background} }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (cellData.colSpan > 1) {
                let startCol = Number(cell.col);
                let endCol = startCol + cellData.colSpan - 1;
                let rowNumber = Number(cell.row);
                worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
            }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
            }
          })
        })
    }
    }else if(this.datos.tipo_reporte===7){
      this.opcestado="0"
      const primerNoNulo =  this.datos.keys_dec.find(item => item !== null)
      if(this.formulario1.get('mostrarresumenes').value==true){
        let headerauxiliar=['CODIGO','ESPECIFICA DE GASTOS','COSTO']
        let detalleHeader = worksheet.addRow(headerauxiliar)
        detalleHeader.eachCell((cell) => {
            cell.value= cell.text||'',
            cell.border = { top: { style: 'thin',color: { argb: borde } }, left: { style: 'thin',color: { argb: borde } }, bottom: { style: 'thin',color: { argb: borde } }, right: { style: 'thin',color: { argb: borde } } }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.font = { size:9 , color: { argb: color } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:this.hexShortToRGBA('#dfebf8')} }
        })
        this.exceltabla2.forEach(rowData => {
          let row = worksheet.addRow([]);
          rowData.forEach(cellData => {
              let cell = row.getCell(row.actualCellCount+1);
               cell.value = this.convertToNumber(cellData.text);
               cell.numFmt =row.actualCellCount==2? `0.${'0'.repeat(parseInt(primerNoNulo))}`:''
                let nuevocolor= cellData.color? this.hexShortToRGBA(cellData.color) : color
                let background = cellData.fondo? this.hexShortToRGBA(cellData.fondo) : ''
                let bold = cellData.tipoletra==='4' || cellData.tipoletra==='3'? true:false
                let italic= cellData.tipoletra==='4' || cellData.tipoletra==='2'? true:false
                cell.font={bold: bold,italic:italic,size:9 , color: { argb: nuevocolor }}
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
                let alinea =cellData.alinea?cellData.alinea :'left' 
                cell.alignment={vertical:'middle',horizontal:alinea}
                if (cellData.colSpan > 1) {
                    let startCol = Number(cell.col);
                    let endCol = startCol + cellData.colSpan - 1;
                    let rowNumber = row.number;
                    worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
                }
                cell.border = {
                  top: {style: 'thin',color: { argb: borde } },
                  left: {style: 'thin',color: { argb: borde } },
                  bottom: {style:'thin',color: { argb: borde }  },
                  right: { style: 'thin',color: { argb: borde } }
                }
              });
        });
        for (let i = 0; i < 3; i++) {
          worksheet.addRow([]);
        }
      }
      const headerauxiliar = this.excelheader
      let detalleHeader = worksheet.addRow(headerauxiliar)
      detalleHeader.eachCell((cell) => {
          cell.value= cell.text||'',
          cell.border = { top: { style: 'thin',color: { argb: borde } }, left: { style: 'thin',color: { argb: borde } }, bottom: { style: 'thin',color: { argb: borde } }, right: { style: 'thin',color: { argb: borde } } }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          cell.font = { size:9 , color: { argb: color } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:this.hexShortToRGBA('#dfebf8')} }
      })
      const auxiliarclaves = this.datos.keys_body
      const auxiliaralinea = this.datos.col_alig
      const auxkeys_dec = this.datos.keys_dec ? this.datos.keys_dec :[];
      const arrayaux=this.exceldatos
      arrayaux.forEach((detalle,index) => {
        let detalleValues = auxiliarclaves.map(clave => {
          return this.convertToNumber(detalle[clave])
      });
        let row= worksheet.addRow(detalleValues);
        row.eachCell((cell,colNumber) => {
          if(colNumber==2){
            if(detalle.tipofila==1){
              cell.value = ' ' + cell.value
            }else if(detalle.tipofila==2){
              cell.value = '    ' + cell.value;
            }else if(detalle.tipofila==3){
              cell.value = '       ' + cell.value;
            }else if(detalle.tipofila==4){
              cell.value = '          ' + cell.value;
            }else if(detalle.tipofila==5){
              cell.value = '            ' + cell.value;
            }
          }else if((cell.value?.toString() || '').includes('%')){
            let strValue =cell.value?.toString() || ''
            let numericValue = parseFloat(strValue.replace('%', '')) / 100; 
            cell.value = numericValue; 
            cell.numFmt = '0.%'; 
          }else{
            cell.value=cell.value;
            cell.numFmt =  !auxkeys_dec|| auxkeys_dec===undefined|| auxkeys_dec===null? '0.00': auxkeys_dec[colNumber-1]===''|| auxkeys_dec[colNumber-1]===null? '':`0.${'0'.repeat(parseInt(auxkeys_dec[colNumber-1]))}`
          }
            let alinea =auxiliaralinea[colNumber-1]?auxiliaralinea[colNumber-1]:'left' 
            cell.alignment={vertical:'middle',horizontal:alinea}
            let nuevocolor= detalle.color? this.hexShortToRGBA(detalle.color) : color
            let background =  detalle.fondo? this.hexShortToRGBA(detalle.fondo) : ''
            let bold = detalle.tipoletra==='4' || detalle.tipoletra==='3'? true:false
            let italic= detalle.tipoletra==='4' || detalle.tipoletra==='2'? true:false 
            cell.font = { bold: bold,italic:italic,size:9 , color: { argb: nuevocolor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:background} }
            cell.border = {
              top: {style: 'thin',color: { argb: borde } },
              left: {style: 'thin',color: { argb: borde } },
              bottom: {style:'thin',color: { argb: borde }  },
              right: { style: 'thin',color: { argb: borde } }
          };
         
            if(detalle.tipofila==2){
              const final=this.FindNextTitutlo(index)
              if (final.length > 0) {
                let formula = `=SUM(`;
                for (let k = 0; k < final.length; k++) {
                    if (k > 0) {
                        formula += ",";
                    }
                    formula += `H${row.number + final[k]}`; 
                }
                formula += `)`;
                worksheet.getCell(`H${row.number}`).value = { formula: formula };
            }
            }else if(detalle.tipofila==3){
              let formula = null;
              const final=this.FindNextSubtitutlo(index)
              if(final>0){
                formula = `SUM(H${row.number+1}:H${row.number+final})`
                worksheet.getCell(`H${row.number}`).value = { formula: `=${formula}` };
              }else if(final==0){
                formula = `SUM(H${row.number+1}:H${row.number+1})`
                worksheet.getCell(`H${row.number}`).value = { formula: `=${formula}` };
              }
            }else if(detalle.tipofila==4){
              let formula
              if(!detalle.formula || detalle.formula === ''||detalle.formula==='E*F*G*H'){
                formula = `ROUND(PRODUCT(D${row.number}:G${row.number}),2)`
              }else {
                 formula = detalle.formula
                .replace(/E/g, `D${row.number}`)
                .replace(/F/g, `E${row.number}`)
                .replace(/G/g, `F${row.number}`)
                .replace(/H/g, `G${row.number}`)
                formula=`ROUND(${formula},2)`;  
              }
                if (formula) {
                  worksheet.getCell(`H${row.number}`).value = { formula: `=${formula}` };
              }
            }
        });
      })
    }   

    const auxiliarclaves = [...this.datos.keys_body];
    if(this.opcestado==="1"&&this.datos.keys_body[0]==='auxiliar'){  
      auxiliarclaves.unshift("item");
    }
    worksheet.columns.forEach((column, index) => {
        let width = 20; 
        let clave = auxiliarclaves[index];
        if (clave === 'descripcion') {
            width = 50
        }
        column.width = width;
    });
    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data]);
        fs.saveAs(blob, this.datos.titulo+'.xlsx');
    }).catch((error) => {
        console.error('Error al exportar a Excel', error);
    });
  }
  hexShortToRGBA(hex: string): string {
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) {
        throw new Error("Formato de color hexadecimal no válido")
    }
    hex = hex.substring(1)
    return hex.toUpperCase(); 
  }
  getTablaRelInsumostit(tabla1:any,tabla2:any,tabla3:any,dec_parc:any,dec_cant:any){
    try{
      let tabacu=JSON.parse(JSON.stringify(tabla2));
      let tabsub=JSON.parse(JSON.stringify(tabla3));
      let tabresult=[];
      let nuevototal
      let totpre=0;
      for(let rowres of tabla1){
        if(rowres.unidad!=''){
          totpre+=Number(rowres.parcial)
        }
      }
      for(let b=0;b<tabacu.length;b++){
        let rowpart;
        for(let fipart of tabla1){
          if(tabacu[b].indice==fipart.indice){
            rowpart=fipart;//partida principal para multiplicar por metrado
            break;
          }
        }
        if(rowpart){
          if(tabacu[b].esinsumo==0 && tabacu[b].num_det>0){//es subapartida, cargar insumos de subpartida y hacer recursivo
            let cantpasa=Number(tabacu[b].cantidad);
            this.cargaInsumoSubpTit(tabresult,cantpasa,Number(rowpart.cantidad),tabacu[b].indice_subp,tabsub,dec_parc,dec_cant);
          }
          else if(tabacu[b].esinsumo!=0){
            const index = tabresult.findIndex(elem => {
              if(elem.operador!='%'){
                if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion && elem.precio==tabacu[b].precio){
                  return elem;
                }
              }
              else{//porcentajes agrupa siempre, cantidad se recalcula
                if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion)
                  return elem;
              }
            });
            if(index>-1){//si encuentra suma,
              if(tabresult[index].unidad!=''){
                if(tabacu[b].operador=='%'){
                  let rparc=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),dec_parc);
                  tabresult[index].parcial=this.formService.redondeo(Number(rparc),dec_parc);
                }
                else{
                  let ropera=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),dec_parc);
                  tabresult[index].parcial=ropera;
                  tabresult[index].cantidad=tabacu[b].unidad!=''?this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),dec_cant):tabresult[index].cantidad;
                }
              }
            }
            else{//si no encuentra se agrega
              if(tabacu[b].operador=='%'){
                tabacu[b].cantidad=0;
                tabacu[b].precio=0;
                tabacu[b].parcial=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),dec_parc);
              }
              else{
                let rparc=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),dec_parc);
                tabacu[b].parcial=this.formService.redondeo(Number(rparc),dec_parc);
                let ropera=this.formService.redondeo(Number(tabacu[b].parcial)/Number(tabacu[b].precio),dec_cant);
                tabacu[b].cantidad=tabacu[b].unidad!=''?Number(ropera):tabacu[b].cantidad;
              }
              tabresult.push(JSON.parse(JSON.stringify(tabacu[b])));
              tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
              tabresult[tabresult.length-1].cuadrilla='';
            }
          }
        }
      }
      //corregir total en % mano obra operador% tipo_insumo1
      let totax=0;
      let indporc=-1;
      let indporc2=-1;
      for(let r1=0;r1<tabresult.length;r1++){
        totax=totax+=Number(tabresult[r1].parcial);
        if(tabresult[r1].operador=='%' && tabresult[r1].tipo_insumo==1 && indporc==-1){
          indporc=r1;
        }
        if(tabresult[r1].operador=='%' && indporc2==-1){
          indporc2=r1;
        }
      }
      let indcor=indporc!=-1?indporc:(indporc2!=-1?indporc2:-1)
      if(indcor>=0){
        tabresult[indcor].parcial=this.formService.redondeo((Number(tabresult[indcor].parcial)+(totpre-totax)),this.dec_parcial);
      }
      //fin corr
      if(tabresult.length>0){
        let summano=0;
        let summat=0;
        let sumeq=0;
        let sumsubc=0;
        let sumsubp=0;
        let spsummano=0;
        let spsummat=0;
        let spsumeq=0;
        let spsumsubc=0;
        for(let m=0;m<tabresult.length;m++){
          if(tabresult[m].unidad!=''){
            if(tabresult[m].id_tipo_insumo=='1'){
              summano+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummano+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='2'){
              summat+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummat+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='3'){
              sumeq+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumeq+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='4'){
              sumsubc+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumsubc+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='5'){
              sumsubp+=Number(tabresult[m].parcial);
            }
          }
        }
        let pindice=tabresult.length>0?tabresult[0].indice:null;
        let filamano=this.CrearFilaAgruTit(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,dec_parc),1,1,'center');
        tabresult.push(filamano);
        nuevototal=filamano.parcial
        filamano=this.CrearFilaAgruTit(pindice,'MATERIALES','2',this.formService.redondeo(summat,dec_parc),1,0,'center');
        tabresult.push(filamano);
        nuevototal+=filamano.parcial
        filamano=this.CrearFilaAgruTit(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,dec_parc),1,1,'center');
        tabresult.push(filamano);
        nuevototal+=filamano.parcial
        filamano=this.CrearFilaAgruTit(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,dec_parc),1,0,'center');
        tabresult.push(filamano);
        nuevototal+=filamano.parcial
        tabresult.sort( (a, b) => {
          if(a.id_tipo_insumo < b.id_tipo_insumo) {
            return -1;
          }
          if(a.id_tipo_insumo > b.id_tipo_insumo) {
            return 1;
          }
          if (a.num_det < b.num_det) {
            return -1;
          }
          if (a.num_det > b.num_det) {
            return 1;
          }
          if (a.descripcion < b.descripcion) {
            return -1;
          }
          if (a.descripcion > b.descripcion) {
            return 1;
          }
          return 0;
        });
        for(let row of tabresult){
          if(row.operador=="%"){
            row.precio=row.tipo_insumo=='1'?summano:row.tipo_insumo=='2'?summat:row.tipo_insumo=='3'?sumeq:row.tipo_insumo=='4'?sumsubc:'';
            let precfil=Number(row.precio);
            let parcial=Number(row.parcial);
            row.cantidad=row.precio==0 || row.parcial==0?0:this.formService.redondeo(parcial/precfil,dec_cant);
          }
          row.cantidad=row.cantidad!=null?this.formService.redondeo(row.cantidad,dec_cant):null,
          row.precio=row.precio!=null?this.formService.redondeo(row.precio,dec_parc):null,
          row.parcial=row.parcial!=null?this.formService.redondeo(row.parcial,dec_parc):null
        }
      }
      return {tabresult,nuevototal}
    }
    catch(e){
      console.log(e)
      return null;
    }
  }
  CrearFilaAgruTit(pindice:any,pdescripcion:any,pid_tipo_insumo:any,pparcial:any,pesinsumo:any,pafcuad:any,alinea:any){
    let filaaux={
      indice:pindice,// se debe recuperar el indice del padre
      id_filadetalle:null,
      num_det:0,
      codigo:null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion:pdescripcion,
      id_unidad:'',
      unidad:'',
      operador:null,
      tipo_insumo:null,
      cuadrilla:null,
      cantidad:null,
      precio:null,
      parcial:Number(pparcial),
      id_tipo_insumo:Number(pid_tipo_insumo),
      id_indice:null,
      id_clasificacion:null,//revisar valores
      desc_clasi:null,
      id_insumo:null,
      id_subpartida:null,
      indice_subp:null,
      accion:0,
      esinsumo:pesinsumo,
      afcuadrilla:pafcuad,
      rendimiento:null,
      und_rendi:null,
      jornada:null,
      advceros:null,
      referencia:null,
      mostrar:1,
      icomost:1,
      editar:0,
      editar2:0,
      ind:-1,
      seleccion:0,
      asignaund:0,
      alinea:alinea
    };
    return filaaux;
  }
  cargaInsumoSubpTit(tabresult:any,cant_padre:any,cant_part:any,indice_padre:any,tabsub:any,dec_parc:any,dec_cant:any){
    for(let b=0;b<tabsub.length;b++){
      if(tabsub[b].indice==indice_padre){
        if(tabsub[b].esinsumo==0 && tabsub[b].num_det>0){
          let cantpasa=cant_padre*Number(tabsub[b].cantidad);
          this.cargaInsumoSubpTit(tabresult,cantpasa,cant_part,tabsub[b].indice_subp,tabsub,dec_parc,dec_cant);
        }
        else if(tabsub[b].esinsumo!=0){
          const index = tabresult.findIndex(elem => {
            if(elem.operador!='%'){
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion && elem.precio==tabsub[b].precio)
              return elem;
            }
            else{//porcentajes agrupa siempre, cantidad se recalcula
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion)
                return elem;
            }
          });
          if(index>-1){//si encuentra suma,
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),dec_parc);
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),dec_parc);
              if(tabresult[index].unidad!=''){
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),dec_cant)
                tabresult[index].cantidad=tabsub[b].unidad!=''?Number(ropera):tabresult[index].cantidad;
              }
            }
          }
          else{//si no encuentra se agrega
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabsub[b].parcial=parctot;
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabsub[b].parcial=parctot;
              let ropera=this.formService.redondeo(Number(parctot)/Number(tabsub[b].precio),dec_cant);
              tabsub[b].cantidad=tabsub[b].unidad!=''?Number(ropera):tabsub[b].cantidad;
            }
            tabresult.push(tabsub[b]);
            tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
    }
  }
  Millones(num:number) {
    let divisor = 1000000;
    let cientos = Math.floor(num / divisor)
    let resto = num - (cientos * divisor)
    let strMillones = this.Seccion(num, divisor, 'UN MILLON', 'MILLONES');
    let strMiles = this.Miles(resto);
    if(strMillones == '')
        return strMiles;
    return strMillones + ' ' + strMiles;
  }
  Seccion(num:number, divisor:any, strSingular:any, strPlural:any) {
    let cientos = Math.floor(num / divisor)
    let resto = num - (cientos * divisor)

    let letras = '';

    if (cientos > 0)
        if (cientos > 1)
            letras = this.Centenas(cientos) + ' ' + strPlural;
        else
            letras = strSingular;

    if (resto > 0)
        letras += '';
    return letras;
  }
  Miles(num:number) {
    let divisor = 1000;
    let cientos = Math.floor(num / divisor)
    let resto = num - (cientos * divisor)
    let strMiles = this.Seccion(num, divisor, 'UN MIL', 'MIL');
    let strCentenas = this.Centenas(resto);
    if(strMiles == '')
        return strCentenas;
    return strMiles + ' ' + strCentenas;
  }
  Centenas(num:number) {
    let centenas = Math.floor(num / 100);
    let decenas = num - (centenas * 100);
    switch(centenas)
    {
        case 1:
            if (decenas > 0)
                return 'CIENTO ' + this.Decenas(decenas);
            return 'CIEN';
        case 2: return 'DOSCIENTOS ' + this.Decenas(decenas);
        case 3: return 'TRESCIENTOS ' + this.Decenas(decenas);
        case 4: return 'CUATROCIENTOS ' + this.Decenas(decenas);
        case 5: return 'QUINIENTOS ' +this. Decenas(decenas);
        case 6: return 'SEISCIENTOS ' + this.Decenas(decenas);
        case 7: return 'SETECIENTOS ' + this.Decenas(decenas);
        case 8: return 'OCHOCIENTOS ' +this. Decenas(decenas);
        case 9: return 'NOVECIENTOS ' + this.Decenas(decenas);
    }
    return this.Decenas(decenas);
  }
  Decenas(num:number){
    let decena = Math.floor(num/10);
    let unidad = num - (decena * 10);
    switch(decena)
    {
        case 1:
            switch(unidad)
            {
                case 0: return 'DIEZ';
                case 1: return 'ONCE';
                case 2: return 'DOCE';
                case 3: return 'TRECE';
                case 4: return 'CATORCE';
                case 5: return 'QUINCE';
                default: return 'DIECI' + this.Unidades(unidad);
            }
        case 2:
            switch(unidad)
            {
                case 0: return 'VEINTE';
                default: return 'VEINTI' +this.Unidades(unidad);
            }
        case 3: return this.DecenasY('TREINTA', unidad);
        case 4: return this.DecenasY('CUARENTA', unidad);
        case 5: return this.DecenasY('CINCUENTA', unidad);
        case 6: return this.DecenasY('SESENTA', unidad);
        case 7: return this.DecenasY('SETENTA', unidad);
        case 8: return this.DecenasY('OCHENTA', unidad);
        case 9: return this.DecenasY('NOVENTA', unidad);
        case 0: return this.Unidades(unidad);
    }
  }
  Unidades(num:number){
    switch(num)
    {
        case 1: return 'UN';
        case 2: return 'DOS';
        case 3: return 'TRES';
        case 4: return 'CUATRO';
        case 5: return 'CINCO';
        case 6: return 'SEIS';
        case 7: return 'SIETE';
        case 8: return 'OCHO';
        case 9: return 'NUEVE';
    }

    return '';
  }
  DecenasY(strSin:any, numUnidades:any) {
      if (numUnidades > 0)
          return strSin + ' Y ' + this.Unidades(numUnidades)
      return strSin;
  }
  async EncontrarMoneda(){
    let monedas = await this.configuracionService.listarMonedas();
    let encontrado = monedas.find((item)=>item.id_moneda==this.datos.datos_proyecto.moneda)
    return encontrado.moneda
  }
  async NumeroALetras(num:number) {
    let moneda= await this.EncontrarMoneda()
    let data = {
        enteros: Math.floor(num),
        centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
        letrasCentavos: '',
    };
    if (data.centavos >=0) {
        data.letrasCentavos = 'CON ' + (function () {
                return  data.centavos+'/100 '+ moneda
            })();
    }
    if(data.enteros == 0)
        return 'CERO ' + ' ' + data.letrasCentavos;
    if (data.enteros == 1)
        return this.Billones(data.enteros)  +' ' + data.letrasCentavos;
    else
        return this.Billones(data.enteros)  +  ' ' + data.letrasCentavos;
  };
  MilMillones(num:number) {
    var divisor = 1000000000;
    var cientos = Math.floor(num / divisor);
    var resto = num - (cientos * divisor);
    var strMilMillones = this.Seccion(num, divisor, 'UN MIL', 'MIL');
    if (cientos > 0 && resto === 0)
        strMilMillones += ' MILLONES';
    var strMillones = this.Millones(resto);
    if (strMilMillones === '')
        return strMillones;
    return strMilMillones + ' ' + strMillones;
  } 
  Billones(num:number) {
    var divisor = 1000000000000;
    var cientos = Math.floor(num / divisor);
    var resto = num - (cientos * divisor);
    var strBillones = this.Seccion(num, divisor, 'UN BILLON', 'BILLONES');
    var strMilMillones = this.MilMillones(resto);
    if (strBillones === '')
        return strMilMillones;
    return strBillones + ' ' + strMilMillones;
  } 
  async GuardarFooterGeneral(){
    let footertext1
    let footertext2
    let footertext3
    let footervalues1
    let footervalues2
    let footervalues3
    const form=this.formularioFooter
    if(this.formulario1.get('agregarpiepagina').value===true && (form.get('footerceldas').value==="1" || form.get('footerceldas').value==="2" || form.get('footerceldas').value==="3")){
      footervalues1= "0|"+form.get('footerizqfontsize').value+"|"+form.get('footerizqpositionelementotext').value+"|"+form.get('footerizqbold').value+"|"+form.get('footerizqcolor').value+""
      footertext1 =form.get('footerizqtext').value
    }
    if(this.formulario1.get('agregarpiepagina').value===true && (form.get('footerceldas').value==="2" || form.get('footerceldas').value==="3")){
      footervalues2= "0|"+form.get('footercenterfontsize').value+"|"+form.get('footercenterpositionelementotext').value+"|"+form.get('footercenterbold').value+"|"+form.get('footercentercolor').value+""
      footertext2 =form.get('footercentertext').value
    }
    if(this.formulario1.get('agregarpiepagina').value===true && form.get('footerceldas').value==="3"){
      footervalues3="0|"+form.get('footerderfontsize').value+"|"+form.get('footerderpositionelementotext').value+"|"+form.get('footerderbold').value+"|"+form.get('footerdercolor').value+""
      footertext3 =form.get('footerdertext').value
    }
    const footer ={
    id_proyecto:this.datos.datos_proyecto.id_proyecto,
    tipo:1,
    footer: ""+form.get('nuevomargenfooter').value+"|"+form.get('footerceldas').value+"|"+form.get('footertamano1').value+","+form.get('footertamano2').value+","+form.get('footertamano3').value+"|"+form.get('footeropacity').value+"",
    foot1:footervalues1?footervalues1:'',
    foot2:footervalues2?footervalues2:'',
    foot3:footervalues3?footervalues3:'',
    texto4:footertext1?footertext1:'',
    texto5:footertext2?footertext2:'',
    texto6:footertext3?footertext3:''
    }
    if(this.formularioFooter.valid){
      let resultado= await this.principalService.GuardarConfImpr(footer)
      if(resultado[0]?.id==1){
        SwalService.success('Exito',resultado[0].mensaje)
      }
      else{
        SwalService.error('Advertencia',resultado[0].mensaje)
      }
    }
  }
  async GuardarEncabezadoGeneral(){
    let headertext1
    let headertext2
    let headertext3
    let headervalues1
    let headervalues2
    let headervalues3
    const form=this.formularioHeader
    if(this.formulario1.get('agregarencabezado').value===true && (form.get('headerceldas').value==="1" || form.get('headerceldas').value==="2" || form.get('headerceldas').value==="3")){
      if(this.mostrarDiv1===true && this.mostrarDiv2===false && this.imagenBase64_izq!==null){
        headertext1=this.imagenBase64_izq
        headervalues1="1|"+form.get('headerizqwidth').value+"|"+form.get('headerizqpositionelementoimg').value+"|"+form.get('headerizqbold').value+"|"+form.get('headerizqcolor').value+""
      }else if(this.mostrarDiv1===false && this.mostrarDiv2===true){
        headertext1=form.get('headerizqtext').value
        headervalues1="0|"+form.get('headerizqfontsize').value+"|"+form.get('headerizqpositionelementotext').value+"|"+form.get('headerizqbold').value+"|"+form.get('headerizqcolor').value+""
      }
    }
    if(this.formulario1.get('agregarencabezado').value===true && (form.get('headerceldas').value==="2" || form.get('headerceldas').value==="3")){
      if(this.mostrarDiv3===true && this.mostrarDiv4===false && this.imagenBase64_center!==null){
        headertext2=this.imagenBase64_center
        headervalues2="1|"+form.get('headercenterwidth').value+"|"+form.get('headercenterpositionelementoimg').value+"|"+form.get('headercenterbold').value+"|"+form.get('headercentercolor').value+""
      }else if(this.mostrarDiv3===false && this.mostrarDiv4===true){
        headertext2=form.get('headercentertext').value
        headervalues2="0|"+form.get('headercenterfontsize').value+"|"+form.get('headercenterpositionelementotext').value+"|"+form.get('headercenterbold').value+"|"+form.get('headercentercolor').value+""
      }
    }
    if(this.formulario1.get('agregarencabezado').value===true && form.get('headerceldas').value==="3"){
      if(this.mostrarDiv5===true && this.mostrarDiv6===false && this.imagenBase64_der!==null){
        headertext3=this.imagenBase64_der
        headervalues3="1|"+form.get('headerderwidth').value+"|"+form.get('headerderpositionelementoimg').value+"|"+form.get('headerderbold').value+"|"+form.get('headerdercolor').value+""
      }else if(this.mostrarDiv6===true && this.mostrarDiv5===false){
        headertext3=form.get('headerdertext').value
        headervalues3="0|"+form.get('headerderfontsize').value+"|"+form.get('headerderpositionelementotext').value+"|"+form.get('headerderbold').value+"|"+form.get('headerdercolor').value+""
      }
    }
    const header ={
    id_proyecto:this.datos.datos_proyecto.id_proyecto,
    tipo:0,
    header:""+this.formularioHeader.get('nuevomargenheader').value+"|"+this.formularioHeader.get('headerceldas').value+"|"+this.formularioHeader.get('headertamano1').value+","+this.formularioHeader.get('headertamano2').value+","+this.formularioHeader.get('headertamano3').value+"|"+this.formularioHeader.get('headeropacity').value+"",
    head1:headervalues1?headervalues1:'',
    head2:headervalues2?headervalues2:'',
    head3:headervalues3?headervalues3:'',
    texto1:headertext1?headertext1:'',
    texto2:headertext2?headertext2:'',
    texto3:headertext3?headertext3:'',
    }
    if(this.formularioHeader.valid){
      let resultado=  await this.principalService.GuardarConfImpr(header)
      if(resultado[0]?.id==1){
        SwalService.success('Exito',resultado[0].mensaje)
      }
      else{
        SwalService.error('Advertencia',resultado[0].mensaje)
      }
    }
  }
  Headerwidths(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let headertamano1 = control.get('headertamano1')?.value || 0;
      let headertamano2 = control.get('headerceldas').value=='2'||control.get('headerceldas').value=='3'? control.get('headertamano2')?.value || 0:0
      let headertamano3 = control.get('headerceldas').value=='3'? control.get('headertamano3')?.value || 0:0
      const suma = parseInt(headertamano1) + parseInt(headertamano2) + parseInt(headertamano3)
      if (suma > 100) {
        return { tamanoinvalido: 'La suma de los tamaños del encabezado es mayor al 100%' };
      }
      return null;
    };
  }
  Footerwidths(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let headertamano1 = control.get('footertamano1')?.value || 0;
      let headertamano2 = control.get('footerceldas').value=='2'||control.get('footerceldas').value=='3'? control.get('footertamano2')?.value || 0:0
      let headertamano3 = control.get('footerceldas').value=='3'? control.get('footertamano3')?.value || 0:0
      const suma = parseInt(headertamano1) + parseInt(headertamano2) + parseInt(headertamano3)
      if (suma > 100) {
        return { tamanoinvalido: 'La suma de los tamaños del pie de pagina es mayor al 100%' };
      }
      return null;
    };
  }
  tablaglobal:any
  partidaglobal:any
  eliminarTablasComplejas(html: string, partida: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tablas = doc.querySelectorAll('table');
    tablas.forEach((table, index) => {
        let esTablaCompleja = false;
        const tablaAuxiliar = table.cloneNode(true) as HTMLTableElement; 
        const filas = tablaAuxiliar.querySelectorAll('tr');
        const filasAuxiliares = tablaAuxiliar.querySelectorAll('tr'); // Aseguramos que tablaAuxiliar sea tratado como HTMLTableElement
        const celdasPorFila: number[] = []; // Arreglo para contar las celdas por cada fila
        // console.log(`\nEvaluando tabla ${index + 1}...`);
        filas.forEach((fila, filaIndex) => {
            let celdasEnFila = 0;
            const celdas = fila.querySelectorAll('td, th');
            let columnaActual = 0;  // Para manejar las celdas en las filas
            celdas.forEach((celda) => {
                const colspan = parseInt(celda.getAttribute('colspan') || '1', 10);
                const rowspan = parseInt(celda.getAttribute('rowspan') || '1', 10);
                // Si encontramos un rowspan, agregamos celdas vacías en las filas siguientes de la tabla auxiliar
                if (rowspan > 1) {
                    for (let i = filaIndex + 1; i < filaIndex + rowspan; i++) {
                        const filaSiguiente = filasAuxiliares[i];

                        // Verificamos que la fila siguiente exista
                        if (filaSiguiente) {
                            // Verificamos si la columna actual existe en la fila siguiente
                            const tdVacio = document.createElement('td');
                            if (filaSiguiente.children[columnaActual]) {
                                filaSiguiente.insertBefore(tdVacio, filaSiguiente.children[columnaActual]);
                            } else {
                                // Si no existe, lo agregamos al final de la fila
                                filaSiguiente.appendChild(tdVacio);
                            }
                        }
                    }
                }
                celdasEnFila += colspan; // Incrementamos las celdas por el "colspan"
                columnaActual += colspan; // Aumentamos la columna actual para saber dónde poner el siguiente "colspan"
            });
            celdasPorFila.push(celdasEnFila);  // Se añade el número de celdas de la fila
            // console.log(`Fila ${filaIndex + 1}: ${celdasEnFila} celdas (contando "colspan" y "rowspan")`);
        });
        // Paso 2: Verificamos que todas las filas tengan el mismo número de celdas
        const celdasEsperadas = celdasPorFila[0];
        for (let i = 1; i < celdasPorFila.length; i++) {
            if (celdasPorFila[i] !== celdasEsperadas) {
                esTablaCompleja = true;
            }
        }
        if (!esTablaCompleja) {
          // Si la tabla no es compleja, devolvemos la tabla original sin modificaciones
          // console.log("Tabla procesada correctamente sin modificaciones.");
          
          // Agregar "rowspan=1" a las celdas que no lo tengan
          const celdas = table.querySelectorAll('td, th');
          celdas.forEach((celda) => {
              if (!celda.hasAttribute('rowspan')) {
                  celda.setAttribute('rowspan', '1');
              }
          });
          this.partidaglobal=partida
          this.tablaglobal =table.outerHTML
        }else {      
              this.tablesmal.push({ partida, table });
              table.remove();
              let texto = 'Tabla no copiada';
              this.agregarError(partida, texto);
              // Agregamos un mensaje de advertencia
              // const warningMessage = document.createElement('p');
              // warningMessage.textContent = 'Advertencia: Esta tabla no se pudo procesar correctamente para el PDF.';
              // parent.appendChild(warningMessage);
        }
    });
    return doc.body.innerHTML;
  }
  tablesmal: { partida: string; table: any }[] = [];
  mostrartablas(){
     SwalService.showTables2(this.tablesmal)
  }
  procesarSiExistenTablas(html: string, partida: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tablas = doc.querySelectorAll('table');  
    if (tablas.length > 0) {
        doc.body.innerHTML=this.eliminarTablasComplejas(html, partida); // Llama a la función que procesará las tablas
    }
    return doc.body.innerHTML;
  }
  
  
}