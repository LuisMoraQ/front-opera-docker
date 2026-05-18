import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionPlanillaComponent } from './configuracion-planilla.component';

describe('ConfiguracionPlanillaComponent', () => {
  let component: ConfiguracionPlanillaComponent;
  let fixture: ComponentFixture<ConfiguracionPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfiguracionPlanillaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
