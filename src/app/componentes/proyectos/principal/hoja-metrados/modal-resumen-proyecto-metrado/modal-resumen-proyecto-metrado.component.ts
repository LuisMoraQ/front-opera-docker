import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { partidaModelo } from '../modal-editar-metrado/modal-editar-metrado.component';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
export interface tipo {
  id_tipo: number;
  tipo_usuario: string;
}
export interface registro {
  id_tipo: Number;
  tipo_registro: string;
}
@Component({
  selector: 'app-modal-resumen-proyecto-metrado',
  templateUrl: './modal-resumen-proyecto-metrado.component.html',
  styleUrls: ['./modal-resumen-proyecto-metrado.component.scss'],
})
export class ModalResumenProyectoMetradoComponent implements OnInit, OnDestroy {
  // @Output() verTitulo = new EventEmitter<any>();
  // @Input() tabproyecto = null;
  // buscando = false;
  // buscando2 = false;
  // actualizado = false;
  // mostrar_carga_todo = false;
  // listaTitulos = [];
  // tablaInformacion = [];
  // tiposUsuario: tipo[] = [];
  // tiposRegistro: registro[] = [
  //   { id_tipo: 0, tipo_registro: 'SISTEMA' },
  //   { id_tipo: 1, tipo_registro: 'HOJA CÀLCULO' },
  // ];
  // tituloSeleccionado = null;
  // id_usuario = null;
  // @Input() idProyecto = null;
  // dataTemporal: any = null;
  // solover = false;
  // decima = null;
  // dec_metrado = 2;
  // permisos = [];
  // permVinculo: boolean = false;
  // permisosGenerales: boolean = false;
  // // porcentTit$: Subscription = new Subscription()
  constructor(
    private encriptadorService: EncriptadorService,
    public formsService: FormsService,
    private toaster: ToastrService,
    private principalService: PrincipalService,
    private metradoService: MetradoService,
    private presuservice: PresupuestosService,
    private variablesGlobalesService: VariablesGlobalesService
  ) {}
  ngOnDestroy() {
    // this.porcentTit$.unsubscribe()
  }

  async ngOnInit() {
    // try {
    //   this.mostrar_carga_todo = true;
    //   this.buscando = true;
    //   this.id_usuario =
    //     this.encriptadorService.recuperarlocalstory('idusuario');
    //   const datoaccs = await this.principalService.ConfgsAsignaUserProy({
    //     id_proyecto: this.idProyecto,
    //     id_usuario: this.id_usuario,
    //   });
    //   if (datoaccs.length) {
    //     const titmetra = datoaccs[0].titmetra
    //       ? JSON.parse(datoaccs[0].titmetra)
    //       : [];
    //     if (titmetra.length) {
    //       this.permisos = titmetra;
    //     }
    //     if (datoaccs[0].presu) {
    //       this.permVinculo = true;
    //     }
    //   } else {
    //     this.permisosGenerales = true;
    //     this.permVinculo = true;
    //   }

    //   this.solover = this.tabproyecto.get('solover').value;
    //   this.decima = this.tabproyecto.get('decimal').value;
    //   let decimales = this.decima;
    //   if (decimales?.toString().includes('|')) {
    //     let arrdec = decimales.split('|');
    //     this.dec_metrado = arrdec[0];
    //   }
    //   await this.listarTitulos();

    //   this.buscando = false;
    //   this.mostrar_carga_todo = false;
    // } catch (e) {
    //   this.buscando = false;
    //   this.mostrar_carga_todo = false;
    //   SwalService.error();
    //   console.log(e);
    // }
  }

  // async ListarPresupuestoTemp() {
  //   const obj = { id_proyecto: this.idProyecto, id_usuario: '' };
  //   const response = await this.presuservice.ExistePresuTemp(obj);
  //   return response.length ? true : false;
  // }

