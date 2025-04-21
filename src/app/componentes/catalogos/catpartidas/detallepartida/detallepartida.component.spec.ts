import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallepartidaComponent } from './detallepartida.component';

describe('DetallepartidaComponent', () => {
  let component: DetallepartidaComponent;
  let fixture: ComponentFixture<DetallepartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetallepartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallepartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
