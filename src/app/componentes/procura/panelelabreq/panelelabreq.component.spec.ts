import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelelabreqComponent } from './panelelabreq.component';

describe('PanelelabreqComponent', () => {
  let component: PanelelabreqComponent;
  let fixture: ComponentFixture<PanelelabreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelelabreqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelelabreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
