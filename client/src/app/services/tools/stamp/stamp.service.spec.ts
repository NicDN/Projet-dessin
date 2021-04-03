import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StampPropreties } from '@app/classes/commands/stamp-command/stamp-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

import { StampService } from './stamp.service';

// tslint:disable: no-string-literal no-any
describe('StampService', () => {
    let service: StampService;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    const mouseEvent = {} as MouseEvent;

    const baseCanvasMock = document.createElement('canvas');
    const previewCanvasMock = document.createElement('canvas');

    const baseCanvasRef: ElementRef<HTMLCanvasElement> = {
        nativeElement: baseCanvasMock,
    };

    const previewCanvasRef: ElementRef<HTMLCanvasElement> = {
        nativeElement: previewCanvasMock,
    };

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas'], {
            baseCtx: baseCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            previewCtx: previewCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
        });
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
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
        spyOn<any>(service, 'displayPreview');
        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service['displayPreview']).toHaveBeenCalledWith(mouseEvent);
    });

    it('#displayPreview should call #registerStampCommand with the preview context', () => {
        spyOn<any>(service, 'registerStampCommand');
        service['displayPreview'](mouseEvent);
        expect(service['registerStampCommand']).toHaveBeenCalledWith(mouseEvent, drawingServiceSpyObj.previewCtx);
    });

    it('#onMouseDown should call #registerStampCommand with the base context', () => {
        spyOn<any>(service, 'registerStampCommand');
        service.onMouseDown(mouseEvent);
        expect(service['registerStampCommand']).toHaveBeenCalledWith(mouseEvent, drawingServiceSpyObj.baseCtx);
    });

    it('#registerStampCommand should add a stamp command if the provided context is the base context', () => {
        service['registerStampCommand'](mouseEvent, drawingServiceSpyObj.baseCtx);
        expect(service['undoRedoService'].addCommand).toHaveBeenCalled();
    });

    it('#registerStampCommand should not add a stamp command if the provided context is the preview context', () => {
        service['registerStampCommand'](mouseEvent, drawingServiceSpyObj.previewCtx);
        expect(service['undoRedoService'].addCommand).not.toHaveBeenCalled();
    });

    it('#drawStampOnCanvas should draw the stamp correctly', () => {
        const saveSpy = spyOn(drawingServiceSpyObj.baseCtx, 'save');
        const translateSpy = spyOn(drawingServiceSpyObj.baseCtx, 'translate');
        const rotateSpy = spyOn(drawingServiceSpyObj.baseCtx, 'rotate');
        const drawImageSpy = spyOn(drawingServiceSpyObj.baseCtx, 'drawImage');
        const restoreSpy = spyOn(drawingServiceSpyObj.baseCtx, 'restore');

        const stampPropreties: StampPropreties = {
            drawingContext: drawingServiceSpyObj.baseCtx,
            currentCoords: service.getPositionFromMouse(mouseEvent),
            selectedStampIndex: 0,
            angle: 0,
            scaling: 100,
        };

        service.drawStampOnCanvas(stampPropreties);

        expect(saveSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalledWith(stampPropreties.currentCoords.x, stampPropreties.currentCoords.y);
        expect(rotateSpy).toHaveBeenCalledWith(stampPropreties.angle);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });

    it('#loadUpPropreties should set the current stamp properties to be stored in a command', () => {
        const SCALING_DENOMINATOR = 100;
        service.selectedStampSrc = service.stamps[1];
        const stampProperies: StampPropreties = service['loadUpPropreties'](drawingServiceSpyObj.baseCtx, mouseEvent);

        expect(stampProperies.drawingContext).toEqual(drawingServiceSpyObj.baseCtx);
        expect(stampProperies.currentCoords).toEqual(service.getPositionFromMouse(mouseEvent));
        expect(stampProperies.selectedStampIndex).toEqual(1);
        expect(stampProperies.angle).toEqual(service.angle);
        expect(stampProperies.scaling).toEqual(service.scaling / SCALING_DENOMINATOR);
    });

    it('#rotateStamp should increment the wheelScrollAngleDegree if the deltaY attribute of WheelEvent is above 0', () => {
        const EXPECTED_WHEEL_SCROLL_VALUE = service['DEFAULT_SCROLL_ANGLE_CHANGE'];
        const wheelEvent: WheelEvent = { deltaY: 1 } as WheelEvent;
        service.rotateStamp(wheelEvent);
        expect(service['wheelScrollAngleDegree']).toEqual(EXPECTED_WHEEL_SCROLL_VALUE);
    });

    it('#rotateStamp should set the wheelScrollAngleDegree value to a reversed angle value if the deltaY attribute of WheelEvent is under 0', () => {
        const EXPECTED_WHEEL_SCROLL_VALUE = service['ANGLE_MAX_VALUE'] - Math.abs(-service['DEFAULT_SCROLL_ANGLE_CHANGE']);
        const wheelEvent: WheelEvent = { deltaY: -1 } as WheelEvent;
        service.rotateStamp(wheelEvent);
        expect(service['wheelScrollAngleDegree']).toEqual(EXPECTED_WHEEL_SCROLL_VALUE);
    });

    it('#rotateStamp should reset the wheelScrollAngleDegree to a valid degree value if wheelScrollAngleDegree exceed the ANGLE_MAX_VALUE', () => {
        const wheelEvent: WheelEvent = { deltaY: 1 } as WheelEvent;
        service['wheelScrollAngleDegree'] = service['ANGLE_MAX_VALUE'];
        service.rotateStamp(wheelEvent);
        const wheelScrollAngleDegreeExpected = service['ANGLE_MAX_VALUE'] + service['angleIncrement'] - service['ANGLE_MAX_VALUE'];
        expect(service['wheelScrollAngleDegree']).toEqual(wheelScrollAngleDegreeExpected);
    });

    it('#rotateStamp should set the angle in radians correctly', () => {
        const wheelEvent: WheelEvent = { deltaY: 1 } as WheelEvent;
        service.rotateStamp(wheelEvent);
        expect(service.angle).toEqual((service['DEFAULT_SCROLL_ANGLE_CHANGE'] * Math.PI) / service['RADIAN_DEGREE_RATIO']);
    });

    it('#rotateStamp should call #registerStampCommand', () => {
        const wheelEvent: WheelEvent = { deltaY: 1 } as WheelEvent;
        spyOn<any>(service, 'registerStampCommand');
        service.rotateStamp(wheelEvent);
        expect(service['registerStampCommand']).toHaveBeenCalledWith(wheelEvent, drawingServiceSpyObj.previewCtx);
    });

    it('#onKeyDown should set the angleIncrement value to the ALT_SCROLL_ANGLE_CHANGE value if altKey is pressed', () => {
        const keyboardEvent = { altKey: true } as KeyboardEvent;
        service.onKeyDown(keyboardEvent);
        expect(service['angleIncrement']).toEqual(service['ALT_SCROLL_ANGLE_CHANGE']);
    });

    it('#onKeyDown should not set the angleIncrement value to the ALT_SCROLL_ANGLE_CHANGE value if altKey is not pressed', () => {
        const keyboardEvent = { altKey: false } as KeyboardEvent;
        service.onKeyDown(keyboardEvent);
        expect(service['angleIncrement']).toEqual(service['DEFAULT_SCROLL_ANGLE_CHANGE']);
    });

    it('#onKeyUp should set the angleIncrement value to DEFAULT_SCROLL_ANGLE_CHANGE', () => {
        service['angleIncrement'] = 0;
        service.onKeyUp();
        expect(service['angleIncrement']).toEqual(service['DEFAULT_SCROLL_ANGLE_CHANGE']);
    });
});
