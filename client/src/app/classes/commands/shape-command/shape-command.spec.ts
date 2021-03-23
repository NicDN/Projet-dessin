import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ShapeCommand } from '@app/classes/commands/shape-command/shape-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

// tslint:disable: no-string-literal
describe('shape-command', () => {
    let shapeCommand: ShapeCommand;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    const stubWidthAndHeight = 100;
    canvasStub.width = stubWidthAndHeight;
    canvasStub.height = stubWidthAndHeight;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';
    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const mainColorStub: Color = { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB };
    const secondaryColorStub: Color = { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB };

    const shapePropretiesStub = {
        drawingContext: canvasCtxStub,
        beginCoords: TOP_LEFT_CORNER_COORDS,
        endCoords: BOTTOM_RIGHT_CORNER_COORDS,
        drawingThickness: THICKNESS_STUB,
        mainColor: mainColorStub,
        secondaryColor: secondaryColorStub,
        isAlternateShape: false,
        traceType: TraceType.FilledAndBordered,
    };

    beforeEach(() => {
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['drawShape']);
        TestBed.configureTestingModule({
            providers: [{ provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj }],
        });
        shapeCommand = new ShapeCommand(shapePropretiesStub, rectangleDrawingServiceSpyObj);
    });

    it('#execute should call drawShape with the right shape propreties', () => {
        shapeCommand.execute();
        expect(rectangleDrawingServiceSpyObj.drawShape).toHaveBeenCalledWith(shapePropretiesStub);
    });
});
