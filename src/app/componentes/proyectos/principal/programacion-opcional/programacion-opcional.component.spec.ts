import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionOpcionalComponent } from './programacion-opcional.component';

describe('ProgramacionOpcionalComponent', () => {
  let component: ProgramacionOpcionalComponent;
  let fixture: ComponentFixture<ProgramacionOpcionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramacionOpcionalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramacionOpcionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
