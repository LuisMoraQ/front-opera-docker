import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaladdtituloComponent } from './modaladdtitulo.component';

describe('ModaladdtituloComponent', () => {
  let component: ModaladdtituloComponent;
  let fixture: ComponentFixture<ModaladdtituloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModaladdtituloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaladdtituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
