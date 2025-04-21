import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPesosComercialesComponent } from './modal-pesos-comerciales.component';

describe('ModalPesosComercialesComponent', () => {
  let component: ModalPesosComercialesComponent;
  let fixture: ComponentFixture<ModalPesosComercialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPesosComercialesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPesosComercialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
