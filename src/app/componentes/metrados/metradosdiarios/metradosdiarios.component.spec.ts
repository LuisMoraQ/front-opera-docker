import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetradosdiariosComponent } from './metradosdiarios.component';

describe('MetradosdiariosComponent', () => {
  let component: MetradosdiariosComponent;
  let fixture: ComponentFixture<MetradosdiariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetradosdiariosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetradosdiariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
