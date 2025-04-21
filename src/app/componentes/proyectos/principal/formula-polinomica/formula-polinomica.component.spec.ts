import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaPolinomicaComponent } from './formula-polinomica.component';

describe('FormulaPolinomicaComponent', () => {
  let component: FormulaPolinomicaComponent;
  let fixture: ComponentFixture<FormulaPolinomicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulaPolinomicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaPolinomicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
