import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { EraserPropreties } from '@app/classes/commands/erasing-command/erasing-command';
import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EraserCommand } from './erasing-command';

describe('eraser-command', () => {
    let erasingServiceSpyObj: jasmine.SpyObj<EraserService>;
    let eraserCommand: EraserCommand;
    let eraserPropreties: EraserPropreties;
    let canvasStub: CanvasTestHelper;
    let canvasStubCtx: CanvasRenderingContext2D;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const DRAWING_PATH: Vec2[] = [TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS];
    const THICKNESS = 1;

    beforeEach(() => {
        erasingServiceSpyObj = jasmine.createSpyObj(EraserService, ['executeErase']);
        TestBed.configureTestingModule({
            providers: [{ provide: EraserService, useValue: erasingServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        eraserPropreties = {
            drawingContext: canvasStubCtx,
            drawingPath: DRAWING_PATH,
            drawingThickness: THICKNESS,
        };
        eraserCommand = new EraserCommand(erasingServiceSpyObj, eraserPropreties);
    });

    it('#execute should call the erase function from eraser', () => {
        eraserCommand.execute();
        expect(erasingServiceSpyObj.executeErase).toHaveBeenCalledWith(eraserPropreties);
    });
});
