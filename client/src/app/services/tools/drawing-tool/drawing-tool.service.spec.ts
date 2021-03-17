import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { DrawingToolPropreties, TraceToolType } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingToolService } from './drawing-tool.service';
import { EraserService } from './eraser/eraser.service';
import { LineService } from './line/line.service';
import { PencilService } from './pencil/pencil.service';

fdescribe('DrawingToolService', () => {
    let service: DrawingToolService;
    let pencilService: PencilService;
    let eraserService: EraserService;
    let lineService: LineService;

    let drawingServiceStub: DrawingService;
    let colorServiceStub: ColorService;
    let undoRedoServiceStub: UndoRedoService;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const pathStub: Vec2 = { x: 1, y: 1 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub];
    const colorStub: Color = { rgbValue: 'red', opacity: 1 };

    const drawingPropretiesStub: DrawingToolPropreties = {
        traceToolType: TraceToolType.Line,
        drawingContext: canvasCtxStub,
        drawingPath: pathArrayStub,
        drawingThickness: 1,
        drawingColor: colorStub,
        drawWithJunction: true,
        junctionDiameter: 1,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingToolService);
        drawingServiceStub = TestBed.inject(DrawingService);
        undoRedoServiceStub = TestBed.inject(UndoRedoService);
        colorServiceStub = TestBed.inject(ColorService);

        pencilService = new PencilService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
        eraserService = new EraserService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
        lineService = new LineService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#sendDrawingPencilNotifs should call the drawExecute function from pencil-service', () => {
        const pencilSpy = spyOn(pencilService, 'executeDrawLine');
        pencilService.listenToNewDrawingPencilCommands();
        service.sendDrawingPencilNotifs(drawingPropretiesStub);
        expect(pencilSpy).toHaveBeenCalled();
    });

    it('#sendDrawingEraserNotifs should call the drawExecute function from pencil-service', () => {
        const eraserSpy = spyOn(eraserService, 'executeErase');
        eraserService.listenToNewDrawingEraserCommands();
        service.sendDrawingEraserNotifs(drawingPropretiesStub);
        expect(eraserSpy).toHaveBeenCalled();
    });

    it('#sendDrawingLineNotifs should call the drawExecute function from pencil-service', () => {
        const lineSpy = spyOn(lineService, 'drawLineExecute');
        lineService.listenToNewDrawingLineCommands();
        service.sendDrawingLineNotifs(drawingPropretiesStub);
        expect(lineSpy).toHaveBeenCalled();
    });
});
