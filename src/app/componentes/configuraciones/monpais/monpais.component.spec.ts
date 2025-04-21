import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonpaisComponent } from './monpais.component';

describe('MonpaisComponent', () => {
  let component: MonpaisComponent;
  let fixture: ComponentFixture<MonpaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonpaisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonpaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
