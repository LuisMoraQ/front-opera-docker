import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmcsalidaComponent } from './almcsalida.component';

describe('AlmcsalidaComponent', () => {
  let component: AlmcsalidaComponent;
  let fixture: ComponentFixture<AlmcsalidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmcsalidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmcsalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
