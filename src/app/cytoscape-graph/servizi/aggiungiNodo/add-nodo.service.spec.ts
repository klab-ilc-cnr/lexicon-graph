import { TestBed } from '@angular/core/testing';

import { AddNodoService } from './add-nodo.service';

describe('AddNodoService', () => {
  let service: AddNodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddNodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
