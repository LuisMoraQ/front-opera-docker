import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarinsumoUsuarioComponent } from './carinsumo-usuario.component';

describe('CarinsumoUsuarioComponent', () => {
  let component: CarinsumoUsuarioComponent;
  let fixture: ComponentFixture<CarinsumoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarinsumoUsuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarinsumoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
