import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatainsumoComponent } from './datainsumo.component';

describe('DatainsumoComponent', () => {
  let component: DatainsumoComponent;
  let fixture: ComponentFixture<DatainsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatainsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatainsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
