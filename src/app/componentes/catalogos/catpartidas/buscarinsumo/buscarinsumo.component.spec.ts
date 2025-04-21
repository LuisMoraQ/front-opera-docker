import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarinsumoComponent } from './buscarinsumo.component';

describe('BuscarinsumoComponent', () => {
  let component: BuscarinsumoComponent;
  let fixture: ComponentFixture<BuscarinsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarinsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarinsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
