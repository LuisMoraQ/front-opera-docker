import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmcrepdiarioComponent } from './almcrepdiario.component';

describe('AlmcrepdiarioComponent', () => {
  let component: AlmcrepdiarioComponent;
  let fixture: ComponentFixture<AlmcrepdiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmcrepdiarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmcrepdiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
