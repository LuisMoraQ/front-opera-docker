import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVerEspecificacionComponent } from './modal-ver-especificacion.component';

describe('ModalVerEspecificacionComponent', () => {
  let component: ModalVerEspecificacionComponent;
  let fixture: ComponentFixture<ModalVerEspecificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalVerEspecificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalVerEspecificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
