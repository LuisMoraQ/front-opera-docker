import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPlantillaComponent } from './modal-plantilla.component';

describe('ModalPlantillaComponent', () => {
  let component: ModalPlantillaComponent;
  let fixture: ComponentFixture<ModalPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPlantillaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
