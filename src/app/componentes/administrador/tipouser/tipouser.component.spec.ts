import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipouserComponent } from './tipouser.component';

describe('TipouserComponent', () => {
  let component: TipouserComponent;
  let fixture: ComponentFixture<TipouserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipouserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipouserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
