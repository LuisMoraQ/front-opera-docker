import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaMetradosComponent } from './hoja-metrados.component';

describe('HojaMetradosComponent', () => {
  let component: HojaMetradosComponent;
  let fixture: ComponentFixture<HojaMetradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HojaMetradosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HojaMetradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
