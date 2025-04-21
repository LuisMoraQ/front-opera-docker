import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPlantillaEspecificacionesComponent } from './modal-plantilla-especificaciones.component';

describe('ModalPlantillaEspecificacionesComponent', () => {
  let component: ModalPlantillaEspecificacionesComponent;
  let fixture: ComponentFixture<ModalPlantillaEspecificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPlantillaEspecificacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPlantillaEspecificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
