import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { Shape } from './shape';
import { MouseButton } from './tool';

export class FakeShape extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Fake');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        return;
    }
}

// tslint:disable: no-string-literal
describe('Shape', () => {
    let shape: FakeShape;
    // let drawSpy: jasmine.Spy;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const colorStub = 'blue';
    const opacityStub = 0.4;
    const topLeftCorner: Vec2 = { x: 0, y: 0 };
    const bottomRightCorner: Vec2 = { x: 40, y: 20 };
    const bottomLeftCorner: Vec2 = { x: 0, y: 20 };
    const topRightCorner: Vec2 = { x: 40, y: 0 };

    beforeEach(() => {
        const colorSpy = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: colorStub, opacity: opacityStub },
            secondaryColor: { rgbValue: colorStub, opacity: opacityStub },
        });
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        shape = new FakeShape(drawServiceSpy, colorServiceSpy);
        colorServiceSpy = TestBed.inject(ColorService) as jasmine.SpyObj<ColorService>;

        shape['drawingService'].baseCtx = baseCtxStub;
        shape['drawingService'].previewCtx = previewCtxStub;

        colorServiceSpy.mainColor.rgbValue = colorStub;
        colorServiceSpy.mainColor.opacity = opacityStub;

        colorServiceSpy.secondaryColor.rgbValue = colorStub;
        colorServiceSpy.secondaryColor.opacity = opacityStub;
        mouseEvent = {
            pageX: 430,
            pageY: 27,
            button: 0,
            buttons: 1,
        } as MouseEvent;
    });

    it('#setFillColor should change the right ctx parameters', () => {
        shape.setFillColor(drawServiceSpy.baseCtx, colorServiceSpy.mainColor);
        expect(drawServiceSpy.baseCtx.fillStyle).toEqual('#0000ff');
        expect(drawServiceSpy.baseCtx.globalAlpha).toEqual(opacityStub);
    });

    it('#setStrokeColor should change the right ctx parameters', () => {
        shape.setStrokeColor(drawServiceSpy.baseCtx, colorServiceSpy.mainColor);
        expect(drawServiceSpy.baseCtx.strokeStyle).toEqual('#0000ff');
        expect(drawServiceSpy.baseCtx.globalAlpha).toEqual(opacityStub);
    });

    it('#getActualEndCoords should return same end coords if not using alternate shape', () => {
        // tslint:disable-next-line: no-string-literal
        shape['alternateShape'] = false;
        expect(shape.getActualEndCoords(topLeftCorner, bottomRightCorner)).toEqual(bottomRightCorner);
        expect(shape.getActualEndCoords(bottomRightCorner, topLeftCorner)).toEqual(topLeftCorner);
        expect(shape.getActualEndCoords(bottomLeftCorner, topRightCorner)).toEqual(topRightCorner);
        expect(shape.getActualEndCoords(topRightCorner, bottomLeftCorner)).toEqual(bottomLeftCorner);
    });

    it('#getActualEndCoords should return coords of square if using alternate shape', () => {
        // tslint:disable-next-line: no-string-literal
        shape['alternateShape'] = true;
        expect(shape.getActualEndCoords(topLeftCorner, bottomRightCorner)).toEqual({ x: 20, y: 20 });
        expect(shape.getActualEndCoords(bottomRightCorner, topLeftCorner)).toEqual({ x: 20, y: 0 });
        expect(shape.getActualEndCoords(bottomLeftCorner, topRightCorner)).toEqual({ x: 20, y: 0 });
        expect(shape.getActualEndCoords(topRightCorner, bottomLeftCorner)).toEqual({ x: 20, y: 20 });
    });

    it('#onMouseDown should set the begin and end coords correctly', () => {
        shape.onMouseDown(mouseEvent);

        expect(shape['beginCoord']).toEqual({ x: 25, y: 25 });
        expect(shape['endCoord']).toEqual(shape['beginCoord']);
    });

    it('#onMouseDown should set the mouseDown property to true if left click', () => {
        shape.onMouseDown(mouseEvent);
        expect(shape.mouseDown).toBeTrue();
    });

    it('#onMouseDown should not set the mouseDown property to true if right click', () => {
        const mouseEventRClick = {
            pageX: 430,
            pageY: 27,
            button: MouseButton.Right,
        } as MouseEvent;
        shape.onMouseDown(mouseEventRClick);
        expect(shape.mouseDown).toEqual(false);
    });

    it('#onMouseMove should call drawPreview', () => {
        const drawPreviewSpy = spyOn(shape, 'drawPreview');

        shape.mouseDown = true;
        shape.mouseDownCoord = { x: 0, y: 0 };

        shape.onMouseMove(mouseEvent);
        expect(drawPreviewSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should set endCoords correctly', () => {
        const drawPreviewSpy = spyOn(shape, 'drawPreview');
        drawPreviewSpy.and.stub();
        shape.mouseDown = true;
        shape.mouseDownCoord = { x: 0, y: 0 };

        shape.onMouseMove(mouseEvent);
        expect(shape['endCoord']).toEqual({ x: 25, y: 25 });
    });

    it('#onMouseMove should set mouseDown to false if not pressing leftClick (edge case, necessary)', () => {
        shape.mouseDown = true;
        shape.mouseDownCoord = { x: 0, y: 0 };
        const mouseEventMove = {
            pageX: 430,
            pageY: 27,
        } as MouseEvent;
        shape.onMouseMove(mouseEventMove);
        expect(shape.mouseDown).toBeFalse();
    });

    it('#onMouseUp should draw on base context and clear preview context', () => {
        const drawSpy = spyOn(shape, 'draw');
        shape.mouseDown = true;

        shape.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('#onMouseUp should not draw on base context nor clear preview context if mouseDown is not true (edge case, necessary)', () => {
        const drawSpy = spyOn(shape, 'draw');
        shape.mouseDown = false;

        shape.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('#onMouseUp should set mouseDown to false', () => {
        shape.mouseDown = true;

        shape.onMouseUp(mouseEvent);
        expect(shape.mouseDown).toBeFalse();
    });

    it('#onKeyDown should set alternateShape to true if leftshift pressed', () => {
        const leftShiftEvent = {
            code: 'ShiftLeft',
        } as KeyboardEvent;
        shape.onKeyDown(leftShiftEvent);
        expect(shape['alternateShape']).toBeTrue();
    });

    it('#onKeyDown should not set alternateShape to true if other key than leftshift pressed', () => {
        const leftShiftEvent = {
            code: 'A',
        } as KeyboardEvent;
        shape['alternateShape'] = false;
        shape.onKeyDown(leftShiftEvent);
        expect(shape['alternateShape']).toBeFalse();
    });

    it('#onKeyDown should draw the preview if mouseDown is true', () => {
        const drawPreviewSpy = spyOn(shape, 'drawPreview');
        const leftShiftEvent = {
            code: 'ShiftLeft',
        } as KeyboardEvent;
        shape.mouseDown = true;
        shape.onKeyDown(leftShiftEvent);
        expect(drawPreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should set alternateShape to false if leftshift depressed', () => {
        const leftShiftEvent = {
            code: 'ShiftLeft',
        } as KeyboardEvent;
        shape['alternateShape'] = true;
        shape.onKeyUp(leftShiftEvent);
        expect(shape['alternateShape']).toBeFalse();
    });

    it('#onKeyUp should not set alternateShape to false if other key than leftshift is depressed', () => {
        const leftShiftEvent = {
            code: 'A',
        } as KeyboardEvent;
        shape['alternateShape'] = true;
        shape.onKeyUp(leftShiftEvent);
        expect(shape['alternateShape']).toBeTrue();
    });

    it('#onKeyUp should draw the preview if mouseDown is true', () => {
        const drawPreviewSpy = spyOn(shape, 'drawPreview');
        const leftShiftEvent = {
            code: 'ShiftLeft',
        } as KeyboardEvent;
        shape.mouseDown = true;
        shape.onKeyUp(leftShiftEvent);
        expect(drawPreviewSpy).toHaveBeenCalled();
    });

    it('#drawPerimeter should draw a dotted line rectangle', () => {
        const previewStub = jasmine.createSpyObj('CanvasRenderingContext2D', ['setLineDash', 'rect', 'stroke', 'beginPath']);

        shape.drawPerimeter(previewStub, topLeftCorner, bottomRightCorner);
        expect(previewStub.beginPath).toHaveBeenCalled();
        expect(previewStub.setLineDash).toHaveBeenCalled();
        expect(previewStub.rect).toHaveBeenCalled();
        expect(previewStub.stroke).toHaveBeenCalled();
    });

    it('#drawPreview should clear the canvas, draw the perimeter and draw the shape on the canvas', () => {
        const drawPerimeterSpy = spyOn(shape, 'drawPerimeter');
        const drawSpy = spyOn(shape, 'draw');
        shape.drawPreview();
        expect(drawPerimeterSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(drawSpy).toHaveBeenCalledWith(previewCtxStub, shape.mouseDownCoord, shape['endCoord']);
    });
});
