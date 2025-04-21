import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgrupacionProyectosComponent } from './agrupacion-proyectos.component';

describe('AgrupacionProyectosComponent', () => {
  let component: AgrupacionProyectosComponent;
  let fixture: ComponentFixture<AgrupacionProyectosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgrupacionProyectosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgrupacionProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
