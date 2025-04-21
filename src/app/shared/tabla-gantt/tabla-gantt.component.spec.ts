import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaGanttComponent } from './tabla-gantt.component';

describe('TablaGanttComponent', () => {
  let component: TablaGanttComponent;
  let fixture: ComponentFixture<TablaGanttComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaGanttComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaGanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
