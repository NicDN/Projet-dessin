import { TestBed } from '@angular/core/testing';

import { FillDripService } from './fill-drip.service';

describe('FillDripService', () => {
  let service: FillDripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FillDripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
