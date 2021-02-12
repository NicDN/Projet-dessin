import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
// import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

fdescribe('EraserService', () => {
    let service: EraserService;
    // let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    // let previewCtxStub: CanvasRenderingContext2D;

    const point1: Vec2 = { x: 0, y: 0 };
    const point2: Vec2 = { x: 3, y: 4 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EraserService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        // previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        // service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        // service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('distanceBetween should return the distance between 2 points', () => {
        const expectedValue = 5;
        expect(service.distanceBetween(point1, point2)).toEqual(expectedValue);
    });

    it('angleBetween should return the angle between 2 points', () => {
        const expectedValue = 0.6435011087932844;
        expect(service.angleBetween(point1, point2)).toEqual(expectedValue);
    });

    it('setCanvasContextForErasing should set the canvas property to make it ready for erasing', () => {
        service.setCanvasContextForErasing(baseCtxStub);
        expect(baseCtxStub.lineCap).toEqual('square');
        expect(baseCtxStub.lineJoin).toEqual('miter');
        expect(baseCtxStub.globalAlpha).toEqual(1);
        expect(baseCtxStub.globalCompositeOperation).toEqual('destination-out');
    });

    it('setCanvasContextForOtherTools should set the canvas for other tools when the eraser is done being used', () => {
        service.setCanvasContextForOtherTools(baseCtxStub);
        expect(baseCtxStub.globalCompositeOperation).toEqual('source-over');
    });

    it('verifThickness should set and check the eraser writing thickness on the canvas', () => {
        const thicknessStubValue = 10;
        service.verifThickness(baseCtxStub, thicknessStubValue);
        expect(baseCtxStub.lineWidth).toEqual(thicknessStubValue);

        const underMinThickness = 2;
        service.verifThickness(baseCtxStub, underMinThickness);
        expect(baseCtxStub.lineWidth).toEqual(service.MINTHICKNESS);
    });

    it('singleClick should return if there is a single click', () => {
        const path1 = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        expect(service.singleClick(path1)).toEqual(true);

        const path2 = [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
        ];
        expect(service.singleClick(path2)).toEqual(false);
    });

    it('EraseSquare should erase part off the context', () => {
        baseCtxStub.beginPath();
        baseCtxStub.rect(0, 0, 5, 5);
        baseCtxStub.fill();
        baseCtxStub.stroke();
        baseCtxStub.lineCap = 'square';
        baseCtxStub.lineJoin = 'miter';
        baseCtxStub.globalAlpha = 1;
        baseCtxStub.globalCompositeOperation = 'destination-out';

        service.thickness = 50;
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[3]).toEqual(0);
        // expect(imageData.data[1]).toEqual(0);
        // expect(imageData.data[2]).toEqual(0);
        // expect(imageData.data[3]).toEqual(0);
    });
});
