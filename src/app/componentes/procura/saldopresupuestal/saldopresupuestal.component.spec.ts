import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldopresupuestalComponent } from './saldopresupuestal.component';

describe('SaldopresupuestalComponent', () => {
  let component: SaldopresupuestalComponent;
  let fixture: ComponentFixture<SaldopresupuestalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaldopresupuestalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaldopresupuestalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
