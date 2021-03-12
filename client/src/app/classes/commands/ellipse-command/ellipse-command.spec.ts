import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { EllipseCommand, EllipsePropreties } from '@app/classes/commands/ellipse-command/ellipse-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';

describe('ellipse-command', () => {
    let ellipseDrawingServiceSpyObj: jasmine.SpyObj<EllipseDrawingService>;
    let ellipseCommand: EllipseCommand;
    let ellipsePropreties: EllipsePropreties;
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
        ellipseDrawingServiceSpyObj = jasmine.createSpyObj(EllipseDrawingService, ['drawEllipse']);
        TestBed.configureTestingModule({
            providers: [{ provide: EllipseDrawingService, useValue: ellipseDrawingServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        ellipsePropreties = {
            drawingContext: canvasStubCtx,
            beginCoords: TOP_LEFT_CORNER_COORDS,
            endCoords: BOTTOM_RIGHT_CORNER_COORDS,
            drawingThickness: THICKNESS,
            mainColor: MAIN_COLOR,
            secondaryColor: SECONDARY_COLOR,
            isAlternateShape: IS_ALTERNATE_SHAPE,
            traceType: TRACE_TYPE,
        };
        ellipseCommand = new EllipseCommand(ellipseDrawingServiceSpyObj, ellipsePropreties);
    });

    it('#execute should call the draw function from ellipse', () => {
        ellipseCommand.execute();
        expect(ellipseDrawingServiceSpyObj.drawEllipse).toHaveBeenCalledWith(ellipsePropreties);
    });
});
