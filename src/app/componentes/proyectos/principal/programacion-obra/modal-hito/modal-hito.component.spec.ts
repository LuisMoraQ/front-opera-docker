import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHitoComponent } from './modal-hito.component';

describe('ModalHitoComponent', () => {
  let component: ModalHitoComponent;
  let fixture: ComponentFixture<ModalHitoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalHitoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalHitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
