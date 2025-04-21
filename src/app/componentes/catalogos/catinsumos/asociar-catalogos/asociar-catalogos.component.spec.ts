import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsociarCatalogosComponent } from './asociar-catalogos.component';

describe('AsociarCatalogosComponent', () => {
  let component: AsociarCatalogosComponent;
  let fixture: ComponentFixture<AsociarCatalogosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsociarCatalogosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsociarCatalogosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