  // async permisosUsuario() {
  //   const datoaccs = await this.principalService.ConfgsAsignaUserProy({
  //     id_proyecto: this.idProyecto,
  //     id_usuario: this.id_usuario,
  //   });
  //   if (datoaccs.length) {
  //     if (datoaccs[0].presu) {
  //       this.permVinculo = true;
  //     }
  //   } else {
  //     this.permVinculo = true;
  //   }
  // }

  // quitarfoco(element: any) {
  //   element.target.blur();
  //   element.target.parentElement.blur();
  // }

  // async listarTitulos() {
  //   try {
  //     this.dataTemporal = null;
  //     this.listaTitulos = [];
  //     const datatemporal = await this.listarTablaTemporal();
  //     if (datatemporal && datatemporal?.datatitulos) {
  //       const datatitulos = JSON.parse(datatemporal?.datatitulos);
  //       this.listaTitulos = datatitulos.map((ele) => {
  //         return ele.dataTitulo;
  //       });

  //       this.dataTemporal = datatitulos;
  //     } else {
  //       const obj = {
  //         id_proyecto: this.idProyecto,
  //       };
  //       const response = await this.metradoService.listarTitulosDeMetrados(obj);
  //       await response.sort((a, b) => a.item - b.item);
  //       this.listaTitulos = response.length ? response : [];
  //       this.listaTitulos = await this.listaTitulos.map((ele) => {
  //         if (!ele.tipo_registro) {
  //           ele.tipo_registro = 0;
  //         }
  //         if (ele.estado_metrado == null) {
  //           ele.estado_metrado = 0;
  //         }
  //         return ele;
  //       });
  //       for (let iterator of this.listaTitulos) {
  //         const calculos = await this.tablaTitulo(
  //           iterator,
  //           iterator.tipo_registro
  //         );

  //         iterator.vinculado = calculos.vinculado;
  //         iterator.estado_metrado = calculos.porcentaje;
  //         if (this.permisosGenerales) {
  //           iterator.edicion = true
  //         } else {
  //           const existe = await this.permisos.find(
  //             (ele) => ele.ind == iterator.indice
  //           );
  //           iterator.edicion = existe?.edit == 1 ? true : false;
  //         }
          
  //       }
  //     }
  //   } catch (e) {
  //     this.buscando = false;
  //     console.log(e);
  //     SwalService.error();
  //   }
  // }

  // async tablaTitulo(titulo, tipo) {
  //   let calculos = null;

  //   if (!tipo) {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       item: titulo.item,
  //     };
  //     const response = await this.metradoService.listarTablaDeMetradoXTitulo(
  //       obj
  //     );
  //     calculos = await this.actuaPorcentaje(
  //       response,
  //       titulo.tipo_registro ? titulo.tipo_registro : 0,
  //       titulo
  //     );
  //   } else {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: titulo.indice,
  //     };
  //     const response = await this.metradoService.listarTablaMetradoExcel(obj);
  //     calculos = await this.actuaPorcentaje(
  //       response[0],
  //       titulo.tipo_registro ? titulo.tipo_registro : 0,
  //       titulo
  //     );
  //   }
  //   return calculos;
  // }

  // async cambioTipoRegistro(tipo, i, titulo) {
  //   if (this.listaTitulos[i].estado_metrado == 0) {
  //     this.listaTitulos[i].tipo_registro = tipo.id_tipo;
  //     await this.actualizarTituloMetrado(titulo, tipo);
  //   } else {
  //     return;
  //   }
  // }

