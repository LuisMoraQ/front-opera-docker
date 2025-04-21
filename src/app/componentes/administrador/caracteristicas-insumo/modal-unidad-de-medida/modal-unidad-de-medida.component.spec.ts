import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUnidadDeMedidaComponent } from './modal-unidad-de-medida.component';

describe('ModalUnidadDeMedidaComponent', () => {
  let component: ModalUnidadDeMedidaComponent;
  let fixture: ComponentFixture<ModalUnidadDeMedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUnidadDeMedidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUnidadDeMedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
