import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelRecursosHumanosComponent } from './panel-recursos-humanos.component';

describe('PanelRecursosHumanosComponent', () => {
  let component: PanelRecursosHumanosComponent;
  let fixture: ComponentFixture<PanelRecursosHumanosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelRecursosHumanosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelRecursosHumanosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
