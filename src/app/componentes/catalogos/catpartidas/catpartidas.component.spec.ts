import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatpartidasComponent } from './catpartidas.component';

describe('CatpartidasComponent', () => {
  let component: CatpartidasComponent;
  let fixture: ComponentFixture<CatpartidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatpartidasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatpartidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
