import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from './drawing.service';
import { TestBed } from '@angular/core/testing';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let boxSizeStub: BoxSize;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.selectionCanvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
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
        expect(service.checkIfCanvasEmpty()).toEqual(true);
        service.baseCtx.fillRect(0, 0, 1, 1);
        expect(service.checkIfCanvasEmpty()).toEqual(false);
    });

    it('should resize the width and height of a canvas', () => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        service.changeSizeOfCanvas(service.canvas, boxSizeStub);
        expect(service.canvas.width).toEqual(boxSizeStub.widthBox);
        expect(service.canvas.height).toEqual(boxSizeStub.heightBox);
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
