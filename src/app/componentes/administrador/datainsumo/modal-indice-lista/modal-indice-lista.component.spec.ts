import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIndiceListaComponent } from './modal-indice-lista.component';

describe('ModalIndiceListaComponent', () => {
  let component: ModalIndiceListaComponent;
  let fixture: ComponentFixture<ModalIndiceListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalIndiceListaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalIndiceListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
