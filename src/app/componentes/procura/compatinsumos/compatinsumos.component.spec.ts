import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompatinsumosComponent } from './compatinsumos.component';

describe('CompatinsumosComponent', () => {
  let component: CompatinsumosComponent;
  let fixture: ComponentFixture<CompatinsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompatinsumosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompatinsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
