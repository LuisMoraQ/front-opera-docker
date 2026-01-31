import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElaborareqComponent } from './elaborareq.component';

describe('ElaborareqComponent', () => {
  let component: ElaborareqComponent;
  let fixture: ComponentFixture<ElaborareqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElaborareqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElaborareqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
