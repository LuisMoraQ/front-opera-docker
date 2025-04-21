import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNoLaborablesComponent } from './modal-no-laborables.component';

describe('ModalNoLaborablesComponent', () => {
  let component: ModalNoLaborablesComponent;
  let fixture: ComponentFixture<ModalNoLaborablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalNoLaborablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNoLaborablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
