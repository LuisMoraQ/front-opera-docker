import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportabilidadComponent } from './transportabilidad.component';

describe('TransportabilidadComponent', () => {
  let component: TransportabilidadComponent;
  let fixture: ComponentFixture<TransportabilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportabilidadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
