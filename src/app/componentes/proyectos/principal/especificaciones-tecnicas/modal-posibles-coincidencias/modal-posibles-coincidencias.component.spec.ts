import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPosiblesCoincidenciasComponent } from './modal-posibles-coincidencias.component';

describe('ModalPosiblesCoincidenciasComponent', () => {
  let component: ModalPosiblesCoincidenciasComponent;
  let fixture: ComponentFixture<ModalPosiblesCoincidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPosiblesCoincidenciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPosiblesCoincidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
