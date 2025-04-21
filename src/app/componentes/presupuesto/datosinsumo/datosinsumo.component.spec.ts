import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosinsumoComponent } from './datosinsumo.component';

describe('DatosinsumoComponent', () => {
  let component: DatosinsumoComponent;
  let fixture: ComponentFixture<DatosinsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatosinsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosinsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
