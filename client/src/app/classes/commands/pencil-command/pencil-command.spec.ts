import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { PencilCommand, PencilPropreties } from '@app/classes/commands/pencil-command/pencil-command';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Color } from '@app/classes/color';

fdescribe('eraser-command', () => {
    let pencilServiceSpyObj: jasmine.SpyObj<PencilService>;
    let pencilCommand: PencilCommand;
    let pencilPropreties: PencilPropreties;
    let canvasStub: CanvasTestHelper;
    let canvasStubCtx: CanvasRenderingContext2D;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const DRAWING_PATH: Vec2[] = [TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS];
    const MAIN_COLOR: Color = { rgbValue: 'red', opacity: 1 };
    const THICKNESS = 1;

    beforeEach(() => {
        pencilServiceSpyObj = jasmine.createSpyObj(PencilService, ['executeDrawLine']);
        TestBed.configureTestingModule({
            providers: [{ provide: PencilService, useValue: pencilServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        pencilPropreties = {
            drawingContext: canvasStubCtx,
            drawingPath: DRAWING_PATH,
            drawingThickness: THICKNESS,
            drawingColor: MAIN_COLOR,
        };
        pencilCommand = new PencilCommand(pencilServiceSpyObj, pencilPropreties);
    });

    it('#execute should call the erase function from eraser', () => {
        pencilCommand.execute();
        expect(pencilServiceSpyObj.executeDrawLine).toHaveBeenCalledWith(pencilPropreties);
    });
});
