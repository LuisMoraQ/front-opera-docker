import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosecComponent } from './usuariosec.component';

describe('UsuariosecComponent', () => {
  let component: UsuariosecComponent;
  let fixture: ComponentFixture<UsuariosecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuariosecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
