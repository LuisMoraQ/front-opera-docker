import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImagenesInsumoComponent } from './modal-imagenes-insumo.component';

describe('ModalImagenesInsumoComponent', () => {
  let component: ModalImagenesInsumoComponent;
  let fixture: ComponentFixture<ModalImagenesInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalImagenesInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImagenesInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
