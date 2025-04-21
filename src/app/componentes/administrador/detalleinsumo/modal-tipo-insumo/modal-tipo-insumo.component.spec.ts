import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTipoInsumoComponent } from './modal-tipo-insumo.component';

describe('ModalTipoInsumoComponent', () => {
  let component: ModalTipoInsumoComponent;
  let fixture: ComponentFixture<ModalTipoInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTipoInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTipoInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
