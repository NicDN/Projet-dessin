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
    // tslint:disable-next-line: no-any
    let drawingServiceSpyCheckIfEmpty: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let drawingServiceSpyReloadDrawing: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let drawingServiceSpyValidateInput: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.selectionCanvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable-next-line: no-any
        drawingServiceSpyCheckIfEmpty = spyOn<any>(service, 'canvasIsEmpty').and.callThrough();
        // tslint:disable-next-line: no-any
        drawingServiceSpyReloadDrawing = spyOn<any>(service, 'reloadDrawing').and.callThrough();
        // tslint:disable-next-line: no-any
        drawingServiceSpyValidateInput = spyOn<any>(service, 'confirmReload').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
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

    it('should resize the width and height of a canvas', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        service.changeSizeOfCanvas(service.canvas, boxSizeStub);
        expect(service.canvas.width).toEqual(boxSizeStub.widthBox);
        expect(service.canvas.height).toEqual(boxSizeStub.heightBox);
    });

    it('should clear the canvas and reset it', () => {
        // tslint:disable-next-line: no-any
        const drawingServiceSpyClearCanvas: jasmine.Spy<any> = spyOn<any>(service, 'clearCanvas').and.callThrough();
        // tslint:disable-next-line: no-any
        const drawingServiceSpyResetCanvas: jasmine.Spy<any> = spyOn<any>(service, 'resetCanvas').and.callThrough();
        service.reloadDrawing();
        expect(drawingServiceSpyClearCanvas).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('should send a notification relaod saying the canvas is resizing', () => {
        // tslint:disable-next-line: no-any ******
        const drawingServiceSpyResetCanvas: jasmine.Spy<any> = spyOn<any>(service, 'resetCanvas').and.callThrough();
        service.resetCanvas();
        expect(drawingServiceSpyResetCanvas).toHaveBeenCalled();
    });

    it('should send a notification to the observer about the new drawing', () => {
        fixture = TestBed.createComponent(ResizeContainerComponent); // ****
        resizeContainerComponent = fixture.componentInstance;
        fixture.detectChanges();
        // tslint:disable-next-line: no-any
        const checkNotif: jasmine.Spy<any> = spyOn<any>(resizeContainerComponent, 'newDrawingNotification');
        service.sendNotifReload('A message');
        expect(checkNotif).toHaveBeenCalled();
    });

    it('should reload the drawing which clears the drawing if the canvas is empty', () => {
        const emptyStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        service.handleNewDrawing();
        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).toHaveBeenCalled();
    });

    it('should reload the drawing which clears the drawing if the canvas is not empty', () => {
        const emptyStub = false;
        const validateStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(validateStub);

        service.handleNewDrawing();

        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyValidateInput).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).toHaveBeenCalled();
    });

    it('should not reload the drawing if user decided not to create a new drawing and vice-versa', () => {
        const emptyStub = false;
        const cancelStub = false;
        const okStub = true;
        drawingServiceSpyCheckIfEmpty.and.returnValue(emptyStub);
        drawingServiceSpyValidateInput.and.returnValue(cancelStub);

        service.handleNewDrawing();

        expect(drawingServiceSpyCheckIfEmpty).toHaveBeenCalled();
        expect(drawingServiceSpyValidateInput).toHaveBeenCalled();
        expect(drawingServiceSpyReloadDrawing).not.toHaveBeenCalled();

        drawingServiceSpyValidateInput.and.returnValue(okStub);
        service.handleNewDrawing();
        expect(drawingServiceSpyReloadDrawing).toHaveBeenCalled();
    });

    // it('should be identical if the canvas is enlarged', () => {
    //     service.baseCtx.fillRect(0, 0, 1, 1);
    //     const oldImgData = service.baseCtx.getImageData(0, 0, 5, 5);
    //     const NEW_SIZE = 150;
    //     service.onSizeChange({ widthBox: NEW_SIZE, heightBox: NEW_SIZE });
    //     const newImgData = service.baseCtx.getImageData(0, 0, 5, 5);
    //     let unBool: boolean = true;
    //     for (let i = 0; i < 12; i += 1) {
    //         if (newImgData.data[i] !== oldImgData.data[i]) {
    //             unBool = false;
    //         }
    //     }
    //     expect(unBool).toEqual(true);
    //     // expect(newImgData.data.length).toEqual(oldImgData.data.length);
    // }); // To be continued
});
