import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracteristicasInsumoComponent } from './caracteristicas-insumo.component';

describe('CaracteristicasInsumoComponent', () => {
  let component: CaracteristicasInsumoComponent;
  let fixture: ComponentFixture<CaracteristicasInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaracteristicasInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaracteristicasInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
