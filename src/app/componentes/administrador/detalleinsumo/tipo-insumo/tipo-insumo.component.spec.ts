import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoInsumoComponent } from './tipo-insumo.component';

describe('TipoInsumoComponent', () => {
  let component: TipoInsumoComponent;
  let fixture: ComponentFixture<TipoInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