  // async listarInformacionTitulo(titulo, clickeado) {
  //   try {
  //     if (this.tituloSeleccionado !== titulo || !clickeado) {
  //       this.tituloSeleccionado = titulo;
  //       this.tablaInformacion = [];
  //       this.buscando2 = true;
  //       const obj = {
  //         id_proyecto: this.idProyecto,
  //         indice: titulo.indice,
  //       };
  //       const response = await this.metradoService.listarInformacionMetrado(
  //         obj
  //       );
  //       this.tablaInformacion = response ? response : [];
  //       this.buscando2 = false;
  //     }
  //   } catch (e) {
  //     this.buscando2 = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async listarTablaTemporal() {
  //   try {
  //     const id_proyecto = this.idProyecto;
  //     const id_usuario = this.id_usuario;
  //     const obj = {
  //       id_proyecto: id_proyecto,
  //       id_usuario: id_usuario,
  //     };
  //     const response = await this.metradoService.listarCambiosTemporalesMetrado(
  //       obj
  //     );
  //     let respuesta = null;
  //     if (response[0]) {
  //       respuesta = response[0];
  //     }
  //     return respuesta;
  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  // closeModal(result: any = null) {
  //   // this.modal.close(this.actualizado);
  // }

  // async actualizarTituloMetrado(titulo, tipo_registro) {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     if (tipo_registro) {
  //       const obj1 = {
  //         id_proyecto: this.idProyecto,
  //         item: titulo.item,
  //       };
  //       const response2 = await this.metradoService.listarTablaDeMetradoXTitulo(
  //         obj1
  //       );
  //       await this.limpiarRegistros(response2, titulo);
  //     }
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: titulo.indice,
  //       tipo_registro: tipo_registro.id_tipo,
  //       estado_metrado: titulo.estado_metrado,
  //     };
  //     const response = await this.metradoService.actualizarTituloMetrado(obj);
  //     if (response[0].res == '1') {
  //       this.mostrar_carga_todo = false;
  //       this.toaster.success(response[0].mensaje, 'Ok', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       this.actualizado = true;
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async eliminarFilaInformacionTitulo(row) {
  //   try {
  //     let texto =
  //       row.tipo_registro == 1
  //         ? 'Se eliminara toda la tabla excel importada de : '
  //         : row.plantilla == 0
  //         ? 'Se eliminara todos los registro de metrado sistema junto a metrados aceros de : '
  //         : 'Se eliminara todos los registro de metrado aceros de : ';
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       texto + this.tituloSeleccionado.descripcion
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo = true;
  //       const tit = JSON.parse(JSON.stringify(this.tituloSeleccionado));
  //       let response;
  //       if (this.tituloSeleccionado.tipo_registro == 0) {
  //         const obj = {
  //           id_proyecto: this.idProyecto,
  //           indice: row.indice,
  //           item: row.item,
  //           id_hoja: '',
  //           plantilla: row.plantilla,
  //           tipo_registro: row.tipo_registro,
  //         };
  //         response = await this.metradoService.eliminarInformacionTituloMetrado(
  //           obj
  //         );
  //       } else {
  //         const obj = {
  //           id_proyecto: this.idProyecto,
  //           indice: this.tituloSeleccionado.indice,
  //         };
  //         response = await this.metradoService.eliminarTablaMetradoExcel(obj);
  //       }
  //       if (response.length) {
  //         if (!row.tipo_registro) {
  //           await this.actuaPorcentaje(response, 0, this.tituloSeleccionado);
  //         } else {
  //           await this.actuaPorcentaje(response, 1, this.tituloSeleccionado);
  //         }
  //         await this.listarTitulos();
  //         const encontrado = this.listaTitulos.find(
  //           (ele) => ele.indice == tit.indice
  //         );
  //         this.tituloSeleccionado = encontrado ? encontrado : null;
  //         await this.listarInformacionTitulo(this.tituloSeleccionado, false);
  //         this.mostrar_carga_todo = false;
  //         this.toaster.success('Se elimino correctamente', 'Ok', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //         this.actualizado = true;
  //       } else {
  //         this.mostrar_carga_todo = false;
  //         SwalService.error();
  //       }
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async actuaPorcentaje(tabla, tipo_registro, titulo) {
  //   let cantidaPartidas = 0;
  //   let metradosValidos = 0;
  //   let vinculado = true;
  //   if (!tipo_registro) {
  //     for (let row of tabla) {
  //       if (row.unidad) {
  //         cantidaPartidas++;
  //         if (
  //           row.ed_pre == 0 &&
  //           Number(row.cant_metrado) !== Number(row.cantidad)
  //         ) {
  //           vinculado = false;
  //         }
  //         if (
  //           row.cant_metrado !== null &&
  //           Number(row.cant_metrado) !== 0 &&
  //           !row.ed_pre
  //         ) {
  //           metradosValidos++;
  //         }
  //       }
  //     }
  //     if (!tabla.length) {
  //       vinculado = true;
  //     }
  //   } else {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       item: titulo.item,
  //     };
  //     const response = await this.metradoService.listarTablaDeMetradoXTitulo(
  //       obj
  //     );
  //     if (tabla.length) {
  //       for (const iterator of tabla) {
  //         if (iterator.unidad && iterator.item) {
  //           cantidaPartidas++;
  //           const encontrado = await response.find(
  //             (ele) =>
  //               ele.indice == iterator.indice_fila &&
  //               Number(ele.cantidad) === Number(iterator.mtotal)
  //           );

  //           if (!encontrado) {
  //             vinculado = false;
  //           }
  //           if (Number(iterator.mtotal) !== 0) {
  //             metradosValidos++;
  //           }
  //         }
  //       }
  //     } else {
  //       vinculado = true;
  //     }
  //   }

  //   if (cantidaPartidas > 0) {
  //     var porcentaje = (metradosValidos * 100) / cantidaPartidas;
  //   } else {
  //     porcentaje = 0;
  //   }
  //   if (porcentaje == 0) {
  //     vinculado = true;
  //   }
  //   const rendiValido = Math.floor(porcentaje);
  //   if (Number(rendiValido) !== Number(titulo.estado_metrado)) {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: titulo.indice,
  //       tipo_registro: titulo.tipo_registro,
  //       estado_metrado: rendiValido,
  //     };
  //     const response = await this.metradoService.actualizarTituloMetrado(obj);
  //   }
  //   return { porcentaje: rendiValido, vinculado: vinculado };
  // }

  // async verHojaMetrado(titulo) {
  //   this.verTitulo.emit(titulo);
  // }

  // async limpiarRegistros(tabla, tituloSeleccionado) {
  //   let arrayEditados: partidaModelo[] = [];
  //   let arrayMetrados = [];
  //   let arrayAceros = [];
  //   let arrayEditadosDetalle = [];
  //   for (let iterator of tabla) {
  //     if (iterator.unidad) {
  //       iterator = await this.resetearPartida(iterator);
  //       arrayEditadosDetalle.push(iterator.indice);
  //     }
  //   }

  //   const id_proyecto = this.idProyecto;
  //   const id_usuario = this.id_usuario;
  //   const indice_tit = tituloSeleccionado.indice;
  //   const item_tit = tituloSeleccionado.item;
  //   const desc_tit = tituloSeleccionado.descripcion;
  //   const datos1 = JSON.stringify(arrayEditados);
  //   const datos2 = JSON.stringify(arrayMetrados);
  //   const datos3 = JSON.stringify(arrayEditadosDetalle);
  //   const datos4 = JSON.stringify(arrayAceros);
  //   const obj = JSON.stringify({
  //     id_proyecto: id_proyecto,
  //     id_usuario: id_usuario,
  //     indice_tit: indice_tit,
  //     item_tit: item_tit,
  //     desc_tit: desc_tit,
  //     datos1: datos1,
  //     datos2: datos2,
  //     datos3: datos3,
  //     datos4: datos4,
  //   });
  //   const response = await this.metradoService.guardarCambiosMetrado(obj);
  // }

  // async resetearPartida(partida) {
  //   partida.detalleAcero = [];
  //   partida.detalleMetrado = [];
  //   partida.editadoMetrado = 1;
  //   partida.metrado = this.formsService.redondeo(0, this.dec_metrado);
  //   partida.ed_pre = 1;
  //   partida.cant_metrado = this.formsService.redondeo(
  //     partida.cantidad,
  //     this.dec_metrado
  //   );
  //   partida.permitirCambio = 0;
  //   partida.plantilla = 0;
  //   partida.tablaInicialAcero = [];
  //   partida.tablaInicialSistema = [];
  //   partida.totalAceros = this.formsService.redondeo(0, this.dec_metrado);
  //   partida.vinculado = 0;
  //   // partida.estilo = '';
  //   partida.editarMetrado = null;
  //   partida.estado_metrado = null;
  //   partida.metrado_valido = null;
  //   partida.totalAceros = this.formsService.redondeo(0, this.dec_metrado);
  //   return partida;
  // }

  // async vincular(titulo, index = null) {
  //   try {
  //     let titNoVinculados = [];
  //     const tempPresu = await this.ListarPresupuestoTemp();
  //     if (!tempPresu && !this.dataTemporal) {
  //       this.mostrar_carga_todo = true;
  //       let tablaVincular = [];
  //       if (titulo) {
  //         const dataVincular = await this.listaTabla(titulo);
  //         if (dataVincular) {
  //           if (index !== null) {
  //             this.listaTitulos[index].vinculado = true;
  //           } else {
  //             this.listaTitulos[index].vinculado = false;
  //           }
  //           tablaVincular = tablaVincular.concat(dataVincular);
  //         } else {
  //           titNoVinculados.push(titulo.item + ' - ' + titulo.descripcion);
  //         }
  //       } else {
  //         let i = 0;
  //         for (const tit of this.listaTitulos) {
  //           const dataVincular = await this.listaTabla(tit);
  //           if (dataVincular) {
  //             tablaVincular = tablaVincular.concat(dataVincular);
  //             this.listaTitulos[i].vinculado = true;
  //           } else {
  //             titNoVinculados.push(tit.item + ' - ' + tit.descripcion);
  //             this.listaTitulos[i].vinculado = false;
  //           }
  //           i++;
  //         }
  //       }
  //       if (tablaVincular.length) {
  //         const resGuardado = await this.vincularTabla(tablaVincular);
  //         if (resGuardado == '1') {
  //           if (!titNoVinculados.length) {
  //             this.toaster.success('Se vinculó correctamente', 'Correcto', {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 4000,
  //             });
  //             return;
  //           } else {
  //             const texto = titNoVinculados
  //               .map((ele) => {
  //                 return '<i>' + ele + '</i>';
  //               })
  //               .join('<br>');
  //             this.toaster.warning(
  //               'Se omitieron los titulos por diferencia de estructura: <b> <br>' +
  //                 texto +
  //                 '</b><br>',
  //               'Advertencia',
  //               {
  //                 closeButton: false,
  //                 positionClass: 'toast-bottom-right',
  //                 timeOut: 4000,
  //                 enableHtml: true,
  //               }
  //             );
  //             return;
  //           }
  //         } else if (resGuardado == '2') {
  //           this.toaster.error(
  //             'Se estan guardando cambios en presupuesto , intente guardar cambios mas tarde',
  //             'Error',
  //             {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 5000,
  //               enableHtml: false,
  //             }
  //           );
  //           return;
  //         } else {
  //           this.toaster.error('No se pudo guardar los cambios', 'Error', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 4000,
  //             enableHtml: false,
  //           });
  //           return;
  //         }
  //       } else {
  //         this.mostrar_carga_todo = false;
  //         this.toaster.info('Ningun parametro para vincular', '', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.mostrar_carga_todo = false;
  //       let msj = '';
  //       if (this.dataTemporal && !tempPresu) {
  //         msj = 'Existe datos no guardados en hojas metrado';
  //       } else if (!this.dataTemporal && tempPresu) {
  //         msj = 'Existe datos no guardados en edición de presupuesto';
  //       } else {
  //         msj = 'Existe cambios en edicion de presupuesto y en hojas metrado';
  //       }

  //       this.toaster.error(msj + ', guarde o descarte los cambios', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  // async listaTabla(titulo) {
  //   let elemVincular = [];
  //   let omitir = false;
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     item: titulo ? +titulo.item + '.' : '',
  //   };
  //   const tablaSistema = await this.metradoService.listarTablaDeMetradoXTitulo(
  //     obj
  //   );
  //   if (titulo.tipo_registro == 1) {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: titulo.indice,
  //     };
  //     const excel = await this.metradoService.listarTablaMetradoExcel(obj);
  //     if (excel[0].length) {
  //       for (const rowT of excel[0]) {
  //         const encontrado = tablaSistema.find(
  //           (ele) => ele.indice_fila == rowT.indice
  //         );

  //         if (!encontrado) {
  //           omitir = true;
  //         }
  //       }
  //       if (!omitir) {
  //         for (const row of excel[0]) {
  //           if (row.unidad) {
  //             const encontrado = await tablaSistema.find(
  //               (ele) => ele.indice == row.indice_fila && ele.unidad
  //             );
  //             if (encontrado) {
  //               const obj = {
  //                 cant_metrado: this.formsService.redondeo(
  //                   Number(row.mtotal),
  //                   this.dec_metrado
  //                 ),
  //                 cantidad: encontrado.cantidad,
  //                 descripcion: encontrado.descripcion,
  //                 ed_pre: 0,
  //                 id_proyecto: encontrado.id_proyecto,
  //                 indice: encontrado.indice,
  //                 item: encontrado.item,
  //                 itemord: encontrado.itemord,
  //                 metrado: encontrado.metrado,
  //                 parcial: encontrado.parcial,
  //                 plantilla: encontrado.plantilla,
  //                 precio: encontrado.precio,
  //                 tipo_registro: encontrado.tipo_registro,
  //                 vinculado: 0, //CORREGIR PARA SOLO ENVIAR DIFERENTE NO TODOS
  //                 unidad: encontrado.unidad,
  //               };
  //               if (Number(obj.cant_metrado) >= 0) {
  //                 elemVincular.push(obj);
  //               }
  //             } else {
  //               // this.toaster.error( 'El titulo de item :' +
  //               //   titulo.item + ' ,No se puede vincular por que la tabla excel difiere en estructura con estructura de presupuesto',
  //               //   'Advertencia',
  //               //   {
  //               //     closeButton: false,
  //               //     positionClass: 'toast-bottom-right',
  //               //     timeOut: 4000,
  //               //   }
  //               // );
  //               return null;
  //             }
  //           }
  //         }
  //       } else {
  //         // this.toaster.success(
  //         //   'No se puede vincular por que la tabla excel difiere en estructura con estructura de presupuesto',
  //         //   'Error',
  //         //   {
  //         //     closeButton: false,
  //         //     positionClass: 'toast-bottom-right',
  //         //     timeOut: 4000,
  //         //   }
  //         // );
  //         return null;
  //       }
  //     }
  //   } else {
  //     for (const row of tablaSistema) {
  //       if (row.unidad && Number(row.cant_metrado) > 0) {
  //         elemVincular.push(row);
  //       }
  //     }
  //   }
  //   return elemVincular;
  // }

  // async vincularTabla(concatenado) {
  //   const datos1 = JSON.stringify(concatenado);
  //   const obj = JSON.stringify({
  //     id_proyecto: this.idProyecto,
  //     datos1: datos1,
  //   });
  //   const response = await this.metradoService.vincularMetradoAPresupuesto(obj);
  //   if (response.id == '1') {
  //     // this.toaster.success('Se vinculo correctamente', 'Correcto', {
  //     //   closeButton: false,
  //     //   positionClass: 'toast-bottom-right',
  //     //   timeOut: 4000,
  //     // });
  //   } else {
  //   }
  //   this.mostrar_carga_todo = false;
  //   return response.id;
  // }
}
