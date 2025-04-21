import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfproyimprComponent } from './confproyimpr.component';

describe('ConfproyimprComponent', () => {
  let component: ConfproyimprComponent;
  let fixture: ComponentFixture<ConfproyimprComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfproyimprComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfproyimprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
