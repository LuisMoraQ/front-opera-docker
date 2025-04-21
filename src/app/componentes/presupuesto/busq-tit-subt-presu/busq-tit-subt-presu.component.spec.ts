import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusqTitSubtPresuComponent } from './busq-tit-subt-presu.component';

describe('BusqTitSubtPresuComponent', () => {
  let component: BusqTitSubtPresuComponent;
  let fixture: ComponentFixture<BusqTitSubtPresuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusqTitSubtPresuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusqTitSubtPresuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
