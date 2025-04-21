import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSubpartidaComponent } from './modal-subpartida.component';

describe('ModalSubpartidaComponent', () => {
  let component: ModalSubpartidaComponent;
  let fixture: ComponentFixture<ModalSubpartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSubpartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSubpartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
