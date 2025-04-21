import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProgramacionXmlComponent } from './modal-programacion-xml.component';

describe('ModalProgramacionXmlComponent', () => {
  let component: ModalProgramacionXmlComponent;
  let fixture: ComponentFixture<ModalProgramacionXmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalProgramacionXmlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProgramacionXmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
