import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparteproyComponent } from './comparteproy.component';

describe('ComparteproyComponent', () => {
  let component: ComparteproyComponent;
  let fixture: ComponentFixture<ComparteproyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparteproyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparteproyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
