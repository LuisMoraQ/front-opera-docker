import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManteusuariosComponent } from './manteusuarios.component';

describe('ManteusuariosComponent', () => {
  let component: ManteusuariosComponent;
  let fixture: ComponentFixture<ManteusuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManteusuariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManteusuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
