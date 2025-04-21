import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusqpartcatComponent } from './busqpartcat.component';

describe('BusqpartcatComponent', () => {
  let component: BusqpartcatComponent;
  let fixture: ComponentFixture<BusqpartcatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusqpartcatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusqpartcatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
