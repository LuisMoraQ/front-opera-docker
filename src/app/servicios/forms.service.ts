import { Injectable } from '@angular/core';
import { UntypedFormControl, FormGroup } from '@angular/forms'
import { EncriptadorService } from './encriptador.service';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { PrincipalService } from './principal.service';
@Injectable({
    providedIn: 'root'
})
export class FormsService {

    RE_EMAIL = '(?:[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'
    keyE: number = 69
    keyMenos: number = 189
    keyPeriodo: number = 190
    keyPuntoDecimal: number = 110
    keyBorrar: number = 8
    keyTab: number = 9
    keyFlechaIzquierda: number = 37
    keyFlechaDerecha: number = 39

    constructor(private encriptadorService: EncriptadorService, private principalService: PrincipalService) { }

    private teclaEsNumero(keyCode: number) {
        return keyCode >= 48 && keyCode <= 57
    }

    private teclaEsNumpad(keyCode: number) {
        return keyCode >= 96 && keyCode <= 105
    }

    private teclaEsLetra(keyCode: number) {
        return keyCode >= 65 && keyCode <= 90
    }

    private teclaEsE(keyCode: Number) {
        return keyCode === this.keyE
    }

    private teclaEsMenos(keyCode: Number) {
        return keyCode === this.keyMenos
    }

    private teclaEsPunto(keyCode: Number) {
        return keyCode === this.keyPuntoDecimal || keyCode === this.keyPeriodo
    }

    private teclaEsBorrar(keyCode: Number) {
        return keyCode === this.keyBorrar
    }

    private teclaEsTab(keyCode: Number) {
        return keyCode === this.keyTab
    }

    private teclaEsFlechaIzquieda(keyCode: Number) {
        return keyCode === this.keyFlechaIzquierda
    }

    private teclaEsFlechaDerecha(keyCode: Number) {
        return keyCode === this.keyFlechaDerecha
    }

    private esPrimerMenos(event: any) {
        return !event.target.value.length && this.teclaEsMenos(event.keyCode)
    }

    private esUnicoPunto(event: any) {
        return !event.target.value.includes('.') && this.teclaEsPunto(event.keyCode)
    }
    private valoresPred(key) {                
        var permitidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', ',', ';', ' ', 'Backspace', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'Enter', 'f', 'F', 'c', 'C','d','D','%', '-']
        // var valoresValidos = [8, 32, 37, 39, 45, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 67, 68, 70, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 107, 187, 188]
        return permitidos.includes(key)
    }

    valoresItem(event:any) {
        var permitidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0','.','Backspace', 'ArrowRight', 'ArrowLeft', 'Enter']
        return permitidos.includes(event.key)
    }

    limitarTeclasPredecesor(event: any) {
        return this.valoresPred(event.key)
    }

    limitarSoloNumerosNaturales(event: any) {
        return !event.shiftKey && (this.teclaEsNumero(event.keyCode)
            || this.teclaEsNumpad(event.keyCode)
            || this.teclaEsBorrar(event.keyCode)
            || this.teclaEsTab(event.keyCode)
            || this.teclaEsFlechaIzquieda(event.keyCode)
            || this.teclaEsFlechaDerecha(event.keyCode))
    }

    limitarSoloNumerosEnteros(event: any) {
        return this.limitarSoloNumerosNaturales(event)
            || this.esPrimerMenos(event)
    }

    limitarSoloNumerosReales(event: any) {
        return this.limitarSoloNumerosEnteros(event)
            || this.esUnicoPunto(event)
    }

    limitarSoloNumerosRealesPositivos(event: any) {
        return this.limitarSoloNumerosNaturales(event)
            || this.esUnicoPunto(event)
    }

    limitarSoloClasificador(event: any) {
        return this.limitarSoloNumerosNaturales(event) || this.teclaEsPunto(event.keyCode)
    }

    limitarSoloLetras(event: any) {
        return this.teclaEsLetra(event)
    }

    limitarSoloAlfanumericos(event: any) {
        return this.limitarSoloNumerosNaturales(event) || this.limitarSoloLetras(event.keyCode)
    }

    cambiarAMayuscula(event: any, control: UntypedFormControl) {
        // console.log('cambio a mayuscula', event.target.value, event.target.value.toUpperCase())
        // event.target.value = event.target.value.toUpperCase();
        control.setValue(event.target.value.toUpperCase())
        // event.target.va
        // this.value = this.value.toLocaleUpperCase();
    }


