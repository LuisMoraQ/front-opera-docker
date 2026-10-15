import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetradoMensualComponent } from './metrado-mensual.component';

describe('MetradoMensualComponent', () => {
  let component: MetradoMensualComponent;
  let fixture: ComponentFixture<MetradoMensualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetradoMensualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetradoMensualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
