import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGrupoPartidaComponent } from './modal-grupo-partida.component';

describe('ModalGrupoPartidaComponent', () => {
  let component: ModalGrupoPartidaComponent;
  let fixture: ComponentFixture<ModalGrupoPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalGrupoPartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGrupoPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
