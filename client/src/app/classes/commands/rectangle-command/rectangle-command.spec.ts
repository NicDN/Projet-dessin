import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { RectangleCommand, RectanglePropreties } from '@app/classes/commands/rectangle-command/rectangle-command';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { TraceType } from '@app/classes/shape';
import { Color } from '@app/classes/color';

fdescribe('ellipse-command', () => {
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let rectangleCommand: RectangleCommand;
    let rectanglePropreties: RectanglePropreties;
    let canvasStub: CanvasTestHelper;
    let canvasStubCtx: CanvasRenderingContext2D;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const THICKNESS = 1;
    const MAIN_COLOR: Color = { rgbValue: 'red', opacity: 1 };
    const SECONDARY_COLOR: Color = { rgbValue: 'red', opacity: 1 };
    const IS_ALTERNATE_SHAPE = true;
    const TRACE_TYPE = TraceType.Bordered;

    beforeEach(() => {
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj(RectangleDrawingService, ['drawRectangle']);
        TestBed.configureTestingModule({
            providers: [{ provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        rectanglePropreties = {
            drawingCtx: canvasStubCtx,
            beginCoords: TOP_LEFT_CORNER_COORDS,
            endCoords: BOTTOM_RIGHT_CORNER_COORDS,
            drawingThickness: THICKNESS,
            mainColor: MAIN_COLOR,
            secondaryColor: SECONDARY_COLOR,
            isAlternateShape: IS_ALTERNATE_SHAPE,
            traceType: TRACE_TYPE,
        };
        rectangleCommand = new RectangleCommand(rectangleDrawingServiceSpyObj, rectanglePropreties);
    });

    it('#execute should call the draw function from ellipse', () => {
        rectangleCommand.execute();
        expect(rectangleDrawingServiceSpyObj.drawRectangle).toHaveBeenCalledWith(rectanglePropreties);
    });
});
