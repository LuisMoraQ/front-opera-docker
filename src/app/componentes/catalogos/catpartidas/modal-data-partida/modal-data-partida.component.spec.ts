import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDataPartidaComponent } from './modal-data-partida.component';

describe('ModalDataPartidaComponent', () => {
  let component: ModalDataPartidaComponent;
  let fixture: ComponentFixture<ModalDataPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDataPartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDataPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
