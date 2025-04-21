import { TestBed } from '@angular/core/testing';

import { MainiterceptorInterceptor } from './mainiterceptor.interceptor';

describe('MainiterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MainiterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: MainiterceptorInterceptor = TestBed.inject(MainiterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
