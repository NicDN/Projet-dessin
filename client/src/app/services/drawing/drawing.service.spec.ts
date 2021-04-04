import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeContainerComponent } from '@app/components/resize-container/resize-container.component';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { DrawingService } from './drawing.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('DrawingService', () => {
    let resizeContainerComponent: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;
    let undoRedoService: UndoRedoService;

    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let boxSizeStub: BoxSize;
    let drawingServiceSpyCheckIfEmpty: jasmine.Spy;
    let drawingServiceSpyReloadDrawing: jasmine.Spy;
    let drawingServiceSpyValidateInput: jasmine.Spy;
    let drawingServiceSpyClearCanvas: jasmine.Spy;
    let imageStub: HTMLImageElement;

    const snackBarServiceStub = {} as SnackBarService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
            providers: [{ provide: SnackBarService, useValue: snackBarServiceStub }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(DrawingService);
        undoRedoService = TestBed.inject(UndoRedoService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.selectionCanvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const image = new Image();
        image.src = service.canvas.toDataURL();
        service.blankHTMLImage = image;

        const nonEmptyimage = new Image();
        service.baseCtx.fillRect(0, 0, 1, 1);
        nonEmptyimage.src = service.canvas.toDataURL();
        imageStub = nonEmptyimage;
        service.baseCtx.clearRect(0, 0, 1, 1);

        drawingServiceSpyCheckIfEmpty = spyOn<any>(service, 'canvasIsEmpty').and.callThrough();
        drawingServiceSpyReloadDrawing = spyOn<any>(service, 'reloadToBlankDrawing').and.callThrough();
        drawingServiceSpyValidateInput = spyOn<any>(service, 'confirmReload').and.callThrough();
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
        expect(service['canvasIsEmpty']()).toEqual(true);
        service.baseCtx.fillRect(0, 0, 1, 1);
        expect(service['canvasIsEmpty']()).toEqual(false);
    });

    it('#changeSizeOfCanvas should resize the width and height of a canvas', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        service['changeSizeOfCanvas'](service.canvas, boxSizeStub);
        expect(service.canvas.width).toEqual(boxSizeStub.widthBox);
        expect(service.canvas.height).toEqual(boxSizeStub.heightBox);
    });

    it('#reloadToBlankDrawing should clear the canvas and have default height and width', () => {
        const drawingServiceSpyResetCanvas: jasmine.Spy = spyOn<any>(service, 'resetCanvas').and.returnValue(of());
        spyOn(service, 'fillWithWhite').and.returnValue();
        spyOn<any>(service, 'sendBaseLineCommand').and.returnValue(of());
        service['reloadToBlankDrawing']();
        expect(drawingServiceSpyClearCanvas).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('#resetCanvas should call sendNotifReload saying the canvas is resizing', () => {
        const drawingServiceSpyResetCanvas: jasmine.Spy = spyOn<any>(service, 'resetCanvas');
        service['resetCanvas']();
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('#sendBaseLineCommand should call the setBaseLineCommand from undoRedo', () => {
        const setBaseLineSpy = spyOn<any>(undoRedoService, 'setBaseLine');
        service['sendBaseLineCommand'](imageStub);
        expect(setBaseLineSpy).toHaveBeenCalled();
    });

    it('#changeDrawing should change the current drawing on canvas', () => {
        const fillTmpValue = 4;
        const image1 = new Image();
        service.baseCtx.fillRect(0, 0, fillTmpValue, fillTmpValue);
        image1.src = service.canvas.toDataURL();

        service['changeDrawing'](image1);
        expect(service.canvas.toDataURL()).toEqual(image1.src);
    });

    it('#change drawing should call the set base line method of undoRedoService', () => {
        const setBaseLineSpy = spyOn<any>(undoRedoService, 'setBaseLine');
        service['changeDrawing'](imageStub);
        expect(setBaseLineSpy).toHaveBeenCalled();
    });

    it('#executeBaseLine should not call drawImage if image is undefined', () => {
        const drawImageSpy = spyOn(service.baseCtx, 'drawImage');
        service.executeBaseLine(new Image());
        expect(drawImageSpy).not.toHaveBeenCalled();
    });

    it('#sendNotifReload should send a notification to the observer about the new drawing', () => {
        fixture = TestBed.createComponent(ResizeContainerComponent);
        resizeContainerComponent = fixture.componentInstance;
        fixture.detectChanges();
        const checkNotif: jasmine.Spy = spyOn<any>(resizeContainerComponent, 'resizeNotification');
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

    it('#handleNewDrawing should call changeDrawing if there is an image and the canvas is not empty', () => {
        const emptyStub = false;
        const cancelStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(cancelStub);
        const changeDrawingSpy = spyOn<any>(service, 'changeDrawing');

        service.handleNewDrawing(imageStub);

        expect(changeDrawingSpy).toHaveBeenCalledWith(imageStub);
    });

    it('#handleNewDrawing should call changeDrawing if there is an image and the canvas is empty', () => {
        const emptyStub = true;
        const cancelStub = false;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(cancelStub);
        const changeDrawingSpy = spyOn<any>(service, 'changeDrawing');

        service.handleNewDrawing(imageStub);

        expect(changeDrawingSpy).toHaveBeenCalledWith(imageStub);
    });

    it('#validateUserInput should return the value of the window.confirm function', () => {
        const windowConfirmSpy = spyOn(window, 'confirm');
        windowConfirmSpy.and.returnValue(true);
        expect(service['confirmReload']()).toEqual(true);

        windowConfirmSpy.and.returnValue(false);
        expect(service['confirmReload']()).toEqual(false);
    });

    it('#onSizeChange should change the size of canvas correctly id isStamp is false', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        const swapDrawingsSpy = spyOn<any>(service, 'swapDrawings');
        const putImageDataSpy = spyOn(service.previewCtx, 'putImageData');
        service.onSizeChange(boxSizeStub);
        expect(swapDrawingsSpy).toHaveBeenCalledWith(boxSizeStub);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('#onSizeChange should call #swapDrawings if isStamp is true', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        const swapDrawingsSpy = spyOn<any>(service, 'swapDrawings');
        service.isStamp = true;
        service.onSizeChange(boxSizeStub);
        expect(swapDrawingsSpy).toHaveBeenCalledWith(boxSizeStub);
    });

    it('#fillWithWhite should fill the context with white', () => {
        const WHITE_VALUE = 255;
        service.fillWithWhite(service.baseCtx);
        const imageData = service.baseCtx.getImageData(0, 0, 1, 1);
        expect(imageData.data).toEqual(Uint8ClampedArray.of(WHITE_VALUE, WHITE_VALUE, WHITE_VALUE, WHITE_VALUE));
    });

    it('#canvasIsEmpty should return true if the canvas is empty', () => {
        expect(service['canvasIsEmpty']()).toBeTrue();
    });

    it('#canvasIsEmpty should return false if the canvas is not empty', () => {
        service.baseCtx.fillRect(0, 0, 1, 1);
        expect(service['canvasIsEmpty']()).toBeFalse();
    });

    it('#swapDrawings should call #changeSizeOfCanvas', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        const changeSizeOfCanvasSpy = spyOn<any>(service, 'changeSizeOfCanvas');
        service['swapDrawings'](boxSizeStub);
        expect(changeSizeOfCanvasSpy).toHaveBeenCalledTimes(2);
    });
});
