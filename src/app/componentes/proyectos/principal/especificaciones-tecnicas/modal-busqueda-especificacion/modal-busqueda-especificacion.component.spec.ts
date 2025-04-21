import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBusquedaEspecificacionComponent } from './modal-busqueda-especificacion.component';

describe('ModalBusquedaEspecificacionComponent', () => {
  let component: ModalBusquedaEspecificacionComponent;
  let fixture: ComponentFixture<ModalBusquedaEspecificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalBusquedaEspecificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalBusquedaEspecificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