    public maskUsAmountDecimal = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: false,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal1 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 1,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal2 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 2,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal3 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 3,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal4 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 4,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal5 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 5,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal8 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 8,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal10 = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 10,
            integerLimit: 10,
        }),
        placeholderChar: '\u000A'
    };
    public maskTelefono = createNumberMask({
        prefix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: false,
        allowNegative: false,
        integerLimit: 9,
    });
    public maskRuc = createNumberMask({
        prefix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: false,
        integerLimit: 11,
    });
    public maskDias = createNumberMask({
        prefix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: false,
        integerLimit: 4,
    });

    public maskUsAmountDecimal2Neg = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 2,
            integerLimit: 10,
            allowNegative: true
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal3Neg = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 3,
            integerLimit: 10,
            allowNegative: true
        }),
        placeholderChar: '\u000A'
    };
    public maskUsAmountDecimal4Neg = {
        mask: createNumberMask({
            prefix: '',
            allowDecimal: true,
            decimalLimit: 4,
            integerLimit: 10,
            allowNegative: true
        }),
        placeholderChar: '\u000A'
    };

    // autocompletarPrecio(valor: any, decimales = 2) {
    //     if (valor == '0') {
    //         return '0.00'
    //     }
    //     let precioValido, precioEntero, precioDecimal
    //     if (!valor) {
    //         precioDecimal = '00'
    //         precioEntero = '0'
    //     }
    //     const valueSplit = valor.split('.')
    //     if (valueSplit[0].length < 1) {
    //         precioEntero = '0'
    //     } else {
    //         precioEntero = valueSplit[0]
    //     }

    //     if ((valueSplit[1]).length < 1 || !valueSplit[0]) {
    //         precioDecimal = '00'
    //     }
    //     if (valueSplit[1].length == 1) {
    //         precioDecimal = valueSplit[1] + '0'
    //     }
    //     if (valueSplit[1].length == 2) {
    //         precioDecimal = valueSplit[1]
    //     }
    //     precioValido = precioEntero + '.' + precioDecimal
    //     return precioValido
    // }

    autocompletarPrecio(valor: any, decimales = 2) {
        let precioValido, precioEntero, precioDecimal, decimal
        const valueSplit = valor.toString().split('.')
        decimal = valueSplit[1]?.length == decimales ? valueSplit[1] : ''
        // console.log('decimal', decimal);
        // console.log('valueSplit[1]', valueSplit[1]);
        if (!valor || valor == '0' || !valueSplit[0]) {
            precioEntero = '0'
        } else {
            precioEntero = valueSplit[0]
        }
        precioDecimal = ''
        if (decimal.length == decimales) {
            precioDecimal = decimal
        } else {
            valueSplit.push('')
            for (let i = 0; i < decimales; i++) {
                if (!(valueSplit[1])[i]) {
                    precioDecimal = precioDecimal + '0'
                } else {
                    precioDecimal = precioDecimal + (valueSplit[1])[i]
                }
            }
        }
        precioValido = precioEntero + '.' + precioDecimal
        return precioValido
    }

    redondeo(num: number, dec: number): string {
        const precision = 10 ** dec;
        const n = num * precision * (1 + Number.EPSILON);
        const roundedNumber = Math.round(n) / precision;
        return roundedNumber.toFixed(dec);
    }

    async recuperarPDF(nombre) {
        let pdfbytes = null
        const inputDocumento = {
            nombre: nombre,
            subc: 'Insumos'
        }
        const arregloBytes = await this.encriptadorService.recuperarDocumento(inputDocumento)
        // console.log('arregloBytes', arregloBytes);
        if (arregloBytes.archivo) {
            pdfbytes = await this._base64ToArrayBuffer(arregloBytes.archivo)
        } else {
            pdfbytes = ''
        }
        return pdfbytes
    }

    async _base64ToArrayBuffer(base64) {
        var binary_string = base64.replace(/\\n/g, '');
        binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    async AddItemsAuxiliares(array2,datos){
        const resp=await this.principalService.ListarConfImpr({id_proyecto:datos.id_proyecto,id_usuario:''})
        const opcestado= resp.length>0? resp[0].estadoitem?resp[0].estadoitem:'':''
        if(opcestado==="1"){  
        const datosAuxiliares = await this.principalService.ListarProyItemAlt({id_proyecto:datos.id_proyecto})
        const array1 = datosAuxiliares[0].filter(item => item.item.split('.').length < 3) .map(item => ({ item: item.item, alt_item: item.alt_item }))
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
      }else{
        return null
      }
    }
}
