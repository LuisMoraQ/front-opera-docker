import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImgUrlComponent } from './add-img-url.component';

describe('AddImgUrlComponent', () => {
  let component: AddImgUrlComponent;
  let fixture: ComponentFixture<AddImgUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddImgUrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddImgUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
