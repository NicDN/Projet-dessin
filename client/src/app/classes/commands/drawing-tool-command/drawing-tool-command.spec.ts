import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { DrawingToolCommand, DrawingToolPropreties } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingToolService } from '@app/services/tools/drawing-tool/drawing-tool.service';
import { TraceToolType } from './drawing-tool-command';

// tslint:disable: no-string-literal
fdescribe('drawing-tool-command', () => {
    let drawingToolCommand: DrawingToolCommand;

    let drawingToolServiceSpyObj: jasmine.SpyObj<DrawingToolService>;

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
        drawingToolServiceSpyObj = jasmine.createSpyObj('DrawingToolService', [
            'sendDrawingPencilNotifs',
            'sendDrawingEraserNotifs',
            'sendDrawingLineNotifs',
        ]);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingToolService, useVlue: drawingToolServiceSpyObj }],
        });
        drawingToolCommand = new DrawingToolCommand(drawingPropretiesStub, drawingToolServiceSpyObj);
    });

    it('#execute should call sendDrawingPencilNotifs if the drawing type is pencil', () => {
        drawingToolCommand['drawingToolPropreties'].traceToolType = TraceToolType.Pencil;
        drawingToolCommand.execute();
        expect(drawingToolServiceSpyObj.sendDrawingPencilNotifs).toHaveBeenCalledWith(drawingToolCommand['drawingToolPropreties']);
    });

    it('#execute should call sendDrawingEraserNotifs if the drawing type is pencil', () => {
        drawingToolCommand['drawingToolPropreties'].traceToolType = TraceToolType.Eraser;
        drawingToolCommand.execute();
        expect(drawingToolServiceSpyObj.sendDrawingEraserNotifs).toHaveBeenCalledWith(drawingToolCommand['drawingToolPropreties']);
    });

    it('#execute should call sendDrawingLineNotifs if the drawing type is line', () => {
        drawingToolCommand['drawingToolPropreties'].traceToolType = TraceToolType.Line;
        drawingToolCommand.execute();
        expect(drawingToolServiceSpyObj.sendDrawingLineNotifs).toHaveBeenCalledWith(drawingToolCommand['drawingToolPropreties']);
    });
});
