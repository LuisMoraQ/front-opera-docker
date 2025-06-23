import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgrupinsumosComponent } from './agrupinsumos.component';

describe('AgrupinsumosComponent', () => {
  let component: AgrupinsumosComponent;
  let fixture: ComponentFixture<AgrupinsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgrupinsumosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgrupinsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
