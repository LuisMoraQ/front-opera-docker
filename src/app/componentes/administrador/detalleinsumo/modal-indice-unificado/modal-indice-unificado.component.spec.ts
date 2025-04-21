import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIndiceUnificadoComponent } from './modal-indice-unificado.component';

describe('ModalIndiceUnificadoComponent', () => {
  let component: ModalIndiceUnificadoComponent;
  let fixture: ComponentFixture<ModalIndiceUnificadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalIndiceUnificadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalIndiceUnificadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
