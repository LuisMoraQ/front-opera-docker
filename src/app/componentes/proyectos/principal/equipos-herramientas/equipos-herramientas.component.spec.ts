import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposHerramientasComponent } from './equipos-herramientas.component';

describe('EquiposHerramientasComponent', () => {
  let component: EquiposHerramientasComponent;
  let fixture: ComponentFixture<EquiposHerramientasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquiposHerramientasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposHerramientasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
