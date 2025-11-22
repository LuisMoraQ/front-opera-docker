import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInformacionComponent } from './registro-informacion.component';

describe('RegistroInformacionComponent', () => {
  let component: RegistroInformacionComponent;
  let fixture: ComponentFixture<RegistroInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroInformacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
