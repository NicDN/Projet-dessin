import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

import { StampService } from './stamp.service';

// tslint:disable: no-string-literal no-any
fdescribe('StampService', () => {
    let service: StampService;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
            ],
        });
        service = TestBed.inject(StampService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#loadStamps should load stamps correctly', () => {
        service['loadStamps']();

        for (let i = 0; i < service.stamps.length; i++) {
            const expectedImage: HTMLImageElement = new Image();
            expectedImage.src = service.stamps[i];
            expect(service['stampsData'][i]).toEqual(expectedImage);
        }
    });

    it('#onMouseMove should clear the preview context and display the preview of the stamp', () => {
        const mouseEvent = {} as MouseEvent;
        spyOn<any>(service, 'displayPreview');
        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service['displayPreview']).toHaveBeenCalledWith(mouseEvent);
    });
});
