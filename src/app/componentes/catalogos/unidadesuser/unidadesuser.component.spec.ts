import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesuserComponent } from './unidadesuser.component';

describe('UnidadesuserComponent', () => {
  let component: UnidadesuserComponent;
  let fixture: ComponentFixture<UnidadesuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnidadesuserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidadesuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
