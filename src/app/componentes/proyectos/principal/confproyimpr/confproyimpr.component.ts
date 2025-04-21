import { Component, OnInit,Input } from '@angular/core';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { UntypedFormControl, UntypedFormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SwalService } from 'src/app/servicios/swal.service'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-confproyimpr',
  templateUrl: './confproyimpr.component.html',
  styleUrls: ['./confproyimpr.component.scss']
})
export class ConfproyimprComponent implements OnInit {
  bloqconf = false;
  canedit:boolean
  filaSel:any;
  id_proyecto='';
  id_userproy:any;
  datasourcePri=[];
  id_user:any;
  solover=false
  colores:any;
  existetemp=false;
  aspectos:any;
  titulo1:any = '';
  titulo1color:any = '';
  titulo1letra:any = '';
  MostrarCheck=false
  modifica=[];
  profundidad:number
  mostrar_carga_todo = false;
  profundidadpre:number=1
  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as UntypedFormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    this.id_userproy=datosrec.value.id_usuario;
    this.colores=value.get('aspectab').value;
    this.solover=value.get('solover').value;
  }
  constructor(
    private principalService: PrincipalService,
    private toaster: ToastrService,
  ) { }
  FrmImpresion = new UntypedFormGroup({
    prefijo: new UntypedFormControl({value: '', disabled:true}),
    sufijo: new UntypedFormControl({value: '', disabled:true}),
    variable: new UntypedFormControl({value: '0', disabled:true}),
    prefijobtn: new UntypedFormControl(false),
    sufijobtn: new UntypedFormControl(false),
    valor: new UntypedFormControl({value: '', disabled:true}),
    variablebtn: new UntypedFormControl(false),
  });
  FrmActivar = new UntypedFormGroup({
    activar: new UntypedFormControl(''),
  });
  async ngOnInit() {
    this.mostrar_carga_todo = true;
    this.bloqconf = true;
      let prueba = await this.principalService.ListarProyItemAlt({id_proyecto:this.id_proyecto})
      this.canedit = prueba[1][0] && prueba[1][0].estadoitem===1? true:false
      this.FrmActivar.get('activar').setValue(this.canedit);
      this.datasourcePri=prueba[0]
      this.aspectos = JSON.parse(this.colores)
      this.pintar();
      for(let row of this.datasourcePri){
        row.editar1=0;
        row.editar2=0;
        row.editar3=0;
        row.mostrar= row.item.split('.').length>2? 0:1
        row.icomost=row.item.split('.').length!==2? 1:0
        row.auxiliar=row.alt_item ? row.alt_item.split('|')[2] : row.item
        row.auxiliar2=row.alt_item ? row.alt_item.split('|')[2] : row.item
      }
      this.actualizarAuxiliares(this.datasourcePri)
      this.mostrar_carga_todo = false;
      this.bloqconf = false;
  }
  maxtodo(){
    for (let row of this.datasourcePri) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
      row.estmost=1;
    }
  }
  mintodo(){
    for (let row of this.datasourcePri) {
      if(row.item.split('.').length>1){
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  pintar(){
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  toggleOnpresu(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let pila=[];//objetos{ item, icomost }
    this.datasourcePri[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.datasourcePri.length;i++) {
      if (this.datasourcePri[i].item != itemsel && !nuevogru) {
        var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourcePri[i].item.toString().split('.').length){
            this.datasourcePri[i].mostrar=1;
            this.datasourcePri[i].estmost=1;
            if(this.datasourcePri[i].unidad==''){
              pila.push({item:this.datasourcePri[i].item,icomost:this.datasourcePri[i].icomost});
            }
          }
          else{
            var palabra2 = this.datasourcePri[i].item.toString().substring(0, this.datasourcePri[i].item.lastIndexOf('.'))
            let fila1=pila.find(ele=>ele.item==palabra2);
            this.datasourcePri[i].mostrar=fila1.icomost==0?0:this.datasourcePri[i].estmost;
            if(this.datasourcePri[i].unidad==''){
              pila.push({item:this.datasourcePri[i].item,icomost:fila1.icomost==0?0:this.datasourcePri[i].icomost});
            }
          }
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  toggleOffpresu(itemsel, indice) {
    this.datasourcePri[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.datasourcePri.length;i++) {
      if (this.datasourcePri[i].item != itemsel  && !nuevogru) {
        var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourcePri[i].item.toString().split('.').length){
            this.datasourcePri[i].estmost=0;
          }
          this.datasourcePri[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  async GuardarConfiguracion() {
    let axuarray=[]
    const aux= await JSON.parse(JSON.stringify(this.FrmActivar.get('activar').value===true))? 1:0 
    this.datasourcePri.map((item) => {
      if(this.getDepth(item.item)<=2){
        axuarray.push(item)
      }
    });
    this.GuardarInfo(axuarray,aux)
  }
  async GuardarInfo(array,valor){
    this.mostrar_carga_todo = true;
    this.bloqconf = true;
    const tabla1 = JSON.stringify(array);
    const body = JSON.stringify({
      'id_proyecto': this.id_proyecto,
      'estadoitem':valor,
      'datos1': tabla1,
    });
     let resultado= await this.principalService.GuardarItemsAlt(body)
    if(resultado?.id==1){
      SwalService.success('Exito',resultado.mensaje)
    }
    else{
      SwalService.error('Advertencia',resultado.mensaje)
    }
    this.mostrar_carga_todo = false;
    this.bloqconf = false;
  }


  startItem: number | null = null // Ítem inicial del rango
  endItem: number | null = null // Ítem final del rango
  selectedItems: Set<number> = new Set()
  async  toggleCheckbox(indice:number,item: any) {
    // if (this.selectedItems.has(indice)) {
    //   this.selectedItems.delete(indice)// Si el ítem ya está seleccionado, lo desmarcamos
    // } else {
    //   this.selectedItems.add(indice) // Si no está seleccionado, lo agregamos
    // }
    if (this.startItem === null) {
      this.selectedItems.add(indice)
      this.startItem = indice;
    } else if (this.endItem === null) {
      this.endItem = indice;
      this.selectRange()
    }else {
      this.selectedItems.clear() 
      this.startItem = indice;
      this.selectedItems.add(indice)
      this.endItem = null
    }
  }
  async selectRange() {
    if ((this.startItem===0 || this.startItem )&& (this.endItem===0||this.endItem)) {
      let start = Math.min(this.startItem, this.endItem)
      let end = Math.max(this.startItem, this.endItem)
      for (let i = start; i <= end; i++) {
       await  this.selectedItems.add(i)
      }
    }
  }
  getDepth(item: string): number {
     return item.split('.').length
  }
  // AddItemsPrefijo(){
  //   const form=this.FrmImpresion
  //   if(form.get('prefijobtn').value===true){
  //    if((this.startItem===0 || this.startItem )&& (this.endItem===0||this.endItem)){
  //     let start = Math.min(this.startItem, this.endItem)
  //     let end = Math.max(this.startItem, this.endItem)
  //     for(let k=start;k<=end;k++){
  //       if(this.datasourcePri[k].alt_item && this.getDepth(this.datasourcePri[k].item)===1){
  //         let nuevo=this.datasourcePri[k].alt_item.split('|')
  //         this.datasourcePri[k].alt_item=form.get('prefijo').value+'|'+nuevo[1]+'|'+nuevo[2]
  //       }else if(this.getDepth(this.datasourcePri[k].item)===1){
  //          this.datasourcePri[k].alt_item=form.get('prefijo').value+'||'
  //       }
  //     }
  //    }else{
  //     SwalService.error('Advertencia','Selecione correctamente el rango de titulos.' )
  //    }
  //   }
  // }
  // AddItemsSufijo(){
  //   const form=this.FrmImpresion
  //   if(form.get('sufijobtn').value===true){
  //     if((this.startItem===0 || this.startItem )&& (this.endItem===0||this.endItem)){
  //       let start = Math.min(this.startItem, this.endItem)
  //       let end = Math.max(this.startItem, this.endItem)
  //        for(let k=start;k<=end;k++){
  //         if(this.datasourcePri[k].alt_item && this.getDepth(this.datasourcePri[k].item)===1){
  //           let nuevo=this.datasourcePri[k].alt_item.split('|')
  //           this.datasourcePri[k].alt_item=nuevo[0]+'|'+form.get('sufijo').value+'|'+nuevo[2]
  //         }else if(this.getDepth(this.datasourcePri[k].item)===1){
  //            this.datasourcePri[k].alt_item='|'+form.get('sufijo').value+'|'
  //         }
  //       }
  //      }else{
  //       SwalService.error('Advertencia','Selecione correctamente el rango de titulos.' )
  //      }
  //   }
  // }
  incrementarValor(valor: string): string {
    if (this.FrmImpresion.get('variable').value==="2") {
      if(this.isRoman(valor)){
        return this.incrementarRomano(valor);
      }else{
        SwalService.error('Advertencia','El valor ingresado no es un Numero Romano.' )
      }
    } else if (this.FrmImpresion.get('variable').value==="0") {
      if(this.isNumber(valor)){
        return (parseInt(valor) + 1).toString();
      }else{
        SwalService.error('Advertencia','El valor ingresado no es un Numero.' )
      }
    }
    else if (this.FrmImpresion.get('variable').value==="1") {
      if(this.isLetter(valor)){
        return this.incrementarLetra(valor);
      }else{
        SwalService.error('Advertencia','El valor ingresado no es una Letra.' )
      }
    }
  }
  isRoman(value: string): boolean {
    return /^[IVXLCDM]+$/.test(value);
  }
  isNumber(value: string): boolean {
    return /^\d+$/.test(value);
  }
  incrementarRomano(roman: string): string {
    const romanToInt = this.romanoAEntero(roman);
    const nuevoValor = romanToInt + 1;
    return this.enteroARomano(nuevoValor);
  }
  romanoAEntero(romano: string): number {
    const romanMap: { [key: string]: number } = {
      'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    };
    let entero = 0;
    let prevValue = 0;
    // Recorrer el romano de derecha a izquierda
    for (let i = romano.length - 1; i >= 0; i--) {
      const currentValue = romanMap[romano[i]];
      // Si el valor actual es menor que el anterior, se resta, de lo contrario se suma
      if (currentValue < prevValue) {
        entero -= currentValue;
      } else {
        entero += currentValue;
      }
      prevValue = currentValue;
    }
    return entero;
  }
  // Convertir entero a número romano
  enteroARomano(num: number): string {
    const romanSymbols: [string, number][] = [
      ['M', 1000],
      ['CM', 900],
      ['D', 500],
      ['CD', 400],
      ['C', 100],
      ['XC', 90],
      ['L', 50],
      ['XL', 40],
      ['X', 10],
      ['IX', 9],
      ['V', 5],
      ['IV', 4],
      ['I', 1]
    ];

    let resultado = '';
    
    // Convertir el número entero en un número romano
    for (const [roman, value] of romanSymbols) {
      while (num >= Number(value)) {  // Convertimos explícitamente `value` a un número
        resultado += roman;
        num -= Number(value);  // Convertimos también `value` a un número antes de restarlo
      }
    }

    return resultado;
  }
  isLetter(value: string): boolean {
    return /^[A-Za-z]+$/.test(value); 
  }
  // Incrementar letra de manera alfabética (simula las columnas de Excel)
  incrementarLetra(letra: string): string {
    let result = '';
    let carry = true;
    // Iterar sobre la letra de derecha a izquierda, como un sistema numérico en base 26
    for (let i = letra.length - 1; i >= 0; i--) {
      let currentChar = letra[i];
      if (carry) {
        if (currentChar === 'Z') {
          result = 'A' + result; // Si es 'Z', reinicia a 'A' y sigue con el siguiente dígito
        } else {
          result = String.fromCharCode(currentChar.charCodeAt(0) + 1) + result; // Incrementa la letra
          carry = false; // No es necesario continuar con el acarreo
        }
      } else {
        result = currentChar + result; // Mantiene las letras restantes sin cambios
      }
    }
    // Si aún hay acarreo después de procesar todas las letras (ejemplo: de 'Z' a 'AA'), agregar 'A' al principio
    if (carry) {
      result = 'A' + result;
    }
    return result;
  }
  AddItemsSuccesion(){
    let incremento=this.FrmImpresion.get('valor').value.toUpperCase()
    let auxiliar
    if((this.startItem===0 || this.startItem )&& (this.endItem===0||this.endItem)){
      if(this.getDepth(this.datasourcePri[this.endItem].item)===this.getDepth(this.datasourcePri[this.startItem].item)){
        let start = Math.min(this.startItem, this.endItem)
        let end = Math.max(this.startItem, this.endItem)
        for(let k=start;k<=end;k++){
          if(this.datasourcePri[k].alt_item &&this.datasourcePri[k].unidad===''&& this.getDepth(this.datasourcePri[k].item)===this.getDepth(this.datasourcePri[this.startItem].item)){
            auxiliar=this.incrementarValor(incremento);
            if(auxiliar!==undefined){
              let nuevo=this.datasourcePri[k].alt_item.split('|')
              this.datasourcePri[k].alt_item=nuevo[0]+'|'+nuevo[1]+'|'+incremento
              incremento=auxiliar
            }
          }else if(this.getDepth(this.datasourcePri[k].item)===this.getDepth(this.datasourcePri[this.startItem].item)&&this.datasourcePri[k].unidad===''){
            auxiliar=this.incrementarValor(incremento) 
            if(auxiliar!==undefined){
              this.datasourcePri[k].alt_item='||'+incremento
              incremento=auxiliar
            }
          }
        }
        this.actualizarAuxiliares(this.datasourcePri)
      }else{
        SwalService.error('Advertencia','El rango selecionado difiere entre Titulo y Subtitulo' )
      }
    }else{
      SwalService.error('Advertencia','Selecione correctamente el rango de titulos.' )
    }
  }
  Checkboxpre(){
    this.FrmImpresion.get('prefijobtn').value===!this.FrmImpresion.get('prefijobtn').value
    this.MostrarCheckTabla()
  }
  Checkboxsufi(){
    this.FrmImpresion.get('prefijobtn').value===!this.FrmImpresion.get('sufijobtn').value
    this.MostrarCheckTabla()
  }
  Checkboxvariable(){
    this.FrmImpresion.get('variablebtn').value===!this.FrmImpresion.get('variablebtn').value
    this.MostrarCheckTabla()
  }
  async HabilitarEdicion(){
    const form=this.FrmImpresion
    this.canedit=this.FrmActivar.get('activar').value
    if(this.canedit===false){
      form.get('variablebtn').setValue(false)
      form.get('variablebtn').disable()
      this.MostrarCheck=false
    }else{
      form.get('variablebtn').enable()
    }
    const aux= await JSON.parse(JSON.stringify(this.FrmActivar.get('activar').value===true))? 1:0 
    this.mostrar_carga_todo = true;
    this.bloqconf = true;
    await this.principalService.ModificarEstadoItem({id_proyecto:this.id_proyecto,estado:aux})
    this.mostrar_carga_todo = false;
    this.bloqconf = false;
  }
  MostrarCheckTabla(){
    const form=this.FrmImpresion
    if(form.get('prefijobtn').value===true ||form.get('sufijobtn').value===true){
      this.MostrarCheck=true
      form.get('variablebtn').setValue(false)
      form.get('variablebtn').disable();
      form.get('prefijobtn').value===true ?form.get('prefijo').enable():form.get('prefijo').disable()
      form.get('sufijobtn').value===true ?form.get('sufijo').enable():form.get('sufijo').disable()
      form.get('valor').disable()
      form.get('variable').disable()
      this.profundidad=1
    }else if(form.get('variablebtn').value===true){
      this.MostrarCheck=true
      form.get('prefijobtn').setValue(false)
      form.get('prefijobtn').disable();
      form.get('sufijobtn').setValue(false)
      form.get('sufijobtn').disable();
      form.get('prefijo').disable()
      form.get('sufijo').disable()
      form.get('variable').enable()
      form.get('valor').enable()
      this.profundidad=2
    }else{
      this.MostrarCheck=false
      form.get('variablebtn').enable()
      form.get('sufijobtn').enable()
      form.get('prefijobtn').enable()
      form.get('valor').disable()
      form.get('prefijo').disable()
      form.get('sufijo').disable()
      form.get('variable').disable()
      this.startItem=null
      this.endItem=null
      this.selectedItems.clear()
    }
  } 
  async EditarPrefijo(ind:any){
    if(!this.solover){
       this.datasourcePri[ind].editar1 = 1;
    }
  }
  async EditarSufijo(ind:any){

    if(!this.solover){
       this.datasourcePri[ind].editar2 = 1;
    }
  }
  caneditarPrefijo(eve: any, ind2: any) {
    var valor = eve.toString()
    var exam = (this.datasourcePri[ind2].alt_item)?(this.datasourcePri[ind2].alt_item).split('|'):''
    var actual= exam[0]? exam[0]:''
    this.datasourcePri[ind2].editar1 = 0
    if (valor !== actual) {
      var sufijo= exam[1]? exam[1]:''
      var varia= exam[2]? exam[2]:''
      let agregar= valor+"|"+sufijo+"|"+varia
      this.datasourcePri[ind2].alt_item=agregar;
      this.datasourcePri[ind2].vinculo=null;
    }
    this.actualizarAuxiliares(this.datasourcePri)
  }
  caneditarSufijo(eve: any, ind2: any) {
    var valor = eve.toString()
    var exam = (this.datasourcePri[ind2].alt_item)?(this.datasourcePri[ind2].alt_item).split('|'):''
    var actual= exam[1]? exam[1]:''
    this.datasourcePri[ind2].editar2 = 0
    if (valor !== actual) {
      var prefijo= exam[0]? exam[0]:''
      var varia= exam[2]? exam[2]:''
      let agregar= prefijo+"|"+valor+"|"+varia
      this.datasourcePri[ind2].alt_item=agregar;
      this.datasourcePri[ind2].vinculo=null;
    }
    this.actualizarAuxiliares(this.datasourcePri)
  }
  presenterPrefijo(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      let value= (this.datasourcePri[ind2].alt_item ? this.datasourcePri[ind2].alt_item.split('|')[0] : '')
      this.caneditarPrefijo(value,ind2)//el primer parametro es el valor de la celda a editar
    }else if (event.keyCode.toString() == "13") {//enter
      event.target.blur();
    }else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar1 = 1;
            break;
          }
        }
      }
    }else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar1 = 1;
            break;
          }
        }
      }
    }
  }
  presenterSufijo(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      let value= (this.datasourcePri[ind2].alt_item ? this.datasourcePri[ind2].alt_item.split('|')[1] : '')
      this.caneditarPrefijo(value,ind2)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {//enter
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar2 = 1;
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar2= 1;
            break;
          }
        }
      }
    }
  }
  ActfilCambios(arrmodi:any,rowpri:any){
    let eximodi=false;//actualizar en arreglo si existe
    for(let a=0;a<arrmodi.length;a++){
      if(rowpri.indice==arrmodi[a].indice){
        arrmodi[a]=rowpri;
        eximodi=true;
      }
    }
    if(!eximodi){
      arrmodi.push(rowpri)
    }
  }
  async EditarVariable(ind:any){

    if(!this.solover){
       this.datasourcePri[ind].editar3 = 1;
    }
  }
  caneditarVariable(eve: any, ind2: any) {
    var valor = eve.toString()
    var exam = (this.datasourcePri[ind2].alt_item)?(this.datasourcePri[ind2].alt_item).split('|'):''
    var actual= exam[2]? exam[2]:''
    this.datasourcePri[ind2].editar3 = 0
    if (valor !== actual) {
      this.mostrar_carga_todo = true;
      this.bloqconf = true;
     if(this.ExisteAux(ind2,eve)!==true){
      var prefijo= exam[0]? exam[0]:''
      var sufijo= exam[1]? exam[1]:''
      let agregar= prefijo+"|"+sufijo+"|"+valor.toUpperCase()
      this.datasourcePri[ind2].alt_item=agregar
     }else{
      if( this.datasourcePri[ind2].item.split('.').length===1){
        SwalService.error('Advertencia','La Partida '+ eve.toUpperCase() +', Ya existe' )
      }else{
        SwalService.error('Advertencia','La Subpartida '+ this.datasourcePri[ind2].auxiliar.split('.')[0]+'.'+ eve.toUpperCase() +', Ya existe' )
      }
     }
    }
    this.actualizarAuxiliares(this.datasourcePri)
    this.bloqconf = false;
    this.mostrar_carga_todo = false;
  }
  ExisteAux(input: number,valor:string): boolean {
    let compara = this.datasourcePri[input].item.split('.').length===1? valor:this.datasourcePri[input].auxiliar.split('.')[0]+'.'+valor
    for (let i = 0; i < this.datasourcePri.length; i++) {
      // Verifica si compara existe en el campo auxiliar de cada elemento
      if (this.datasourcePri[i].auxiliar.toUpperCase() === compara.toUpperCase())  {
        return true;
      }
    }
    return false;
  }
  presenterVariable(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      let value= (this.datasourcePri[ind2].alt_item ? this.datasourcePri[ind2].alt_item.split('|')[2] : '')
      this.caneditarVariable(value,ind2)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {//enter
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur()
            this.datasourcePri[i].editar3 = 1
            break
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur()
            this.datasourcePri[i].editar3 = 1
            break
          }
        }
      }
    }
  }
  actualizarAuxiliares(datos: any[]): any[] {
    let valorBaseAuxiliar: string | null = null
    let prefijoAuxiliar: string 
    let sufijoAuxiliar: string 
    return datos.map((item) => {
      const depth = item.item.split('.').length
      if (depth === 1) {
        if(valorBaseAuxiliar && valorBaseAuxiliar.split('.').length>0){
          valorBaseAuxiliar = ''
        }
        prefijoAuxiliar = item.alt_item && item.alt_item.split('|')[0]!==null&& item.alt_item.split('|')[0]!=="null"&& item.alt_item.split('|')[0]!=='' ?item.alt_item.split('|')[0] : ''
        sufijoAuxiliar = item.alt_item && item.alt_item.split('|')[1]!==null&& item.alt_item.split('|')[1]!=="null"&& item.alt_item.split('|')[1]!=='' ?item.alt_item.split('|')[1] : ''
        valorBaseAuxiliar =item.alt_item && item.alt_item.split('|')[2] !== ''? valorBaseAuxiliar = item.alt_item.split('|')[2] :  item.item
        item.auxiliar = valorBaseAuxiliar
        item.auxiliar2 = prefijoAuxiliar+' '+ valorBaseAuxiliar +' ' +sufijoAuxiliar
      } else if (depth === 2) {
        let nuevo_aux=''
        if( valorBaseAuxiliar &&valorBaseAuxiliar.split('.').length>1){
          valorBaseAuxiliar = valorBaseAuxiliar.split('.')[0]
        }
        if (item.alt_item && item.alt_item.split('|').length > 2 && item.alt_item.split('|')[2] !== '') {
          const altItemValue2 = item.alt_item.split('|')[2]; 
          nuevo_aux=altItemValue2
          valorBaseAuxiliar += '.' + altItemValue2
        } else {
          const subItem = item.item.split('.')[1]
          valorBaseAuxiliar += '.' + subItem; // Si no tiene alt_item, agregamos el subitem
        }
        item.auxiliar = valorBaseAuxiliar
        item.auxiliar2 = prefijoAuxiliar+' '+ valorBaseAuxiliar +' ' +sufijoAuxiliar
        item.alt_item= prefijoAuxiliar+'|'+sufijoAuxiliar+'|'+nuevo_aux
      } 
      else if (depth > 2) {
          const secondDotIndex = item.item.indexOf('.', item.item.indexOf('.') + 1);
          const subItem = item.item.slice(secondDotIndex);
          item.auxiliar = `${valorBaseAuxiliar}${subItem}`; // Acumulamos el valor auxiliar en cada nivel
          //  item.alt_item= prefijoAuxiliar+'|'+sufijoAuxiliar+'|'+ item.alt_item.split('|')[2]?item.alt_item.split('|')[2]:''
          item.alt_item= '||'
          item.auxiliar2= prefijoAuxiliar+' '+`${valorBaseAuxiliar}${subItem}`+' '+ sufijoAuxiliar 
      }
      return item
    });
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    if(this.filaSel>-1){
      let row=this.datasourcePri[this.filaSel];
      if(row.unidad==''){
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=this.filaSel+1;i<this.datasourcePri.length;i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              this.datasourcePri[i].mostrar = 1
              this.datasourcePri[i].icomost = 1
              this.datasourcePri[i].estmost=1
            }
            else{
              nuevogru=true;
            }
          }
          else{ break; }
        }
      }
    }
  }
  ContraeTodo(){
    if(this.filaSel>-1){
      let row=this.datasourcePri[this.filaSel];
      if(row.unidad==''){
        let inpri = this.filaSel;
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=inpri+1;i<this.datasourcePri.length;i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if(this.datasourcePri[i].item.split('.').length==(itemsel.split('.').length+1)){
                this.datasourcePri[i].mostrar = 1;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost=1;
              }
              else{
                this.datasourcePri[i].mostrar=0;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost=0;
              }
            }
            else{
              nuevogru=true;
            }
          }
          else{ break; }
        }
      }
    }
  }
  async EliminarConfiguracion(){
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se descartaran todos los cambios realizados'
    );
    if (sw.isConfirmed) {
      let axuarray=[]
      this.datasourcePri.map((item) => {
        if(this.getDepth(item.item)<=2){
          item.alt_item='||'
          axuarray.push(item)
        }
      });
      this.GuardarInfo(axuarray,1)
      this.actualizarAuxiliares(this.datasourcePri)
      this.toaster.success('Se descartó correctamente', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    }
  }
  async cambindiceselpresu(ind: any,compara=false) {
    if (ind != this.filaSel || compara){
      this.filaSel=ind;
    }
  }
}