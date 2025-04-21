import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCantidadEdicionFpComponent } from './modal-cantidad-edicion-fp.component';

describe('ModalCantidadEdicionFpComponent', () => {
  let component: ModalCantidadEdicionFpComponent;
  let fixture: ComponentFixture<ModalCantidadEdicionFpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCantidadEdicionFpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCantidadEdicionFpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
