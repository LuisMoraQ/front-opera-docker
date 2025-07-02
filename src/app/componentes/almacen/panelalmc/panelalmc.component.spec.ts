import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelalmcComponent } from './panelalmc.component';

describe('PanelalmcComponent', () => {
  let component: PanelalmcComponent;
  let fixture: ComponentFixture<PanelalmcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelalmcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelalmcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
