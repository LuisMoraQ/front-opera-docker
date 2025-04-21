import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionComercialComponent } from './clasificacion-comercial.component';

describe('ClasificacionComercialComponent', () => {
  let component: ClasificacionComercialComponent;
  let fixture: ComponentFixture<ClasificacionComercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasificacionComercialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasificacionComercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
