import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMantusuarioComponent } from './modal-mantusuario.component';

describe('ModalMantusuarioComponent', () => {
  let component: ModalMantusuarioComponent;
  let fixture: ComponentFixture<ModalMantusuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalMantusuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMantusuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
