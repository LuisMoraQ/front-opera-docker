import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmcpanelestadoComponent } from './almcpanelestado.component';

describe('AlmcpanelestadoComponent', () => {
  let component: AlmcpanelestadoComponent;
  let fixture: ComponentFixture<AlmcpanelestadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmcpanelestadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmcpanelestadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
