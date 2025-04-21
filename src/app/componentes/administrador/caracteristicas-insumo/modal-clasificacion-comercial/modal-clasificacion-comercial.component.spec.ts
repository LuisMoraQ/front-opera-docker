import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClasificacionComercialComponent } from './modal-clasificacion-comercial.component';

describe('ModalClasificacionComercialComponent', () => {
  let component: ModalClasificacionComercialComponent;
  let fixture: ComponentFixture<ModalClasificacionComercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalClasificacionComercialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalClasificacionComercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
