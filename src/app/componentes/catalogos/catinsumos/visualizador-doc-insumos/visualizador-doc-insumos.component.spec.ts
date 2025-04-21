import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizadorDocInsumosComponent } from './visualizador-doc-insumos.component';

describe('VisualizadorDocInsumosComponent', () => {
  let component: VisualizadorDocInsumosComponent;
  let fixture: ComponentFixture<VisualizadorDocInsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizadorDocInsumosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizadorDocInsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
