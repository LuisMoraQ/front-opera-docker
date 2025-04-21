import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaladdsubpartidaComponent } from './modaladdsubpartida.component';

describe('ModaladdsubpartidaComponent', () => {
  let component: ModaladdsubpartidaComponent;
  let fixture: ComponentFixture<ModaladdsubpartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModaladdsubpartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaladdsubpartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
