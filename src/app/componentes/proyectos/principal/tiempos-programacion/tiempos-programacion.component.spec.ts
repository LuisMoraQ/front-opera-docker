import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiemposProgramacionComponent } from './tiempos-programacion.component';

describe('TiemposProgramacionComponent', () => {
  let component: TiemposProgramacionComponent;
  let fixture: ComponentFixture<TiemposProgramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiemposProgramacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiemposProgramacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
