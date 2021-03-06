import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

// tslint:disable: no-string-literal
fdescribe('PolygonService', () => {
    let service: PolygonService;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';

    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const BOTTOM_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 20 };
    const TOP_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 0 };

    //const RGB_MAX = 255;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
            secondaryColor: { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [
                PolygonService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PolygonService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawingServiceSpyObj.baseCtx, THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.getLineDash()).toEqual([]);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.lineCap).toEqual('round');
    });

    it('#getCenterCoords should return coords of the center of the Polygon', () => {
        const expectedCenterCoords: Vec2 = { x: 20, y: 10 };
        expect(service.getCenterCoords(TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS)).toEqual(expectedCenterCoords);
        expect(service.getCenterCoords(BOTTOM_RIGHT_CORNER_COORDS, TOP_LEFT_CORNER_COORDS)).toEqual(expectedCenterCoords);
        expect(service.getCenterCoords(BOTTOM_LEFT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS)).toEqual(expectedCenterCoords);
        expect(service.getCenterCoords(TOP_RIGHT_CORNER_COORDS, BOTTOM_LEFT_CORNER_COORDS)).toEqual(expectedCenterCoords);
    });

    it('#getRadius should return radius of the Polygon', () => {
        const expectedXRadius = 20;
        const expectedYRadius = 10;
        service.traceType = TraceType.FilledNoBordered;

        expect(service.getRadius(TOP_LEFT_CORNER_COORDS.x, BOTTOM_RIGHT_CORNER_COORDS.x)).toEqual(expectedXRadius);
        expect(service.getRadius(TOP_LEFT_CORNER_COORDS.y, BOTTOM_RIGHT_CORNER_COORDS.y)).toEqual(expectedYRadius);
        expect(service.getRadius(BOTTOM_RIGHT_CORNER_COORDS.x, TOP_LEFT_CORNER_COORDS.x)).toEqual(expectedXRadius);
        expect(service.getRadius(BOTTOM_RIGHT_CORNER_COORDS.y, TOP_LEFT_CORNER_COORDS.y)).toEqual(expectedYRadius);
    });
});
