import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflinepageComponent } from './offlinepage.component';

describe('OfflinepageComponent', () => {
  let component: OfflinepageComponent;
  let fixture: ComponentFixture<OfflinepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflinepageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflinepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
