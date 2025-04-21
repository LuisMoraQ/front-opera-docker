import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecificacionesTecnicasComponent } from './especificaciones-tecnicas.component';

describe('EspecificacionesTecnicasComponent', () => {
  let component: EspecificacionesTecnicasComponent;
  let fixture: ComponentFixture<EspecificacionesTecnicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EspecificacionesTecnicasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EspecificacionesTecnicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
