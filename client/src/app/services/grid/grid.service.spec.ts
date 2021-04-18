import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of } from 'rxjs';
import { GridService } from './grid.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('GridService', () => {
    let service: GridService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    const boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };

    let canvasTestHelper: CanvasTestHelper;
    let gridContextStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newIncomingResizeSignals', 'newGridSignals', 'updateGrid']);
        // tslint:disable-next-line: prefer-const
        let emptyMessage: any;
        drawingServiceSpyObj.newGridSignals.and.returnValue(of(emptyMessage));
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });

        service = TestBed.inject(GridService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        gridContextStub = canvasTestHelper.gridCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].gridCanvas = canvasTestHelper.gridCanvas;
        service['drawingService'].gridCtx = gridContextStub;
        drawingServiceSpyObj.clearCanvas.and.returnValue();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#listenToResizeNotifications should receive a message from subscriber', () => {
        const newDrawingNotificationSpy = spyOn<any>(service, 'resizeGridNotification');
        service['listenToResizeNotifications']();
        drawingServiceSpyObj.updateGrid();
        expect(newDrawingNotificationSpy).toHaveBeenCalled();
    });

    it('#listenToUpdateGridNotification should receive a message from subscriber and draw the grid if it is switched on', () => {
        service.gridDrawn = true;
        const drawGridSpy = spyOn<any>(service, 'drawGrid');
        service['listenToUpdateGridNotification']();
        drawingServiceSpyObj.updateGrid();
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('#resizeGridNotification should resize the grid canvas to new drawing space dimensions and draw the grid if it is active', () => {
        service.gridDrawn = true;
        const drawGridSpy = spyOn<any>(service, 'drawGrid');
        service['resizeGridNotification'](boxSizeStub);
        expect(service['drawingService'].gridCanvas.width).toEqual(boxSizeStub.widthBox);
        expect(service['drawingService'].gridCanvas.height).toEqual(boxSizeStub.heightBox);
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('#resizeGridNotification should not draw the grid if it is not active', () => {
        service.gridDrawn = false;
        const drawGridSpy = spyOn<any>(service, 'drawGrid');
        service['resizeGridNotification'](boxSizeStub);
        expect(drawGridSpy).not.toHaveBeenCalled();
    });

    it('#handleDrawGrid should clear the grid canvas and switch it off if it is currently switched on and not draw the grid', () => {
        service.gridDrawn = true;
        const drawGridSpy = spyOn<any>(service, 'drawGrid');
        service.handleDrawGrid();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service.gridDrawn).toBeFalse();
        expect(drawGridSpy).not.toHaveBeenCalled();
    });

    it('#handleDrawGrid should clear the grid canvas and switch it on if it is currently switched off and draw the grid', () => {
        service.gridDrawn = false;
        const drawGridSpy = spyOn<any>(service, 'drawGrid');
        service.handleDrawGrid();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service.gridDrawn).toBeTrue();
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('#setGridContext should set the context of the grid so it is ready to draw', () => {
        const PERCENTAGE_CONVERTER = 100;
        const EXPECTED_OPACITY_PERCENTAGE = 50;
        service.opacity = EXPECTED_OPACITY_PERCENTAGE;
        service['setGridContext']();
        expect(gridContextStub.strokeStyle).toEqual('#000000');
        expect(gridContextStub.lineWidth).toEqual(1);
        expect(gridContextStub.globalAlpha).toEqual(EXPECTED_OPACITY_PERCENTAGE / PERCENTAGE_CONVERTER);
    });

    it('#incrementSquareSize should increment the square size if it is less than the maximum square size', () => {
        const CURRENT_SQUARE_SIZE = 22;
        const EXPECTED_SQUARE_SIZE = 25;
        service.squareSize = CURRENT_SQUARE_SIZE;
        service.incrementSquareSize();
        expect(service.squareSize).toEqual(EXPECTED_SQUARE_SIZE);
    });

    it('#incrementSquareSize should not increment the square size if it is more than the maximum square size', () => {
        const CURRENT_SQUARE_SIZE = 102;
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
        service['drawGrid']();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#drawGrid should draw the approriate number of lines', () => {
        const numberOfTimesMoveToShouldBeCalledStub = 42;
        const squareSizeStub = 5;
        const moveToSpy = spyOn(drawingServiceSpyObj.gridCtx, 'moveTo');
        service.squareSize = squareSizeStub;
        service['drawGrid']();
        expect(moveToSpy).toHaveBeenCalledTimes(numberOfTimesMoveToShouldBeCalledStub);
    });
});
