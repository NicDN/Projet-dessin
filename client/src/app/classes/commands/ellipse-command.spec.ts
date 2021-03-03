// import { EllipseCommand } from '@app/classes/commands/ellipse-command';
// import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
// import { TestBed } from '@angular/core/testing';
// import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
// import { Vec2 } from '@app/classes/vec2';
// import { TraceType } from '@app/classes/shape';

describe('command-ellipse', () => {
    // let ellipseCommand: EllipseCommand;
    // let ellipseDrawingService: EllipseDrawingService;
    // let canvasTestHelper: CanvasTestHelper;
    // let baseCtxStub: CanvasRenderingContext2D;

    // const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    // const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };

    // const THICKNESS = 1;
    // const MAINCOLOR = 'red';
    // const SECONDARY_COLOR = 'red';
    // const GLOBAL_ALPHA = 1;
    // const IS_ALTERNATE_SHAPE = true;
    // const TRACE_TYPE = TraceType.Bordered;
    // // const RGB_MAX = 255;


    beforeEach(() => {
        // TestBed.configureTestingModule({
        //     providers: [{ provide: EllipseDrawingService, useValue: ellipseDrawingService }],
        // });
        // ellipseDrawingService = TestBed.inject(EllipseDrawingService);

        // canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        // ellipseCommand = new EllipseCommand(
        //     ellipseDrawingService,
        //     baseCtxStub,
        //     TOP_LEFT_CORNER_COORDS,
        //     BOTTOM_RIGHT_CORNER_COORDS,
        //     THICKNESS,
        //     MAINCOLOR,
        //     SECONDARY_COLOR,
        //     GLOBAL_ALPHA,
        //     IS_ALTERNATE_SHAPE,
        //     TRACE_TYPE,
        // );
    });

    // it('#execute should draw an ellipse on the canvas at the right position and using the right colours', () => {
    //     // ellipseCommand.thickness = THICKNESS_STUB;
    //     // service.traceType = TraceType.FilledAndBordered;
    //     ellipseDrawingService.alternateShape = true;
    //     debugger
    //     ellipseCommand.execute();

    //     const borderPoint: Vec2 = { x: 2, y: 10 };
    //     const centerPoint: Vec2 = { x: 20, y: 10 };
    //     const outsidePoint: Vec2 = { x: 41, y: 10 };

    //     const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
    //     expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
    //     const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
    //     expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
    //     const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
    //     expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    // });

    // it('#execute without border should draw an ellipse on the canvas at the right position and using the right colours', () => {
    //     service.thickness = THICKNESS_STUB;
    //     service.traceType = TraceType.FilledNoBordered;
    //     service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

    //     const borderPoint: Vec2 = { x: 2, y: 10 };
    //     const centerPoint: Vec2 = { x: 20, y: 10 };
    //     const outsidePoint: Vec2 = { x: 41, y: 10 };

    //     const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
    //     expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
    //     const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
    //     expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
    //     const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
    //     expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    // });

    // it('#execute when using alternate shape should draw a circle on the canvas at the right position and using the right colours', () => {
    //     service.thickness = THICKNESS_STUB;
    //     service.traceType = TraceType.Bordered;
    //     service['alternateShape'] = true;
    //     service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

    //     const borderPoint: Vec2 = { x: 10, y: 2 };
    //     const centerPoint: Vec2 = { x: 12, y: 10 };
    //     const outsidePoint: Vec2 = { x: 21, y: 10 };

    //     const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
    //     expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
    //     const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
    //     expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    //     const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
    //     expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    // });
});
