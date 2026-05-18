import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesRhComponent } from './reportes-rh.component';

describe('ReportesRhComponent', () => {
  let component: ReportesRhComponent;
  let fixture: ComponentFixture<ReportesRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesRhComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
