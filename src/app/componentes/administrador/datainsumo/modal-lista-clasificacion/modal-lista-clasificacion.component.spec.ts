import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalListaClasificacionComponent } from './modal-lista-clasificacion.component';

describe('ModalListaClasificacionComponent', () => {
  let component: ModalListaClasificacionComponent;
  let fixture: ComponentFixture<ModalListaClasificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalListaClasificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListaClasificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
