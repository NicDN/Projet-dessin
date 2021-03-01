import { TestBed } from '@angular/core/testing';
// import { DrawingService } from '@app/services/drawing/drawing.service';

import { UndoRedoService } from './undo-redo.service';

// tslint:disable: no-string-literal
describe('UndoRedoService', () => {
    let service: UndoRedoService;
    // let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);
        // drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should enable redo', () => {
        service['canUndoRedo'] = false;
        service.enableUndoRedo();
        expect(service['canUndoRedo']).toBeTrue();
    });

    it('should disable redo', () => {
        service['canUndoRedo'] = true;
        service.disableUndoRedo();
        expect(service['canUndoRedo']).toBeFalse();
    });
});
