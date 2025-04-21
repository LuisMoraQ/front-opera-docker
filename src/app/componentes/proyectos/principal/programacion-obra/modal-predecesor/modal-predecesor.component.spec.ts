import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPredecesorComponent } from './modal-predecesor.component';

describe('ModalPredecesorComponent', () => {
  let component: ModalPredecesorComponent;
  let fixture: ComponentFixture<ModalPredecesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPredecesorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPredecesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
