import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegcontrolComponent } from './segcontrol.component';

describe('SegcontrolComponent', () => {
  let component: SegcontrolComponent;
  let fixture: ComponentFixture<SegcontrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegcontrolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegcontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
