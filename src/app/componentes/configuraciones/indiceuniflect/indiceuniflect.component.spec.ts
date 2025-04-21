import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiceuniflectComponent } from './indiceuniflect.component';

describe('IndiceuniflectComponent', () => {
  let component: IndiceuniflectComponent;
  let fixture: ComponentFixture<IndiceuniflectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndiceuniflectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiceuniflectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
