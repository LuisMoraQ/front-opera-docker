import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProyectoComponent } from './data-proyecto.component';

describe('DataProyectoComponent', () => {
  let component: DataProyectoComponent;
  let fixture: ComponentFixture<DataProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataProyectoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
