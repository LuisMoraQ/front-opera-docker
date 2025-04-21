import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProysistemaComponent } from './proysistema.component';

describe('ProysistemaComponent', () => {
  let component: ProysistemaComponent;
  let fixture: ComponentFixture<ProysistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProysistemaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProysistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
