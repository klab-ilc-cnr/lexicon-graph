import { TestBed } from '@angular/core/testing';

import { InferencesService } from './inferences.service';

describe('InferencesService', () => {
  let service: InferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
