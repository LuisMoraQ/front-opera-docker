import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuProyectoComponent } from './menu-proyecto.component';

describe('MenuProyectoComponent', () => {
  let component: MenuProyectoComponent;
  let fixture: ComponentFixture<MenuProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuProyectoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
