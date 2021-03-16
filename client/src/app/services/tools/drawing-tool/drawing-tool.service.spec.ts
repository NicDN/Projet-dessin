import { TestBed } from '@angular/core/testing';

import { DrawingToolService } from './drawing-tool.service';

describe('DrawingToolService', () => {
  let service: DrawingToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
