import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaaddunidadmedComponent } from './buscaaddunidadmed.component';

describe('BuscaaddunidadmedComponent', () => {
  let component: BuscaaddunidadmedComponent;
  let fixture: ComponentFixture<BuscaaddunidadmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscaaddunidadmedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscaaddunidadmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
