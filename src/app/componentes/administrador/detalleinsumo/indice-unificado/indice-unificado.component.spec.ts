import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiceUnificadoComponent } from './indice-unificado.component';

describe('IndiceUnificadoComponent', () => {
  let component: IndiceUnificadoComponent;
  let fixture: ComponentFixture<IndiceUnificadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndiceUnificadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiceUnificadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
