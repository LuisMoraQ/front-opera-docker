import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCalendarioComponent } from './header-calendario.component';

describe('HeaderCalendarioComponent', () => {
  let component: HeaderCalendarioComponent;
  let fixture: ComponentFixture<HeaderCalendarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderCalendarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderCalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
