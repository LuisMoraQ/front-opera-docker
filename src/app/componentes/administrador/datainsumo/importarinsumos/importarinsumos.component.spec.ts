import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarinsumosComponent } from './importarinsumos.component';

describe('ImportarinsumosComponent', () => {
  let component: ImportarinsumosComponent;
  let fixture: ComponentFixture<ImportarinsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportarinsumosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarinsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
