import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResumenProyectoMetradoComponent } from './modal-resumen-proyecto-metrado.component';

describe('ModalResumenProyectoMetradoComponent', () => {
  let component: ModalResumenProyectoMetradoComponent;
  let fixture: ComponentFixture<ModalResumenProyectoMetradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalResumenProyectoMetradoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalResumenProyectoMetradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
