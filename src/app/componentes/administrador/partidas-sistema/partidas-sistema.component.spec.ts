import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidasSistemaComponent } from './partidas-sistema.component';

describe('PartidasSistemaComponent', () => {
  let component: PartidasSistemaComponent;
  let fixture: ComponentFixture<PartidasSistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartidasSistemaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidasSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
