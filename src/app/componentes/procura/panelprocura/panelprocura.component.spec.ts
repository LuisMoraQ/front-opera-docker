import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelprocuraComponent } from './panelprocura.component';

describe('PanelprocuraComponent', () => {
  let component: PanelprocuraComponent;
  let fixture: ComponentFixture<PanelprocuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelprocuraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelprocuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
