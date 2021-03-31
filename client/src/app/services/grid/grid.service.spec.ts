import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ResizeContainerComponent } from '@app/components/resize-container/resize-container.component';
import { of } from 'rxjs';
import { DrawingService } from '../drawing/drawing.service';
import { GridService } from './grid.service';

fdescribe('GridService', () => {
    let service: GridService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    let boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let gridContextStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newIncomingResizeSignals', 'newGridSignals']);
        drawingServiceSpyObj.newGridSignals.and.returnValue(of());
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));

        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        gridContextStub = canvasTestHelper.gridCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(GridService);

        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].previewCanvas = canvasTestHelper.drawCanvas;
        service['drawingService'].gridCanvas = canvasTestHelper.gridCanvas;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].gridCtx = gridContextStub;

        service['drawingService'].gridCanvas.height = 25;
        service['drawingService'].gridCanvas.width = 25;

        drawingServiceSpyObj.clearCanvas.and.returnValue();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setGridContext should set the context of the grid so it is ready to draw', () => {
        const EXPECTED_OPACITY_PERCENTAGE = 50;
        service.opacity = EXPECTED_OPACITY_PERCENTAGE;
        service['setGridContext']();
        expect(gridContextStub.strokeStyle).toEqual('#000000');
        expect(gridContextStub.lineWidth).toEqual(1);
        expect(gridContextStub.globalAlpha).toEqual(EXPECTED_OPACITY_PERCENTAGE / 100);
    });

    it('#incrementSquareSize should increment the square size if it is less than the maximum square size', () => {
        const CURRENT_SQUARE_SIZE = 22;
        const EXPECTED_SQUARE_SIZE = 25;
        service.squareSize = CURRENT_SQUARE_SIZE;
        service.incrementSquareSize();
        expect(service.squareSize).toEqual(EXPECTED_SQUARE_SIZE);
    });

    it('#incrementSquareSize should not increment the square size if it is more than the maximum square size', () => {
        const CURRENT_SQUARE_SIZE = 42;
        service.squareSize = CURRENT_SQUARE_SIZE;
        service.incrementSquareSize();
        expect(service.squareSize).toEqual(CURRENT_SQUARE_SIZE);
    });

    it('#decrementSquareSize should decrement the square size if it is more than the minimum square size', () => {
        const CURRENT_SQUARE_SIZE = 28;
        const EXPECTED_SQUARE_SIZE = 25;
        service.squareSize = CURRENT_SQUARE_SIZE;
        service.decrementSquareSize();
        expect(service.squareSize).toEqual(EXPECTED_SQUARE_SIZE);
    });

    it('#decrementSquareSize should not decrement the square size if it is less than the minimum square size', () => {
        const CURRENT_SQUARE_SIZE = 18;
        service.squareSize = CURRENT_SQUARE_SIZE;
        service.decrementSquareSize();
        expect(service.squareSize).toEqual(CURRENT_SQUARE_SIZE);
    });

    it('#drawGrid should clear the canvas before begining to draw', () => {
        drawingServiceSpyObj.gridCanvas.height = 25;
        drawingServiceSpyObj.gridCanvas.width = 25;
        service.drawGrid();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#drawGrid should draw the approriate number of lines', () => {
        const numberOfTimesMoveToShouldBeCalledStub = 12;
        const moveToSpy = spyOn(drawingServiceSpyObj.gridCtx, 'moveTo');
        service.squareSize = 5;
        drawingServiceSpyObj.gridCanvas.height = 25;
        drawingServiceSpyObj.gridCanvas.width = 25;
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(numberOfTimesMoveToShouldBeCalledStub);
    });
});
