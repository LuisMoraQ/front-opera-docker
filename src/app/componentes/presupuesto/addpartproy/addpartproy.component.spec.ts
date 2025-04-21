import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpartproyComponent } from './addpartproy.component';

describe('AddpartproyComponent', () => {
  let component: AddpartproyComponent;
  let fixture: ComponentFixture<AddpartproyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddpartproyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpartproyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
