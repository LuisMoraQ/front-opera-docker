import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsumosPorPartidaComponent } from './insumos-por-partida.component';

describe('InsumosPorPartidaComponent', () => {
  let component: InsumosPorPartidaComponent;
  let fixture: ComponentFixture<InsumosPorPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsumosPorPartidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsumosPorPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
