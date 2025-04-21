import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMetradoExcelComponent } from './modal-metrado-excel.component';

describe('ModalMetradoExcelComponent', () => {
  let component: ModalMetradoExcelComponent;
  let fixture: ComponentFixture<ModalMetradoExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalMetradoExcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMetradoExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
