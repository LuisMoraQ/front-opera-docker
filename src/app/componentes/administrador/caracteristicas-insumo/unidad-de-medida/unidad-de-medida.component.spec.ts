import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDeMedidaComponent } from './unidad-de-medida.component';

describe('UnidadDeMedidaComponent', () => {
  let component: UnidadDeMedidaComponent;
  let fixture: ComponentFixture<UnidadDeMedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnidadDeMedidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadDeMedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
