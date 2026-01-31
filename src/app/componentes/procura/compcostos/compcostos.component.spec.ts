import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompcostosComponent } from './compcostos.component';

describe('CompcostosComponent', () => {
  let component: CompcostosComponent;
  let fixture: ComponentFixture<CompcostosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompcostosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompcostosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
