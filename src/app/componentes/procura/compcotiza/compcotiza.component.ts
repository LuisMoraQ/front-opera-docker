import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import * as moment from 'moment';
import { PrincipalService } from 'src/app/servicios/principal.service';
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
pdfMake.vfs=pdfFonts.pdfMake.vfs

@Component({
  selector: 'app-compcotiza',
  templateUrl: './compcotiza.component.html',
  styleUrls: ['./compcotiza.component.scss']
})
export class CompcotizaComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  solover=false
  id_reg:any
  id_proyecto:any
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;
  mostrar_carga=false;
  iduser:any
  uidadmin:any
  rowver=null
  indver=null
  puedecanc=-1//si es 1,2,3 es decir que se puede cancelar esa solicitud(solo muestra boton del aprobado)

  buscando=false
  dataSource=[]
  fila_sel=-1
  paddingscroll=0
  paddingscroll2=0
  tab6total:any
  presel:any
  imagenPreview
  nomempresa
  fechaac

  //datos visor solicitud
  formSoli = new FormGroup({
    razon1: new FormControl(''),
    ruc1: new FormControl(''),
    telefono1: new FormControl(''),
    correo1:new FormControl(''),
    direccion1:new FormControl(''),
    actividad1:new FormControl(''),
    contacto1:new FormControl(''),
    fecha1:new FormControl(''),
    plazo1:new FormControl(''),
    estado1:new FormControl(''),
    
    razon2: new FormControl(''),
    ruc2: new FormControl(''),
    telefono2: new FormControl(''),
    correo2:new FormControl(''),
    direccion2:new FormControl(''),
    actividad2:new FormControl(''),
    contacto2:new FormControl(''),
    fecha2:new FormControl(''),
    plazo2:new FormControl(''),
    estado2:new FormControl(''),

    razon3: new FormControl(''),
    ruc3: new FormControl(''),
    telefono3: new FormControl(''),
    correo3:new FormControl(''),
    direccion3:new FormControl(''),
    actividad3:new FormControl(''),
    contacto3:new FormControl(''),
    fecha3:new FormControl(''),
    plazo3:new FormControl(''),
    estado3:new FormControl(''),
  })
  get razon1(): FormControl { return this.formSoli.get('razon1') as FormControl }
  get ruc1(): FormControl { return this.formSoli.get('ruc1') as FormControl }
  get telefono1(): FormControl { return this.formSoli.get('telefono1') as FormControl }
  get correo1(): FormControl { return this.formSoli.get('correo1') as FormControl }
  get direccion1(): FormControl { return this.formSoli.get('direccion1') as FormControl }
  get actividad1(): FormControl { return this.formSoli.get('actividad1') as FormControl }
  get contacto1(): FormControl { return this.formSoli.get('contacto1') as FormControl }
  get fecha1(): FormControl { return this.formSoli.get('fecha1') as FormControl }
  get plazo1(): FormControl { return this.formSoli.get('plazo1') as FormControl }
  get estado1(): FormControl { return this.formSoli.get('estado1') as FormControl }
  get razon2(): FormControl { return this.formSoli.get('razon2') as FormControl }
  get ruc2(): FormControl { return this.formSoli.get('ruc2') as FormControl }
  get telefono2(): FormControl { return this.formSoli.get('telefono2') as FormControl }
  get correo2(): FormControl { return this.formSoli.get('correo2') as FormControl }
  get direccion2(): FormControl { return this.formSoli.get('direccion2') as FormControl }
  get actividad2(): FormControl { return this.formSoli.get('actividad2') as FormControl }
  get contacto2(): FormControl { return this.formSoli.get('contacto2') as FormControl }
  get fecha2(): FormControl { return this.formSoli.get('fecha2') as FormControl }
  get plazo2(): FormControl { return this.formSoli.get('plazo2') as FormControl }
  get estado2(): FormControl { return this.formSoli.get('estado2') as FormControl }
  get razon3(): FormControl { return this.formSoli.get('razon3') as FormControl }
  get ruc3(): FormControl { return this.formSoli.get('ruc3') as FormControl }
  get telefono3(): FormControl { return this.formSoli.get('telefono3') as FormControl }
  get correo3(): FormControl { return this.formSoli.get('correo3') as FormControl }
  get direccion3(): FormControl { return this.formSoli.get('direccion3') as FormControl }
  get actividad3(): FormControl { return this.formSoli.get('actividad3') as FormControl }
  get contacto3(): FormControl { return this.formSoli.get('contacto3') as FormControl }
  get fecha3(): FormControl { return this.formSoli.get('fecha3') as FormControl }
  get plazo3(): FormControl { return this.formSoli.get('plazo3') as FormControl }
  get estado3(): FormControl { return this.formSoli.get('estado3') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
    private principalService: PrincipalService,
  ) { }

  async ngOnInit() {
    this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');
    this.uidadmin = this.encriptadorService.recuperarlocalstory('id_admin');
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    let decimales = this.decproy;
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.mask_precio='0.'+arrdec[1];
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
      this.mask_cant='0.'+arrdec[3];
      this.dec_precio=arrdec[1];
      this.dec_cant=arrdec[3];
    }
    this.formSoli.disable()
    this.nomempresa=this.filareg.nomemp
    this.mostrar_carga=true;
    if(this.filareg.imagen){
      this.principalService.obtenerImagenProyecto(this.filareg.imagen).subscribe(
        (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagenPreview = e.target.result;
          };
          reader.readAsDataURL(blob);
        },
        error => console.error('Error al cargar imagen:', error)
      );
    }
    let resfec = await this.encriptadorService.FechaActualBack();
    if (resfec.id == 1) {
      this.fechaac = new Date(resfec.mensaje);
    }
    else{
      this.fechaac=new Date();
    }
    this.mostrar_carga=false;
    await this.listar();
  }
  async listar(){
    this.buscando=true;
    let res=await this._logisticaService.ListarAgruadquisol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
    this.buscando=false;
    if(res?.length>0){
      let arraux=[...res[0],...res[1]]
      const arrfinal = [...arraux].sort((a, b) => {
        if (a.idgrupo < b.idgrupo) {
          return -1;
        }
        if (a.orden > b.orden) {
          return 1;
        }
      });
      let idact=''
      for(let a=0;a<arrfinal.length;a++){
        if(arrfinal[a].idfila==0)
        {
          if(!(arrfinal[a].tipocontra==1 || arrfinal[a].tipocontra==2 || arrfinal[a].tipocontra==4)){
            idact=arrfinal[a].idgrupo
            arrfinal.splice(a,1);
            a--;
            continue
          }
        }
        else{
          if(arrfinal[a].idgrupo==idact){
            arrfinal.splice(a,1);
            a--;
            continue
          }
        }

        arrfinal[a].mostrar=arrfinal[a].idfila==0?1:0
        arrfinal[a].icomost=0
      }
      this.dataSource=arrfinal
      //this.detalledisgre=res[1]
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }

  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  VerProvs(row,ind){
    this.indver=ind
    this.rowver=row
    this.presel=row.nroprov
    this.puedecanc=-1
    this.ruc1.setValue(row.ruc1)
    this.razon1.setValue(row.razon1)
    this.telefono1.setValue(row.telefono1)
    this.correo1.setValue(row.correo1)
    this.direccion1.setValue(row.direccion1)
    this.actividad1.setValue(row.actividad1)
    this.contacto1.setValue(row.representante1)
    this.fecha1.setValue(this.presel==1 && this.rowver.estado==2?row.vfechagana:row.fecha_sol1)
    this.plazo1.setValue(this.presel==1 && this.rowver.estado==2?row.plazo_gana:row.plazo1)
    this.estado1.setValue(row.fecha_resp1?'Atendido':'Pendiente')
    this.razon2.setValue(row.razon2)
    this.ruc2.setValue(row.ruc2)
    this.telefono2.setValue(row.telefono2)
    this.correo2.setValue(row.correo2)
    this.direccion2.setValue(row.direccion2)
    this.actividad2.setValue(row.actividad2)
    this.contacto2.setValue(row.representante2)
    this.fecha2.setValue(this.presel==2 && this.rowver.estado==2?row.vfechagana:row.fecha_sol2)
    this.plazo2.setValue(this.presel==2 && this.rowver.estado==2?row.plazo_gana:row.plazo2)
    this.estado2.setValue(row.fecha_resp2?'Atendido':'Pendiente')
    this.razon3.setValue(row.razon3)
    this.ruc3.setValue(row.ruc3)
    this.telefono3.setValue(row.telefono3)
    this.correo3.setValue(row.correo3)
    this.direccion3.setValue(row.direccion3)
    this.actividad3.setValue(row.actividad3)
    this.contacto3.setValue(row.representante3)
    this.fecha3.setValue(this.presel==3 && this.rowver.estado==2?row.vfechagana:row.fecha_sol3)
    this.plazo3.setValue(this.presel==3 && this.rowver.estado==2?row.plazo_gana:row.plazo3)
    this.estado3.setValue(row.fecha_resp3?'Atendido':'Pendiente')
    //cargar condicionales de ver cancelar verificar fechas fecha_gana,plazo_gana
    // if(row.fecha_gana){
    //   let fhoy=moment(this.fechaac).format('YYYY-MM-DD')
    //   let fechaana1=new Date(moment(fhoy).format('YYYY-MM-DD')+' 09:00:00');
    //   let fechaa = moment(fechaana1);

    //   let fechana=new Date(moment(row.fecha_gana).format('YYYY-MM-DD')+' 09:00:00');
    //   fechana.setDate(fechana.getDate()+Number(row.plazo_gana))
    //   let fechab = moment(fechana);
    //   let difdias=(fechab.diff(fechaa, 'days'));
    //   if(difdias<0){
    //     this.puedecanc=row.nroprov
    //   }
    // }
    let validoanula=row.estorden==0 || row.estorden==4;  //agregar esta validacion tambien , cual tiene prioridad?
    if(validoanula)
      this.puedecanc=row.nroprov
    
  }
  toggleOn(tipo: any) {
    for (let row of this.dataSource) {
      if (row.idgrupo == tipo) {
        if (row.idfila != 0) {
          row.mostrar = 1;
        } else row.icomost = 1;
      }
    }
  }
  toggleOff(tipo: any) {
    for (let row of this.dataSource) {
      if (row.idgrupo == tipo) {
        if (row.idfila != 0) {
          row.mostrar = 0;
        } else row.icomost = 0;
      }
    }
  }
  async Cancelar(nroprov:any){
    try{
      //const sw = await SwalService.confirm('Estas seguro que desea Anular la Orden de Atención?', '')
      const sw = await SwalService.radioopt('Estas seguro que desea Anular la Orden de Atención?','',{0:'Mantener Cotizaciones',1:'Limpiar cotizaciones'},'Confirmar','Cancelar','0');
      if (sw.isConfirmed) {
        this.mostrar_carga_todo=true;
        let res=await this._logisticaService.DesAprobarCotizacion({id_proyecto:this.id_proyecto,id_registro:this.rowver.id_registro,idgrupo:this.rowver.idgrupo,idfila:this.rowver.idfila,eliminacoti:sw.value});//eliminacoti 0 no elimina,1 elimina cotizaciones
        if(res.id==1)
        {
          await this.listar();
          await this.VerProvs(this.dataSource[this.indver],this.indver)
          this.mostrar_carga_todo=false;
          await SwalService.success('Correcto',res.mensaje)
        }
        else
        {
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia',res.mensaje);
        }
      }
    }catch(e){
      this.mostrar_carga_todo=false
      console.log(e)
    }
  }
  async Aprobar(nroprov:any){
    // let docpdf=await this.crearReporte(nroprov)//comentar codigo para generar base 64, usar el open
    // console.log(docpdf)
    // return

    try{
      const sw = await SwalService.confirm('Estas seguro que desea Aprobar la Orden de Servicio?', '')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo=true;
        let datapasa=[]
        for(let row of this.dataSource){
          if(row.idgrupo==this.rowver.idgrupo && row.idfila!=0){
            let preciop=nroprov==1?row.preciosol1:nroprov==2?row.preciosol2:row.preciosol3;
            let parcialp=this.formService.redondeo(Number(preciop)*Number(row.cantidad),this.dec_parcial)
            let newrow={
              id_proyecto:row.id_proyecto,
              id_registro:row.id_registro,
              idgrupo:row.idgrupo,
              idfila:row.idfila,
              indrep:row.indrep,
              precio:preciop,
              parcial:parcialp
            }
            datapasa.push(newrow)
          }
        }
        //generar reporte y pasar al backend
        let docpdf=await this.crearReporte(nroprov)
        const datos1 = JSON.stringify(datapasa);
        let objpasa={
          id_proyecto:this.id_proyecto,
          id_registro:this.rowver.id_registro,
          idgrupo:this.rowver.idgrupo,
          idfila:this.rowver.idfila,
          nroprov:nroprov,
          plazoate:nroprov==1?this.rowver.plazo1:nroprov==2?this.rowver.plazo2:this.rowver.plazo3,
          parcial:nroprov==1?this.rowver.monto1:nroprov==2?this.rowver.monto2:this.rowver.monto3,
          datos1:datos1,
          //envio correo
          agrupacion:this.rowver.descripcion,
          nomempresa:this.filareg.nomemp,
          idprov:nroprov==1?this.rowver.id_prov1:nroprov==2?this.rowver.id_prov2:this.rowver.id_prov3,
          razon:nroprov==1?this.rowver.razon1:nroprov==2?this.rowver.razon2:this.rowver.razon3,
          destinatario:nroprov==1?this.rowver.correo1:nroprov==2?this.rowver.correo2:this.rowver.correo3,
          docpasa:docpdf,
        }
        let res=await this._logisticaService.AprobarCotizacion(objpasa);
        if(res.id==1)
        {
          await this.listar();
          await this.VerProvs(this.dataSource[this.indver],this.indver)
          this.mostrar_carga_todo=false;
          await SwalService.success('Correcto',res.mensaje)
        }
        else
        {
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
        }
      }
    }catch(e){
      this.mostrar_carga_todo=false
      console.log(e)
    }
  }
  async crearReporte(nro:any){
    let objdatos={
      razon:nro==1?this.rowver.razon1:nro==2?this.rowver.razon2:nro==3?this.rowver.razon3:0,
      ruc:nro==1?this.rowver.ruc1:nro==2?this.rowver.ruc2:nro==3?this.rowver.ruc3:0,
      direccion:nro==1?this.rowver.direccion1:nro==2?this.rowver.direccion2:nro==3?this.rowver.direccion3:0,
      telefono:nro==1?this.rowver.telefono1:nro==2?this.rowver.telefono2:nro==3?this.rowver.telefono3:0,
      correo:nro==1?this.rowver.correo1:nro==2?this.rowver.correo2:nro==3?this.rowver.correo3:0,
      contacto:nro==1?this.rowver.representante1:nro==2?this.rowver.representante2:nro==3?this.rowver.representante3:0,
      lugar:nro==1?this.rowver.lugar1:nro==2?this.rowver.lugar2:nro==3?this.rowver.lugar3:0,
      plazo:nro==1?this.rowver.plazo_ate1:nro==2?this.rowver.plazo_ate2:nro==3?this.rowver.plazo_ate3:0,
    }
    let tabla1=[]
    let totaltab=nro==1?this.rowver.monto1:nro==2?this.rowver.monto2:nro==3?this.rowver.monto3:0;
    let itemp=1
    for(let row of this.dataSource){
      if(this.rowver.idgrupo==row.idgrupo && row.idfila!=0){
        let precpas=nro==1?row.preciosol1:nro==2?row.preciosol2:nro==3?row.preciosol3:null;
        let parcpas=Number(precpas)*Number(row.cantidad)
        let filaadd={
          item:itemp++,
          id_proyecto:row.id_proyecto,
          idgrupo:row.idgrupo,
          idfila:row.idfila,
          orden:row.orden,
          descripcion:row.descripcion,
          nomgrupo:row.nomgrupo,
          unidad:row.unidad,
          cantidad:this.formService.redondeo(row.cantidad,this.dec_cant).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
          marca:nro==1?row.marca1:nro==2?row.marca2:nro==3?row.marca3:'',
          precio:this.formService.redondeo(precpas,this.dec_precio).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
          parcial:this.formService.redondeo(parcpas,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,')
        }
        tabla1.push(filaadd);
      }
    }
    const docDefinition = this.docDefinitionA4(objdatos, tabla1,this.formService.redondeo(totaltab,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    // console.log(docDefinition)
    // pdfMake.createPdf(docDefinition).open();
    const base64Data = await new Promise<string>((resolve) => {
      pdfMake.createPdf(docDefinition).getBase64((data) => {
        resolve(data);
      });
    });
    return base64Data;
  }
  docDefinitionA4(cabezera,detalle,totaltab) {
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
    
    return{
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          stack: [
            this.createHeader(),
            this.createFormInfo(cabezera),
            this.createItemsTable(detalle,totaltab),
            this.createFooter(cabezera.lugar??'',cabezera.plazo??'')
          ],
          margin: [10, 10, 10, 10]
          /* table: {
            widths: ['*'],
            body: [
              [{
                stack: [
                  this.createHeader(),
                  this.createFormInfo(cabezera),
                  this.createItemsTable(detalle,totaltab),
                  this.createFooter(cabezera.lugar??'')
                ],
                margin: [10, 10, 10, 10]
              }]
            ]
          },
          layout: {
            hLineColor: () => '#A0A0A0',
            vLineColor: () => '#A0A0A0',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          } */
        }
      ],

      styles: {
        headerTitle: { fontSize: 10, bold: true, alignment: 'center' },
        mainTitle: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 15] },
        label: { fontSize: 9, bold: true },
        value: { fontSize: 9 },
        tableHeader: { fontSize: 8, bold: true, fillColor: '#DCE6F1', alignment: 'center' },
        tableCell: { fontSize: 8 }
      },

      defaultStyle: {
        fontSize: 8,
        font:'Arial',
      },
    };
  }
  createHeader() {
    let fhoy=moment(this.fechaac).format('YYYY-MM-DD')
    let arrfec=fhoy.split('-')
    let columnas=[]
    if(this.imagenPreview){
      columnas.push({ image: this.imagenPreview, width: 60, alignment: 'center' });
    } else {
      columnas.push({ text: '', width: 60 });
    }
    columnas.push({
        stack: [
          { text: this.nomempresa??'', style: 'mainTitle' },
        ],
        width: '*' 
    })
    columnas.push({
      table: {
        widths: [30, 30, 30],
        body: [
          [
            { text: 'DIA', style: 'tableHeader' },
            { text: 'MES', style: 'tableHeader' },
            { text: 'AÑO', style: 'tableHeader' }
          ],
          [
            {text:arrfec[2],alignment: 'center'}, 
            {text:arrfec[1],alignment: 'center'}, 
            {text:arrfec[0],alignment: 'center'}
          ]
        ]
      },
      layout: {
        hLineColor: () => '#A0A0A0',
        vLineColor: () => '#A0A0A0',
      },
      width:110
    })
    return {
      columns:columnas
    };
  }
  createFormInfo(data: any) {
    return {
      stack: [
        { text: 'ORDEN DE ATENCIÓN', style: 'headerTitle',margin: [ 0, 10 ] },
        {
          columns: [
            { text: 'RAZON SOCIAL :', style: 'label', width: 80 },
            { text: data.razon, style: 'value' },
            { text: 'RUC:', style: 'label', width: 30 },
            { text: data.ruc, style: 'value', width: 100 }
          ], margin: [0, 4, 0, 4]
        },
        this.createLineField('DIRECCION :', data.direccion),
        {
          columns: [
            { text: 'TELEFONO :', style: 'label', width: 80 },
            { text: data.telefono, style: 'value', width: 100 },
            /* { text: 'FAX :', style: 'label', width: 40 },
            { text: 'data.fax', style: 'value', width: 100 }, */
            { text: 'EMAIL :', style: 'label', width: 40 },
            { text: data.correo, style: 'value', width:'*'}
          ], margin: [0, 4, 0, 4]
        },
        this.createLineField('CONTACTO :', data.contacto),
      ],
      margin: [0, 10, 0, 15]
    };
  }
  createLineField(label: string, value: string) {
    return {
      canvas: [{ type: 'line', x1: 80, y1: 10, x2: 480, y2: 10, lineWidth: 0.5, lineColor: '#B0B0B0' }],
      //absolutePosition: { x: 0, y: 0 }, // Esto es solo decorativo, mejor usar columnas:
      columns: [
        { text: label, style: 'label', width: 80 },
        { text: value || '', style: 'value'}
      ], margin: [0, 4, 0, 4]
    };
  }
  createItemsTable(items: any[],totaltab=0) {
    let headtab=[
        { text: 'ITEM', style: 'tableHeader', alignment:null },
        { text: 'DESCRIPCION', style: 'tableHeader', alignment:null },
        { text: 'UND', style: 'tableHeader', alignment:null },
        { text: 'MARCA', style: 'tableHeader', alignment:null },
        { text: 'CANT', style: 'tableHeader', alignment:null },
        { text: 'P.UNITARIO', style: 'tableHeader', alignment:null },
        { text: 'IMPORTE', style: 'tableHeader', alignment:null }
      ]
    const body = [];
    body.push(headtab)
    let numdet=items.length>10?items.length:10
    for (let i = 0; i < numdet; i++) {
      const item = items[i] || {};
      body.push([
        { text: (i + 1), style: 'tableCell', alignment: 'center' },
        { text: item.descripcion || '', style: 'tableCell', alignment:'left',fontSize:7 },
        { text: item.unidad || '', style: 'tableCell', alignment: 'center' },
        { text: item.marca, style: 'tableCell', alignment:'left' },
        { text: item.cantidad || '', style: 'tableCell', alignment: 'right' },
        { text: item.precio || '', style: 'tableCell', alignment:'right' },
        { text: item.parcial || '', style: 'tableCell', alignment:'right' }
      ]);
    }
    // 3. FILA DE TOTAL (El "Footer" de la tabla)
    let objfooter=[
      { 
        text: 'TOTAL', 
        colSpan: 6, 
        style: 'tableHeader', 
        alignment: 'center',
      },{}, {}, {}, {},{},
      { 
        text: totaltab, 
        style: 'tableHeader', 
        alignment: 'right',
        //fillColor: '#F5F5F5'
      }
    ]
    body.push(objfooter);
    return {
      table: {
        headerRows: 1,
        widths: [20, '*', 20, 75, 50, 47, 52],
        body: body
      },
      layout: {
        hLineColor: () => '#A0A0A0',
        vLineColor: () => '#A0A0A0',
      }
    };
  }
  createFooter(lugar: string,plazo:string) {
    return {
      stack: [
        {
          columns: [
          { text: 'LUGAR DE ENTREGA :', style: 'label', width: 110 },
          { text: lugar, style: 'value',width: '*' }
          ],
          margin:[0, 3, 0, 0]
        },
        {
          columns: [
          { text: 'PLAZO DE ATENCIÓN :', style: 'label', width: 110 },
          { text: plazo +" DIAS", style: 'value',width: '*' }
        ],
          margin:[0, 3, 0, 0]
        }
      ],
      margin: [0, 5, 0, 0]
    };
  }
  mostrarTodo5() {
    for (let row of this.dataSource) {
      if (row.indice != null) {
        row.mostrar = '1';
      } else row.icomost = 1;
    }
  }
  ocultarTodo5() {
    for (let row of this.dataSource) {
      if (row.indice != null) {
        row.mostrar = '0';
      } else {
        row.icomost = 0;
      }
    }
  }
}
