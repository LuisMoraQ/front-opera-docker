import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscartitsubtComponent } from './buscartitsubt.component';

describe('BuscartitsubtComponent', () => {
  let component: BuscartitsubtComponent;
  let fixture: ComponentFixture<BuscartitsubtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscartitsubtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscartitsubtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
