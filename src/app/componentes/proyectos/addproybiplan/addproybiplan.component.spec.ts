import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddproybiplanComponent } from './addproybiplan.component';

describe('AddproybiplanComponent', () => {
  let component: AddproybiplanComponent;
  let fixture: ComponentFixture<AddproybiplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddproybiplanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddproybiplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
