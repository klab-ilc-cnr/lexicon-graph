import { TestBed } from '@angular/core/testing';

import { GraphVisHttpCallService } from './graph-vis-http-call.service';

describe('GraphVisHttpCallService', () => {
  let service: GraphVisHttpCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphVisHttpCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
