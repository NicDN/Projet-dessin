import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { LineCommand, LinePropreties } from '@app/classes/commands/line-command/line-command';
import { Vec2 } from '@app/classes/vec2';
import { LineService } from '@app/services/tools/line/line.service';

describe('line-command', () => {
    let lineServiceSpyObj: jasmine.SpyObj<LineService>;
    let lineCommand: LineCommand;
    let linePropreties: LinePropreties;
    let canvasStub: CanvasTestHelper;
    let canvasStubCtx: CanvasRenderingContext2D;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const DRAWING_PATH: Vec2[] = [TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS];
    const THICKNESS = 1;
    const MAIN_COLOR: Color = { rgbValue: 'red', opacity: 1 };
    const DRAW_WITH_JUNCTION_STUB = true;
    const JUNCTION_DIAMETER = 1;

    beforeEach(() => {
        lineServiceSpyObj = jasmine.createSpyObj(LineService, ['drawLineExecute']);
        TestBed.configureTestingModule({
            providers: [{ provide: LineService, useValue: lineServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        linePropreties = {
            drawingContext: canvasStubCtx,
            drawingPath: DRAWING_PATH,
            drawingThickness: THICKNESS,
            drawingColor: MAIN_COLOR,
            drawWithJunction: DRAW_WITH_JUNCTION_STUB,
            junctionDiameter: JUNCTION_DIAMETER,
        };
        lineCommand = new LineCommand(lineServiceSpyObj, linePropreties);
    });

    it('#execute should call the draw function from line', () => {
        lineCommand.execute();
        expect(lineServiceSpyObj.drawLineExecute).toHaveBeenCalledWith(linePropreties);
    });
});
