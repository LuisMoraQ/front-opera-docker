import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVinculoPartidasEspComponent } from './modal-vinculo-partidas-esp.component';

describe('ModalVinculoPartidasEspComponent', () => {
  let component: ModalVinculoPartidasEspComponent;
  let fixture: ComponentFixture<ModalVinculoPartidasEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalVinculoPartidasEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalVinculoPartidasEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
