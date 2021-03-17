import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ShapeCommand, ShapeType } from '@app/classes/commands/shape-command/shape-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ShapeService } from '@app/services/tools/shape/shape.service';

// tslint:disable: no-string-literal
describe('shape-command', () => {
    let shapeCommand: ShapeCommand;
    let shapeServiceSpyObj: jasmine.SpyObj<ShapeService>;

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
        shapeType: ShapeType.Rectangle,
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
        shapeServiceSpyObj = jasmine.createSpyObj('ShapeService', ['sendDrawRectangleNotifs', 'sendDrawEllipseNotifs', 'sendDrawPolygonNotifs']);
        TestBed.configureTestingModule({
            providers: [{ provide: ShapeService, useValue: shapeServiceSpyObj }],
        });

        shapeCommand = new ShapeCommand(shapePropretiesStub, shapeServiceSpyObj);
    });

    it('#execute should call sendDrawRectangleNotifs if the shapetype is a rectangle', () => {
        shapeCommand['shapePropreties'].shapeType = ShapeType.Rectangle;
        shapeCommand.execute();
        expect(shapeServiceSpyObj.sendDrawRectangleNotifs).toHaveBeenCalledWith(shapeCommand['shapePropreties']);
    });

    it('#execute should call sendDrawEllipseNotifs if the shapetype is an ellipse', () => {
        shapeCommand['shapePropreties'].shapeType = ShapeType.Ellipse;
        shapeCommand.execute();

        expect(shapeServiceSpyObj.sendDrawEllipseNotifs).toHaveBeenCalledWith(shapeCommand['shapePropreties']);
    });

    it('#execute should call sendDrawPolygonNotifs if the shapetype is a polygon', () => {
        shapeCommand['shapePropreties'].shapeType = ShapeType.Polygon;
        shapeCommand.execute();
        expect(shapeServiceSpyObj.sendDrawPolygonNotifs).toHaveBeenCalledWith(shapeCommand['shapePropreties']);
    });
});
