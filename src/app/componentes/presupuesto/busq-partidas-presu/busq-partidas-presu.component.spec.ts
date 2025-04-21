import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusqPartidasPresuComponent } from './busq-partidas-presu.component';

describe('BusqPartidasPresuComponent', () => {
  let component: BusqPartidasPresuComponent;
  let fixture: ComponentFixture<BusqPartidasPresuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusqPartidasPresuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusqPartidasPresuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
