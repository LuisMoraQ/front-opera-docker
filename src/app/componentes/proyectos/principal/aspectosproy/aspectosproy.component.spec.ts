import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AspectosproyComponent } from './aspectosproy.component';

describe('AspectosproyComponent', () => {
  let component: AspectosproyComponent;
  let fixture: ComponentFixture<AspectosproyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AspectosproyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AspectosproyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
