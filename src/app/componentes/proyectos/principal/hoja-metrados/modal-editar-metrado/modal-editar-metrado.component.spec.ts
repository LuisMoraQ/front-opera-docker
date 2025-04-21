import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarMetradoComponent } from './modal-editar-metrado.component';

describe('ModalEditarMetradoComponent', () => {
  let component: ModalEditarMetradoComponent;
  let fixture: ComponentFixture<ModalEditarMetradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditarMetradoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditarMetradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
