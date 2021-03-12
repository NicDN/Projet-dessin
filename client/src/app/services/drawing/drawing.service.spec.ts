import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeContainerComponent } from '@app/components/resize-container/resize-container.component';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let resizeContainerComponent: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;

    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let boxSizeStub: BoxSize;
    let drawingServiceSpyCheckIfEmpty: jasmine.Spy;
    let drawingServiceSpyReloadDrawing: jasmine.Spy;
    let drawingServiceSpyValidateInput: jasmine.Spy;
    let drawingServiceSpyChangeSizeOfCanvas: jasmine.Spy;
    let drawingServiceSpyClearCanvas: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.selectionCanvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const image = new Image();
        image.src = service.canvas.toDataURL();
        service.blankHTMLImage = image;

        drawingServiceSpyCheckIfEmpty = spyOn(service, 'canvasIsEmpty').and.callThrough();
        drawingServiceSpyReloadDrawing = spyOn(service, 'reloadToBlankDrawing').and.callThrough();
        drawingServiceSpyValidateInput = spyOn(service, 'confirmReload').and.callThrough();
        drawingServiceSpyChangeSizeOfCanvas = spyOn(service, 'changeSizeOfCanvas').and.callThrough();
        drawingServiceSpyClearCanvas = spyOn(service, 'clearCanvas').and.returnValue();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#clearCanvas should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should check if canvas is empty', () => {
        expect(service.canvasIsEmpty()).toEqual(true);
        service.baseCtx.fillRect(0, 0, 1, 1);
        expect(service.canvasIsEmpty()).toEqual(false);
    });

    it('#changeSizeOfCanvas should resize the width and height of a canvas', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        service.changeSizeOfCanvas(service.canvas, boxSizeStub);
        expect(service.canvas.width).toEqual(boxSizeStub.widthBox);
        expect(service.canvas.height).toEqual(boxSizeStub.heightBox);
    });

    it('#reloadToBlankDrawing should clear the canvas and have default height and width', () => {
        const drawingServiceSpyResetCanvas: jasmine.Spy = spyOn(service, 'resetCanvas').and.returnValue();
        spyOn(service, 'fillWithWhite').and.returnValue();
        spyOn(service, 'sendBaseLineCommand').and.returnValue();
        service.reloadToBlankDrawing();
        expect(drawingServiceSpyClearCanvas).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('#resetCanvas should call sendNotifReload saying the canvas is resizing', () => {
        const drawingServiceSpyResetCanvas: jasmine.Spy = spyOn(service, 'resetCanvas');
        service.resetCanvas();
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('#sendNotifReload should send a notification to the observer about the new drawing', () => {
        fixture = TestBed.createComponent(ResizeContainerComponent);
        resizeContainerComponent = fixture.componentInstance;
        fixture.detectChanges();
        const checkNotif: jasmine.Spy = spyOn(resizeContainerComponent, 'resizeNotification');
        const boxSize: BoxSize = { widthBox: -1, heightBox: -1 };
        service.sendNotifToResize(boxSize);
        expect(checkNotif).toHaveBeenCalled();
    });

    it('handleNewDrawing should reload the drawing which clears the drawing if the canvas is empty', () => {
        const emptyStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        service.handleNewDrawing();
        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).toHaveBeenCalled();
    });

    it('#handleNewDrawing should reload the drawing which clears the drawing if the canvas is not empty', () => {
        const emptyStub = false;
        const validateStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(validateStub);

        service.handleNewDrawing();

        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyValidateInput).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).toHaveBeenCalled();
    });

    it('#handleNewDrawing should reload the drawing which clears the drawing if the canvas is not empty', () => {
        const emptyStub = false;
        const cancelStub = false;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(cancelStub);

        service.handleNewDrawing();

        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyValidateInput).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).not.toHaveBeenCalled();
    });

    it('#validateUserInput should return the value of the window.confirm function', () => {
        const windowConfirmSpy = spyOn(window, 'confirm');
        windowConfirmSpy.and.returnValue(true);
        expect(service.confirmReload()).toEqual(true);

        windowConfirmSpy.and.returnValue(false);
        expect(service.confirmReload()).toEqual(false);
    });

    it('onSizeChange should make the canvas size change', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        service.onSizeChange(boxSizeStub);
        expect(drawingServiceSpyChangeSizeOfCanvas.and.stub()).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpyClearCanvas).toHaveBeenCalled();
    });
});
