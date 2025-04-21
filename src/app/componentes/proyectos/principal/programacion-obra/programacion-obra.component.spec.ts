import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionObraComponent } from './programacion-obra.component';

describe('ProgramacionObraComponent', () => {
  let component: ProgramacionObraComponent;
  let fixture: ComponentFixture<ProgramacionObraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramacionObraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramacionObraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
