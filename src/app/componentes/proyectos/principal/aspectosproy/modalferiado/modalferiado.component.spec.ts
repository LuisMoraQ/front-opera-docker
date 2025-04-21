import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalferiadoComponent } from './modalferiado.component';

describe('ModalferiadoComponent', () => {
  let component: ModalferiadoComponent;
  let fixture: ComponentFixture<ModalferiadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalferiadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalferiadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
