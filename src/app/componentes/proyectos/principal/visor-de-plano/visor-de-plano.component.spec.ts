import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorDePlanoComponent } from './visor-de-plano.component';

describe('VisorDePlanoComponent', () => {
  let component: VisorDePlanoComponent;
  let fixture: ComponentFixture<VisorDePlanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisorDePlanoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorDePlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
