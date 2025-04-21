import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaAcerosComponent } from './tabla-aceros.component';

describe('TablaAcerosComponent', () => {
  let component: TablaAcerosComponent;
  let fixture: ComponentFixture<TablaAcerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaAcerosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaAcerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
