import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColaboraproyComponent } from './colaboraproy.component';

describe('ColaboraproyComponent', () => {
  let component: ColaboraproyComponent;
  let fixture: ComponentFixture<ColaboraproyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColaboraproyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColaboraproyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
