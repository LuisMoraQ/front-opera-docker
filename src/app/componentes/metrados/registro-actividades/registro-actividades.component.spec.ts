import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroActividadesComponent } from './registro-actividades.component';

describe('RegistroActividadesComponent', () => {
  let component: RegistroActividadesComponent;
  let fixture: ComponentFixture<RegistroActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroActividadesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
