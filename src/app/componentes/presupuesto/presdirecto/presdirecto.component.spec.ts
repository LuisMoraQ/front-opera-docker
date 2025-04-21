import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresdirectoComponent } from './presdirecto.component';

describe('PresdirectoComponent', () => {
  let component: PresdirectoComponent;
  let fixture: ComponentFixture<PresdirectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresdirectoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresdirectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
