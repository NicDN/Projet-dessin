import { TestBed } from '@angular/core/testing';

import { SprayCanService } from './spray-can.service';

describe('SprayCanService', () => {
  let service: SprayCanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SprayCanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
