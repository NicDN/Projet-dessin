import { TestBed } from '@angular/core/testing';
import { SelectionCommand, SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';

// tslint:disable: no-string-literal
describe('selection-command', () => {
    let selectionCommand: SelectionCommand;
    let selectionToolSpyObj: jasmine.SpyObj<SelectionTool>;
    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    const stubWidthAndHeight = 100;
    canvasStub.width = stubWidthAndHeight;
    canvasStub.height = stubWidthAndHeight;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const INITIAL_TOP_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const INITIAL_BOTTOM_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const FINAL_TOP_CORNER_COORDS: Vec2 = { x: 50, y: 30 };
    const FINAL_BOTTOM_CORNER_COORDS: Vec2 = { x: 90, y: 50 };

    const selectionPropretiesStub: SelectionProperties = {
        selectionCtx: canvasCtxStub,
        imageData: canvasCtxStub.getImageData(0, 0, 1, 1),
        initialTopLeft: INITIAL_TOP_CORNER_COORDS,
        initialBottomRight: INITIAL_BOTTOM_CORNER_COORDS,
        finalTopLeft: FINAL_TOP_CORNER_COORDS,
        finalBottomRight: FINAL_BOTTOM_CORNER_COORDS,
    };

    beforeEach(() => {
        selectionToolSpyObj = jasmine.createSpyObj('SelectionService', ['fillWithWhite', 'drawSelection']);
        TestBed.configureTestingModule({
            providers: [{ provide: SelectionTool, useValue: selectionToolSpyObj }],
        });
        selectionCommand = new SelectionCommand(selectionPropretiesStub, selectionToolSpyObj);
    });

    it('#execute should call sendSelectionRectangleNotifs if the selection type is a rectangle', () => {
        selectionCommand.execute();
        expect(selectionToolSpyObj.fillWithWhite).toHaveBeenCalledWith(selectionPropretiesStub);
    });

    it('#execute should call sendSelectionEllipseNotifs if the selection type is an ellipse', () => {
        selectionCommand.execute();
        expect(selectionToolSpyObj.drawSelection).toHaveBeenCalledWith(selectionPropretiesStub);
    });
});
