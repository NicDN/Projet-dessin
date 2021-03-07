import { TestBed } from '@angular/core/testing';
import { SelectionTool } from './selection-tool';

describe('SelectionTool', () => {
    let service: SelectionTool;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionTool);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
