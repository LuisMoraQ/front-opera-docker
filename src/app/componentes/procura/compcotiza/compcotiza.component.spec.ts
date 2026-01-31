import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompcotizaComponent } from './compcotiza.component';

describe('CompcotizaComponent', () => {
  let component: CompcotizaComponent;
  let fixture: ComponentFixture<CompcotizaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompcotizaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompcotizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
