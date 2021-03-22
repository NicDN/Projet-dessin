import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { PencilService } from '@app/services/tools/trace-tool/pencil/pencil.service';
import { TraceToolCommand, TraceToolPropreties } from './trace-tool-command';

// tslint:disable: no-string-literal
describe('drawing-tool-command', () => {
    let traceToolCommand: TraceToolCommand;
    let pencilServiceSpyObj: jasmine.SpyObj<PencilService>;
    const pathStub: Vec2 = { x: 0, y: 0 };
    const pathStub2: Vec2 = { x: 2, y: 2 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub2];
    const colorStub: Color = { rgbValue: 'red', opacity: 1 };

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const drawingToolPropretiesStub: TraceToolPropreties = {
        drawingContext: canvasCtxStub,
        drawingPath: pathArrayStub,
        drawingThickness: 1,
        drawingColor: colorStub,
        drawWithJunction: true,
        junctionDiameter: 1,
    };

    beforeEach(() => {
        pencilServiceSpyObj = jasmine.createSpyObj('PencilService', ['drawTrace']);
        TestBed.configureTestingModule({
            providers: [{ provide: PencilService, useValue: pencilServiceSpyObj }],
        });
        traceToolCommand = new TraceToolCommand(drawingToolPropretiesStub, pencilServiceSpyObj);
    });

    it('#execute should call drawTrace with the right drawing tool propreties', () => {
        traceToolCommand.execute();
        expect(pencilServiceSpyObj.drawTrace).toHaveBeenCalledWith(drawingToolPropretiesStub);
    });
});
