import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacioninsumosComponent } from './relacioninsumos.component';

describe('RelacioninsumosComponent', () => {
  let component: RelacioninsumosComponent;
  let fixture: ComponentFixture<RelacioninsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelacioninsumosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelacioninsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
