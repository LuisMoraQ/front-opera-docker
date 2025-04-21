import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleinsumoComponent } from './detalleinsumo.component';

describe('DetalleinsumoComponent', () => {
  let component: DetalleinsumoComponent;
  let fixture: ComponentFixture<DetalleinsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleinsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleinsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
