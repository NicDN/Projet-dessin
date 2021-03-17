import { TestBed } from '@angular/core/testing';
import { SelectionCommand, SelectionPropreties, SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { SelectionService } from '@app/services/tools/selection/selection.service';

// tslint:disable: no-string-literal
fdescribe('selection-command', () => {
    let selectionCommand: SelectionCommand;
    let selectionServiceSpyObj: jasmine.SpyObj<SelectionService>;
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

    const selectionPropretiesStub: SelectionPropreties = {
        selectionType: SelectionType.Rectangle,
        selectionCtx: canvasCtxStub,
        imageData: canvasCtxStub.getImageData(0, 0, 1, 1),
        topLeft: INITIAL_TOP_CORNER_COORDS,
        bottomRight: INITIAL_BOTTOM_CORNER_COORDS,
        finalTopLeft: FINAL_TOP_CORNER_COORDS,
        finalBottomRight: FINAL_BOTTOM_CORNER_COORDS,
    };

    beforeEach(() => {
        selectionServiceSpyObj = jasmine.createSpyObj('SelectionService', ['sendSelectionRectangleNotifs', 'sendSelectionEllipseNotifs']);
        TestBed.configureTestingModule({
            providers: [{ provide: SelectionService, useValue: selectionServiceSpyObj }, { SelectionService }],
        });
        selectionCommand = new SelectionCommand(selectionPropretiesStub, selectionServiceSpyObj);
    });

    it('#execute should call sendSelectionRectangleNotifs if the selection type is a rectangle', () => {
        selectionCommand['selectionPropreties'].selectionType = SelectionType.Rectangle;
        selectionCommand.execute();
        expect(selectionServiceSpyObj.sendSelectionRectangleNotifs).toHaveBeenCalledWith(selectionPropretiesStub);
    });

    it('#execute should call sendSelectionEllipseNotifs if the selection type is an ellipse', () => {
        selectionCommand['selectionPropreties'].selectionType = SelectionType.Ellipse;
        selectionCommand.execute();
        expect(selectionServiceSpyObj.sendSelectionEllipseNotifs).toHaveBeenCalledWith(selectionPropretiesStub);
    });
});
