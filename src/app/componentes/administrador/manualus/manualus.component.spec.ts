import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualusComponent } from './manualus.component';

describe('ManualusComponent', () => {
  let component: ManualusComponent;
  let fixture: ComponentFixture<ManualusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
