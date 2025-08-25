import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformesReportesComponent } from './informes-reportes.component';

describe('InformesReportesComponent', () => {
  let component: InformesReportesComponent;
  let fixture: ComponentFixture<InformesReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformesReportesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformesReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
