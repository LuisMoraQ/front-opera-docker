import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmcrepvalorizadoComponent } from './almcrepvalorizado.component';

describe('AlmcrepvalorizadoComponent', () => {
  let component: AlmcrepvalorizadoComponent;
  let fixture: ComponentFixture<AlmcrepvalorizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmcrepvalorizadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmcrepvalorizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
