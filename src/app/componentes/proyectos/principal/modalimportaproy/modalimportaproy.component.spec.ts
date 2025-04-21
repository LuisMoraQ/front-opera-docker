import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalimportaproyComponent } from './modalimportaproy.component';

describe('ModalimportaproyComponent', () => {
  let component: ModalimportaproyComponent;
  let fixture: ComponentFixture<ModalimportaproyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalimportaproyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalimportaproyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
