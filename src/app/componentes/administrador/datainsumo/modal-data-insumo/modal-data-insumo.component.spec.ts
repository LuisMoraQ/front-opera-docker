import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDataInsumoComponent } from './modal-data-insumo.component';

describe('ModalDataInsumoComponent', () => {
  let component: ModalDataInsumoComponent;
  let fixture: ComponentFixture<ModalDataInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDataInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDataInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
