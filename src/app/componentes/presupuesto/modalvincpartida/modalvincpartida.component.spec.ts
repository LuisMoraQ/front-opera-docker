import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalvincpartidaComponent } from './modalvincpartida.component';

describe('ModalvincpartidaComponent', () => {
  let component: ModalvincpartidaComponent;
  let fixture: ComponentFixture<ModalvincpartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalvincpartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalvincpartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
