import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModversubplecturaComponent } from './modversubplectura.component';

describe('ModversubplecturaComponent', () => {
  let component: ModversubplecturaComponent;
  let fixture: ComponentFixture<ModversubplecturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModversubplecturaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModversubplecturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
