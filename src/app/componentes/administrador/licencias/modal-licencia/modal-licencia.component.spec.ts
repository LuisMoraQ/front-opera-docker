import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLicenciaComponent } from './modal-licencia.component';

describe('ModalLicenciaComponent', () => {
  let component: ModalLicenciaComponent;
  let fixture: ComponentFixture<ModalLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalLicenciaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
