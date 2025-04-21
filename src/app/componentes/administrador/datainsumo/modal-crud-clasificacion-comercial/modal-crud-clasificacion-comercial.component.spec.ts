import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrudClasificacionComercialComponent } from './modal-crud-clasificacion-comercial.component';

describe('ModalCrudClasificacionComercialComponent', () => {
  let component: ModalCrudClasificacionComercialComponent;
  let fixture: ComponentFixture<ModalCrudClasificacionComercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrudClasificacionComercialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCrudClasificacionComercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
