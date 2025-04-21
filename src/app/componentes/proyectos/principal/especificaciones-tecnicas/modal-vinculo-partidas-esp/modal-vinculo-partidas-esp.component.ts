import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { createNumberMask } from 'text-mask-addons';
import { ModalVerEspecificacionComponent } from '../modal-ver-especificacion/modal-ver-especificacion.component';
import stringSimilarity from 'string-similarity-js';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { InvertirColorService } from 'src/app/servicios/invertir-color.service';

@Component({
  selector: 'app-modal-vinculo-partidas-esp',
  templateUrl: './modal-vinculo-partidas-esp.component.html',
  styleUrls: ['./modal-vinculo-partidas-esp.component.scss'],
})
export class ModalVinculoPartidasEspComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  mostrar_carga_todo2 = false;
  @Input() dec_metrado = 2;
  @Input() mask_metrado = '0.2';
  @Input() dec_precio = 2;
  @Input() mask_precio = '0.2';
  @Input() dec_parcial = 2;
  @Input() mask_parcial = '0.2';
  @Input('height') heightacu: number = 100;
  @Input() arreglo: [];
  @Input() arrind: [];
  @Input() rowpasa: any;
  @Input() fondo: any;
  @Input() color: any;
  @Input() letra: any;
  @Input() vincmayor: any;
  @Input() tablaEspecificaciones = [];
  mostrar_carga_todo = false;
  verbloq = true;
  tablapri = [];
  arrindpri = [];
  filaSel = -1;
  colsel = false;
  desvpri = false;

  m_igual = true;
  m_parece = true;
  vinculosel = null;
  especIniciales = [];

  formData = new UntypedFormGroup({
    // itempri: new FormControl('', [Validators.required]),
    // descripcionpri: new FormControl('', [Validators.required]),
    colorv: new UntypedFormControl('#f8f8f8'),
    numporc: new UntypedFormControl(90, [
      Validators.required,
      Validators.min(50),
      Validators.max(100),
    ]),
    limpio: new UntypedFormControl(false),
  });
  checkeds: any;
  uncheckeds = [];
  modificado: boolean;

  // get itempri(): FormControl { return this.formData.get('itempri') as FormControl }
  // get descripcionpri(): FormControl { return this.formData.get('descripcionpri') as FormControl }
  get colorv(): UntypedFormControl {
    return this.formData.get('colorv') as UntypedFormControl;
  }
  get numporc(): UntypedFormControl {
    return this.formData.get('numporc') as UntypedFormControl;
  }
  get limpio(): UntypedFormControl {
    return this.formData.get('limpio') as UntypedFormControl;
  }

  public maskUsAmountDecimal = createNumberMask({
    prefix: '',
    allowDecimal: false,
    integerLimit: 3,
  });
  arrayVinculados = [];
  tablaAux = [];
  modificados = [];
  constructor(
    private modal: NgbActiveModal,
    public formsService: FormsService,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private invertirColorService: InvertirColorService
  ) {}
  ngAfterViewInit(): void {
    this.mostrar_carga_todo = false;
  }

  ngOnInit() {
    this.mostrar_carga_todo = true;
    let resto = 200;
    this.heightacu = window.innerHeight - resto;
    this.tablaAux = JSON.parse(JSON.stringify(this.tablaEspecificaciones));
    this.formData.disable();
    this.colorv.enable();
    this.numporc.enable();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 200;
    this.heightacu = window.innerHeight - resto;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }

  async seleccionarFila(row) {
    if (this.rowpasa !== row) {
      this.mostrar_carga_todo2 = true;
      setTimeout(async () => {
        if (this.modificado) {
          await this.verCambiosFila();
        }
        this.limpio.setValue(false);
        this.limpio.enable();
        this.modificado = false;
        this.rowpasa = row;
        if (this.rowpasa.color_vincpart) {
          // const colorIni = JSON.parse(
          //   JSON.stringify(this.rowpasa.colorvin)
          // );
          // const color = this.rowpasa.colorvin;
          this.colorv.setValue(this.rowpasa.color_vincpart);
        } else {
          const colRand = await this.generarColorRandom();
          this.colorv.setValue(colRand);
        }
        let data = await this.buscarParecidos(this.numporc.value);
        if (data) {
          this.tablapri = data.tablapasa;
          this.arrindpri = data.indicestabla;
          this.vincmayor = data.rowpri;
        } else {
          this.tablapri = [];
          this.arrindpri = [];
          this.vincmayor = null;
        }

        this.checkeds = [];
        this.uncheckeds = [];
        // for (const ele of this.tablapri) {
        //   if (ele.vinculo_part == row.indice) {
        //     this.checkeds.push(true);
        //   } else {
        //     this.checkeds.push(false);
        //   }
        // }
        this.mostrar_carga_todo2 = false;
      }, 100);
    }
  }

  async verCambiosFila() {
    const principal = await this.tablapri.find((ele) => ele.seleccion == 1);
    let i = 0;
    for (const element of this.tablapri) {
      if (this.uncheckeds.includes(i) || this.checkeds.includes(i)) {
        if (
          principal?.indice !== element.vinculo_part &&
          element.vinculo_part
        ) {
          let grupo = await this.tablaAux.filter(
            (ele) =>
              ele.vinculo_part == element.indice &&
              ele.indice !== element.indice
          );
          for (let row of grupo) {
            row.vinculo_part = null;
            row.color_vincpart = null;
            // row.colorletra = await this.invertirColorService.invertirColor(row.color_vincpart)
            row.colorvin = null;
            row.itemvinculo = null;
            if (row.especificacion) {
              row.tipo_vinc = 'MANUAL';
            } else {
              row.tipo_vinc = 'PENDIENTE';
            }
            row.editado = true;
          }
        }
        if (element.seleccion == 1) {
          element.colorvin = this.colorv.value;
          element.color_vincpart = this.colorv.value;
          // element.colorletra = await this.invertirColorService.invertirColor(element.color_vincpart)
          element.vinculo_part = principal.indice;
          element.itemvinculo = principal.item;
          element.editado = true;
          element.especificacion = principal.especificacion
          if (element.indice !== principal.indice) {
            element.tipo_vinc = 'IDEM';
          } else {
            // element.tipo_vinc = 'MANUAL';
          }
        } else if (element.seleccion == 0) {
          element.color_vincpart = null;
          element.colorvin = null;
          element.vinculo_part = null;
          element.itemvinculo = null;
          element.vinculo_espproy = null;
          element.vinculo_esp = null;
          element.vinculo_fuente = null;
          element.tipo_vinc =
            element.especificacion !== null ? 'MANUAL' : 'PENDIENTE';
          element.editado = true;
        }
      }
      i++;
    }
    // console.table(JSON.parse(JSON.stringify(this.tablapri)), [
    //   'item',
    //   'indice',
    //   'tipo_vinc',
    //   'especificacion',
    //   'vinculo_part',
    //   'colorvin',
    // ]);
  }

  async generarColorRandom() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
  }

  async Vincular() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se guardaran todos los vínculos modificados '
    );
    if (sw.isConfirmed) {
      // const obj = { arrayVinculados: this.arrayVinculados, colorv: this.colorv.value, rowpasa: this.rowpasa }
      //
      if (this.modificado) {
        await this.verCambiosFila();
        this.modificado = false;
      }
      let filas = [];
      let indices = [];
      this.tablaAux.map((ele, index) => {
        if (ele.editado) {
          filas.push(ele);
          indices.push(index);
        }
      });
      // const editados = await this.tablaAux.filter((ele) => ele.editado);
      // let obj;
      // if (editados) {
      //   obj = this.tablaAux;
      // } else {
      //   obj = this.tablaEspecificaciones;
      // }
      this.closeModal({ filas: filas, indices: indices });
    }
  }

  ReiniColor() {
    this.colorv.setValue('#f8f8f8');
  }

  async reasignarColor() {
    const filtrados = await this.tablapri.filter((ele) => ele.seleccion == 1);
    for (const iterator of filtrados) {
      // iterator.color_vincpart = this.colorv.value + '4d';
      iterator.color_vincpart = this.colorv.value;
      // iterator.colorletra = await this.invertirColorService.invertirColor(iterator.color_vincpart)
      iterator.editado = true;
    }
  }

  OcultaBloq() {
    this.verbloq = !this.verbloq;
    if (this.verbloq) {
      for (let row of this.tablapri) {
        if (row.seleccion == 2) {
          row.verbloq = 1;
        }
      }
    } else {
      for (let row of this.tablapri) {
        if (row.seleccion == 2) {
          row.verbloq = 0;
        }
      }
    }
  }

  cambindiceselacu(ind: any) {
    if (ind == this.filaSel) {
      this.filaSel = -1;
    } else {
      this.filaSel = ind;
    }
  }

  async cambioseltpri(row, event, idx) {
    // this.tablapri[idx].seleccion = event ? 1 : 0
    const encontrado = this.tablapri.findIndex((ele) => ele.seleccion == 1);
    // const encontrado2 = this.tablapri.find(ele => ele.seleccion == 1)
    if (encontrado == idx) {
      if (event) {
        this.tablapri[idx].itemvinculo = this.tablapri[idx].item;
        // this.tablapri[idx].color_vincpart = this.colorv.value + '4d';
        this.tablapri[idx].color_vincpart = this.colorv.value;
        // this.tablapri[idx].colorletra = await this.invertirColorService.invertirColor(this.tablapri[idx].color_vincpart)
        this.tablapri[idx].vinculo_part = this.tablapri[idx].indice;
        this.tablapri[idx].seleccion = 1;
        this.tablapri[idx].editado = true;
      } else {
        this.tablapri[idx].seleccion = 0;
        this.tablapri[idx].color_vincpart = null;
        // this.tablapri[idx].colorletra = await this.invertirColorService.invertirColor(this.tablapri[idx].color_vincpart)

        this.tablapri[idx].itemvinculo = null;
        this.tablapri[idx].vinculo_part = null;
        this.tablapri[idx].editado = true;
        this.tablapri[idx].porcentaje = null;
        let encontrados = [];
        await this.tablapri.map((ele, index) => {
          if (ele.seleccion == 1) {
            encontrados.push(index);
          }
        });
        let encontrados2 = await this.tablapri.filter(
          (ele) => ele.seleccion == 1
        );
        if (encontrados.length) {
          const primerValido = this.tablapri.findIndex(
            (ele) => ele.seleccion == 1
          );
          let i = 0;
          for (const row of encontrados) {
            this.tablapri[row].itemvinculo = this.tablapri[primerValido].item;
            this.tablapri[row].color_vincpart =
              this.tablapri[primerValido].color_vincpart;
            // this.tablapri[row].colorletra =await this.invertirColorService.invertirColor(this.tablapri[row].color_vincpart)

            this.tablapri[row].vinculo_part =
              this.tablapri[primerValido].indice;
            this.tablapri[row].seleccion =
              this.rowpasa.indice !== this.tablapri[row].indice ? 2 : 1;
            this.tablapri[row].editado = true;

            this.tablaAux[encontrados2[i].ind].itemvinculo =
              this.tablapri[primerValido].item;
            this.tablaAux[encontrados2[i].ind].color_vincpart =
              this.tablapri[primerValido].color_vincpart;
            // this.tablapri[encontrados2[i].ind].colorletra = await this.invertirColorService.invertirColor(this.tablapri[encontrados2[i].ind].color_vincpart)

            this.tablaAux[encontrados2[i].ind].vinculo_part =
              this.tablapri[primerValido].indice;
            this.tablaAux[encontrados2[i].ind].editado = true;
            if (i !== 0) {
              this.tablapri[row].tipo_vinc = 'IDEM';
              this.tablapri[row].especificacion =
                this.tablapri[primerValido].especificacion;
              this.tablapri[row].plantilla = null;

              this.tablaAux[encontrados2[i].ind].especificacion =
                this.tablapri[primerValido].especificacion;
              this.tablapri[row].porcentaje = this.tablapri[row].por;
            } else {
            }
            i++;
          }
        }
      }
    } else {
      if (encontrado !== -1) {
        if (event) {
          this.tablapri[idx].especificacion =
            this.tablapri[encontrado].especificacion;
          this.tablapri[idx].itemvinculo = this.tablapri[encontrado].item;
          this.tablapri[idx].color_vincpart =
            this.tablapri[encontrado].color_vincpart;
          // this.tablapri[idx].colorletra = await this.invertirColorService.invertirColor(this.tablapri[idx].color_vincpart)

          this.tablapri[idx].vinculo_part = this.tablapri[encontrado].indice;
          this.tablapri[idx].seleccion = event ? 1 : 0;
          this.tablapri[idx].editado = true;
          this.tablapri[idx].tipo_vinc = 'IDEM';
          this.tablapri[idx].porcentaje = this.tablapri[idx].porc;
        } else {
          const anterior = this.tablaEspecificaciones.find(
            (ele) => ele.indice == this.tablapri[idx].indice
          );
          this.tablapri[idx].especificacion = anterior.especificacion;
          this.tablapri[idx].porcentaje = null;
          this.tablapri[idx].itemvinculo = null;
          this.tablapri[idx].color_vincpart = null;
          // this.tablapri[idx].colorletra = await this.invertirColorService.invertirColor(this.tablapri[idx].color_vincpart)
          this.tablapri[idx].vinculo_part = null;
          this.tablapri[idx].seleccion = event ? 1 : 0;
          this.tablapri[idx].editado = true;
          this.tablapri[idx].tipo_vinc = 'MANUAL';
        }
      } else {
        this.tablapri[idx].itemvinculo = this.tablapri[idx].item;
        // this.tablapri[idx].color_vincpart = this.colorv.value + '4d';
        this.tablapri[idx].color_vincpart = this.colorv.value;
        // this.tablapri[idx].colorletra = await this.invertirColorService.invertirColor(this.tablapri[idx].color_vincpart)
        this.tablapri[idx].vinculo_part = this.tablapri[idx].indice;
        this.tablapri[idx].seleccion = event ? 1 : 0;
        this.tablapri[idx].editado = true;
      }
    }
  }

  async cambioCheck(checked, indice) {
    this.tablapri[indice].seleccion = checked ? 1 : 0;
    if (checked) {
      if (!this.checkeds.includes(indice)) {
        this.checkeds.push(indice);
        this.modificado = true;
      }
      if (this.uncheckeds.includes(indice)) {
        let index = this.uncheckeds.indexOf(indice);
        if (index > -1) {
          this.uncheckeds.splice(index, 1);
          this.modificado = true;
        }
      }
    } else {
      if (!this.uncheckeds.includes(indice)) {
        this.uncheckeds.push(indice);
        this.modificado = true;
      }
      if (this.checkeds.includes(indice)) {
        let index = this.checkeds.indexOf(indice);
        if (index > -1) {
          this.checkeds.splice(index, 1);
          this.modificado = true;
        }
      }
    }
  }

  async seleccionarTodos(checked, omitir) {
    let i = 0;
    for (const element of this.tablapri) {
      if (omitir) {
        if (element.seleccion !== 2) {
          await this.cambioCheck(checked, i);
        }
      } else {
        await this.cambioCheck(checked, i);
      }

      i++;
    }
  }

  async seleccionarIguales(omitir = false) {
    let i = 0;
    for (const element of this.tablapri) {
      if (Number(element.porc) == 100) {
        if (omitir) {
          if (element.seleccion == 2) {
            element.seleccion = 1;
            if (!this.checkeds.includes(i)) {
              this.checkeds.push(i);
              this.modificado = true;
            }
            if (this.uncheckeds.includes(i)) {
              let index = this.uncheckeds.indexOf(i);
              if (index > -1) {
                this.uncheckeds.splice(index, 1);
                this.modificado = true;
              }
            }
          }
        } else {
          if (element.selccion !== 2) {
            element.seleccion = 1;
            if (!this.checkeds.includes(i)) {
              this.checkeds.push(i);
              this.modificado = true;
            }
            if (this.uncheckeds.includes(i)) {
              let index = this.uncheckeds.indexOf(i);
              if (index > -1) {
                this.uncheckeds.splice(index, 1);
                this.modificado = true;
              }
            }
          }
        }
      }
      i++;
    }
  }

  async CambioPorc() {
    if (!this.numporc.invalid) {
      this.mostrar_carga_todo = true;
      this.tablapri = [];
      this.arrindpri = [];
      this.vincmayor = null;

      let data = await this.buscarParecidos(this.numporc.value);
      if (data) {
        this.checkeds = [];
        this.uncheckeds = [];
        this.tablapri = data.tablapasa;
        this.arrindpri = data.indicestabla;
        this.vincmayor = data.rowpri;
        // for (const ele of this.tablapri) {
        //   if (ele.vinculo_part == this.rowpasa.indice) {
        //     this.checkeds.push(true);
        //   } else {
        //     this.checkeds.push(false);
        //   }
        // }
      }
      this.mostrar_carga_todo = false;
    } else {
      this.toaster.error(
        'El valor debe ser como minimo 50 y maximo 100.',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      this.numporc.setValue(90);
      this.mostrar_carga_todo = true;
      let data = await this.buscarParecidos(this.numporc.value);
      if (data) {
        this.tablapri = data.tablapasa;
        this.arrindpri = data.indicestabla;
        this.vincmayor = data.rowpri;
      }
      this.mostrar_carga_todo = false;
    }
  }

  async especTecnXPartida(item) {
    try {
      const modalRef = this.modalService.open(ModalVerEspecificacionComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.especificacion = item.especificacion;
      const result = await modalRef.result;
      if (result) {
      }
    } catch (e) {
      console.log(e);
    }
  }

  async buscarParecidos(porcentaje) {
    const porcentaje2 = Number(porcentaje) / 100;
    let datareturn = null;
    if (this.rowpasa && this.rowpasa?.unidad) {
      let rowsel = this.rowpasa
      let data = this.tablaAux;
      let filtered = [];
      let arrind = [];
      let padre = '';
      let rowpri;
      for (let i = data.length - 1; i >= 0; i--) {
        if ( rowsel.vinculo_part && data[i].unidad &&rowsel.vinculo_part == data[i].vinculo_part) {
          let parece = stringSimilarity(
            data[i].descripcion,
            rowsel.descripcion
          ); 
          //usar para comparar parecidos
          data[i].seleccion = 1;
        
          data[i].porc = this.formsService.redondeo(parece * 100, 2);
          data[i].verbloq = 1;
          // if (data[i].editable) {
            filtered.push(data[i]);
            arrind.push(i);
          // }
          // padre = data[i].item.substring(0, data[i].item.lastIndexOf('.'));
          // if (rowsel.vinculo == data[i].indice) {
          //   rowpri = data[i];
          // }
        } else {
          let parece = stringSimilarity(
            data[i].descripcion,
            rowsel.descripcion
          ); //usar para comparar parecidos
          if (parece >= porcentaje2 && data[i].unidad != '') {
            // if (data[i].vinculo_part) {
            //   data[i].seleccion = 2;
            // } else {
            //   data[i].seleccion = 0;
            // }
            data[i].seleccion = 0;
            data[i].porc = this.formsService.redondeo(parece * 100, 2);
            data[i].verbloq = 1;
            if (data[i].editable) {
              filtered.push(data[i]);
              arrind.push(i);
            }
          }
        }
      }
      let tablapasa = filtered.reverse();
      let indicestabla = arrind.reverse();

      const existe = tablapasa.find(
        (ele) =>
          ele.vinculo_part == rowsel.indice ||
          rowsel.vinculo_part == ele.vinculo_part
      );
      if (existe) {
        for (const iterator of tablapasa) {
          if (iterator.vinculo_part) {
            if (iterator.vinculo_part == this.rowpasa.vinculo_part) {
              iterator.seleccion = 1;
              // iterator.colorletra = iterator.colorletra ? iterator.colorletra : '#000000'
              // iterator.seleccion = 0;
            } else if (
              iterator.vinculo_part !== this.rowpasa.vinculo_part &&
              iterator.indice == iterator.vinculo_part
            ) {
              iterator.seleccion = 2;
            }
          }
        }
      }
      datareturn = {
        tablapasa: tablapasa,
        indicestabla: indicestabla,
        rowpri: rowpri,
      };
    } else {
      const msj =
        this.rowpasa?.unidad == ''
          ? 'Fila seleccionada no es partida'
          : 'Ninguna fila seleccionada';
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
    return datareturn;
  }

  async ngOnDestroy() {
    this.tablaAux = [];
  }
}
