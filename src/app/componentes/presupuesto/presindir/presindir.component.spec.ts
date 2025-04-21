import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresindirComponent } from './presindir.component';

describe('PresindirComponent', () => {
  let component: PresindirComponent;
  let fixture: ComponentFixture<PresindirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresindirComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresindirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
