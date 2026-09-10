import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhPorPartidaComponent } from './rh-por-partida.component';

describe('RhPorPartidaComponent', () => {
  let component: RhPorPartidaComponent;
  let fixture: ComponentFixture<RhPorPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RhPorPartidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhPorPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
