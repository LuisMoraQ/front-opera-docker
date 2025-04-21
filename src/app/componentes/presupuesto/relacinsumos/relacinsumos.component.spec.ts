import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacinsumosComponent } from './relacinsumos.component';

describe('RelacinsumosComponent', () => {
  let component: RelacinsumosComponent;
  let fixture: ComponentFixture<RelacinsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelacinsumosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelacinsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
