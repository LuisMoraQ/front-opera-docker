import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatinsumosComponent } from './catinsumos.component';

describe('CatinsumosComponent', () => {
  let component: CatinsumosComponent;
  let fixture: ComponentFixture<CatinsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatinsumosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatinsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
