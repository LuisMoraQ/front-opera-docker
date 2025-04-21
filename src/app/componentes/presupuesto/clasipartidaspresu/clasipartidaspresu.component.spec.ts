import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasipartidaspresuComponent } from './clasipartidaspresu.component';

describe('ClasipartidaspresuComponent', () => {
  let component: ClasipartidaspresuComponent;
  let fixture: ComponentFixture<ClasipartidaspresuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasipartidaspresuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasipartidaspresuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
