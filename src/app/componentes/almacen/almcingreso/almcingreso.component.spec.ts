import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmcingresoComponent } from './almcingreso.component';

describe('AlmcingresoComponent', () => {
  let component: AlmcingresoComponent;
  let fixture: ComponentFixture<AlmcingresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmcingresoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmcingresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
