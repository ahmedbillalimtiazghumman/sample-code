import { TestBed } from '@angular/core/testing';

import { ApplicationDetailsResolver } from './application-details.resolver';

describe('ApplicationDetailsResolver', () => {
  let resolver: ApplicationDetailsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ApplicationDetailsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
