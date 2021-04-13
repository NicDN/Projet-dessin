import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { of } from 'rxjs';
import { MagnetSelectionService, SelectedPoint } from './magnet-selection.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
describe('MagnetSelectionService', () => {
    let service: MagnetSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let gridServiceSpyObj: jasmine.SpyObj<GridService>;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const MOUSE_OFFSET = 5;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 40 };
    const boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };
    const SQUARE_SIZE = 40;

    let selectionCoordsStub: SelectionCoords;
    let selectionWidth: number;
    let selectionHeight: number;
    let dimensionStub: Vec2;
    const deltaX = 60;
    const deltaY = 60;
    let deltaStub: Vec2;
    let mouseOffsetTopToMagnetize = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };
    let mouseOffsetBottomToMagnetize = MOUSE_POSITION;
    let positionToMagnetize = { x: 60, y: 40 };

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newIncomingResizeSignals', 'newGridSignals']);
        gridServiceSpyObj = jasmine.createSpyObj('GridService', ['']);
        // tslint:disable-next-line: prefer-const
        let emptyMessage: any;
        drawingServiceSpyObj.newGridSignals.and.returnValue(of(emptyMessage));
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });

        selectionCoordsStub = {
            initialTopLeft: TOP_LEFT_CORNER_COORDS,
            initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
            finalTopLeft: TOP_LEFT_CORNER_COORDS,
            finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        };
        positionToMagnetize = { x: 60, y: 40 };
        mouseOffsetBottomToMagnetize = MOUSE_POSITION;
        mouseOffsetTopToMagnetize = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };
        selectionWidth = BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x;
        selectionHeight = BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y;
        deltaStub = { x: deltaX, y: deltaY };
        dimensionStub = { x: selectionWidth, y: selectionHeight };
        gridServiceSpyObj.squareSize = SQUARE_SIZE;
        service = TestBed.inject(MagnetSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#alignToProperMagnetMousePosition should keep values of  deltaX and deltaY if they are negative  ', () => {
        const negativeDelta = -20;
        deltaStub = { x: negativeDelta, y: negativeDelta };
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(deltaStub.x).toEqual(negativeDelta);
        expect(deltaStub.y).toEqual(negativeDelta);
    });

    it('#alignToProperMagnetMousePosition should keep the values of deltaX and deltaY if they equal 0  ', () => {
        deltaStub = { x: 0, y: 0 };
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(deltaStub.x).toEqual(0);
        expect(deltaStub.y).toEqual(0);
    });

    it('#alignToProperMagnetMousePosition should call topLeft if the selected point is top left', () => {
        service.pointToMagnetize = SelectedPoint.TOP_LEFT;
        const topLeftSpy = spyOn<any>(service, 'topLeft');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(topLeftSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call topMid if the selected point is top middle', () => {
        service.pointToMagnetize = SelectedPoint.TOP_MIDDLE;
        const topMidSpy = spyOn<any>(service, 'topMid');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(topMidSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call topRight if the selected point is top right', () => {
        service.pointToMagnetize = SelectedPoint.TOP_RIGHT;
        const topRightSpy = spyOn<any>(service, 'topRight');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(topRightSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call midLeft if the selected point is middle left', () => {
        service.pointToMagnetize = SelectedPoint.MIDDLE_LEFT;
        const midLeftSpy = spyOn<any>(service, 'midLeft');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(midLeftSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call magCenter if the selected point is center', () => {
        service.pointToMagnetize = SelectedPoint.CENTER;
        const magCenterSpy = spyOn<any>(service, 'magCenter');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(magCenterSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call midRight if the selected point is middle right', () => {
        service.pointToMagnetize = SelectedPoint.MIDDLE_RIGHT;
        const midRightSpy = spyOn<any>(service, 'midRight');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(midRightSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botLeft if the selected point is bottom left', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_LEFT;
        const botLeftSpy = spyOn<any>(service, 'botLeft');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(botLeftSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botMid if the selected point is bottom middle', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_MIDDLE;
        const botMidSpy = spyOn<any>(service, 'botMid');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(botMidSpy).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botRight if the selected point is bottom right', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_RIGHT;
        const botRightSpy = spyOn<any>(service, 'botRight');
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub, selectionWidth, selectionHeight);
        expect(botRightSpy).toHaveBeenCalled();
    });

    it('#yIsFlipped should return true if finalBottomRight.x is lower than finalTopLeft.x', () => {
        selectionCoordsStub.finalBottomRight.x = 0;
        selectionCoordsStub.finalTopLeft.x = 1;
        const expectedResult = service['yIsFlipped'](selectionCoordsStub);
        expect(expectedResult).toBeTrue();
    });

    it('#xIsFlipped should return true if finalBottomRight.y is lower than finalTopLeft.y', () => {
        selectionCoordsStub.finalBottomRight.y = 0;
        selectionCoordsStub.finalTopLeft.y = 1;
        const expectedResult = service['xIsFlipped'](selectionCoordsStub);
        expect(expectedResult).toBeTrue();
    });

    it('#magTopLeft should allign the selection to the top left position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        deltaStub = { x: 0, y: 0 };
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magTopLeft'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopLeft should allign the selection to the top left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopLeft'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopMid should allign the selection to the top middle position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magTopMid'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y },
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            deltaStub,
            dimensionStub,
        );

        expect(
            Math.abs(selectionCoordsStub.finalTopLeft.x - (positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionHeight / 2)),
        ).toBeLessThan(2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopMid should allign the selection to the top middle position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopMid'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopRight should allign the selection to the top right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        deltaStub = { x: 0, y: 0 };
        service['magTopRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetBottomToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopRight should allign the selection to the top right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidLeft should allign the selection to the middle left position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magMidLeft'](
            { x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight / 2);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidLeft should allign the selection to the middle left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magMidLeft'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magCenter should allign the selection to the center position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magCenter'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(Math.abs(selectionCoordsStub.finalBottomRight.x - (selectionCoordsStub.finalTopLeft.x + selectionWidth))).toBeLessThan(2);
        expect(Math.abs(selectionCoordsStub.finalBottomRight.y - (selectionCoordsStub.finalTopLeft.y + selectionHeight))).toBeLessThan(2);
    });

    it('#magCenter should allign the selection to the center position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magCenter'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);

        expect(Math.abs(selectionCoordsStub.finalTopLeft.x - (selectionCoordsStub.finalBottomRight.x - selectionWidth))).toBeLessThan(2);
        expect(Math.abs(selectionCoordsStub.finalTopLeft.y - (selectionCoordsStub.finalBottomRight.y - selectionHeight))).toBeLessThan(2);
    });

    it('#magMidRight should allign the selection to the middle right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magMidRight'](
            { x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y + selectionHeight / 2);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#magMidRight should allign the selection to the middle right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magMidRight'](positionToMagnetize, selectionCoordsStub, mouseOffsetTopToMagnetize, deltaStub, dimensionStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotLeft should allign the selection to the center position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magBotLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
    });

    it('#magBotLeft should allign the selection to the center position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
    });

    it('#magBotLeft should allign the selection to the bottom left position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magBotLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
    });

    it('#magBotLeft should allign the selection to the bottom left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
    });

    it('#magBotMid should allign the selection to the bottom middle position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magBotMid'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y },
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x + selectionWidth / 2);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
    });

    it('#magBotMid should allign the selection to the bottom middle position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotMid'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#magBotRight should allign the selection to the bottom right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetBottomToMagnetize;
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service['magBotRight'](
            { x: positionToMagnetize.x, y: positionToMagnetize.y },
            selectionCoordsStub,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetBottomToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#magBotRight should allign the selection to the bottom right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotRight'](positionToMagnetize, selectionCoordsStub, mouseOffsetBottomToMagnetize, deltaStub, dimensionStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#topLeft should call magTopRight if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['topLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magBotLeft if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['topLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magBotRight if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['topLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magTopLeft if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['topLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#topMid should call magBotMid if the x axis is flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotMidSpy = spyOn<any>(service, 'magBotMid');
        service['topMid'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotMidSpy).toHaveBeenCalled();
    });

    it('#topMid should call magTopMid if the x axis is not flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopMidSpy = spyOn<any>(service, 'magTopMid');
        service['topMid'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopMidSpy).toHaveBeenCalled();
    });

    it('#topRight should call magTopLeft if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['topRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#topRight should call magBotRight if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['topRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#topRight should call magBotLeft if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['topRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#topRight should call magTopRight if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['topRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#midLeft should call magMidRight if the y axis is flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        const magMidRightSpy = spyOn<any>(service, 'magMidRight');
        service['midLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magMidRightSpy).toHaveBeenCalled();
    });

    it('#midLeft should call magMidLeft if the y axis is not  flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        const magMidLeftSpy = spyOn<any>(service, 'magMidLeft');
        service['midLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magMidLeftSpy).toHaveBeenCalled();
    });

    it('#midRight should call magMidLeft if the y axis is flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        const magMidLeftSpy = spyOn<any>(service, 'magMidLeft');
        service['midRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magMidLeftSpy).toHaveBeenCalled();
    });

    it('#midRight should call magMidRight if the y axis is not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        const magMidRightSpy = spyOn<any>(service, 'magMidRight');
        service['midRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magMidRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magBotRight if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['botLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magTopLeft if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['botLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magTopRight if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['botLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magBotLeft if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['botLeft'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#botMid should call magTopMid if the x axis is flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopMidSpy = spyOn<any>(service, 'magTopMid');
        service['botMid'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopMidSpy).toHaveBeenCalled();
    });

    it('#botMid should call magBotMid if the x axis is not  flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotMidSpy = spyOn<any>(service, 'magBotMid');
        service['botMid'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotMidSpy).toHaveBeenCalled();
    });

    it('#botRight should call magBotLeft if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['botRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#botRight should call magTopRight if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['botRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#botRight should call magTopLeft if the x and y axis are  flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['botRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#botRight should call magBotRight if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['botRight'](
            positionToMagnetize,
            selectionCoordsStub,
            mouseOffsetTopToMagnetize,
            mouseOffsetBottomToMagnetize,
            deltaStub,
            dimensionStub,
        );
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeX if we need to magnetize the x coordinate', () => {
        positionToMagnetize = selectionCoordsStub.finalTopLeft;
        const magnetizeXSpy = spyOn<any>(service, 'magnetizeX');
        service['finalMagnetized'](positionToMagnetize, true, false);
        expect(magnetizeXSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeY if we need to magnetize the Y coordinate', () => {
        positionToMagnetize = selectionCoordsStub.finalTopLeft;
        const magnetizeYSpy = spyOn<any>(service, 'magnetizeY');
        service['finalMagnetized'](positionToMagnetize, false, true);
        expect(magnetizeYSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeY and magnetizeX if we need to magnetize both coordinates', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        const magnetizeXSpy = spyOn<any>(service, 'magnetizeX');
        const magnetizeYSpy = spyOn<any>(service, 'magnetizeY');
        service['finalMagnetized'](positionToMagnetize, true, true);
        expect(magnetizeXSpy).toHaveBeenCalled();
        expect(magnetizeYSpy).toHaveBeenCalled();
    });

    it('#translateCoords should translate the coordinates with the proper parameters', () => {
        let positionToTranslate = selectionCoordsStub.finalBottomRight;
        positionToTranslate = service['translateCoords'](positionToTranslate, MOUSE_OFFSET, MOUSE_OFFSET, selectionWidth, selectionHeight);
        expect(positionToTranslate.x).toEqual(selectionCoordsStub.finalBottomRight.x + MOUSE_OFFSET + selectionWidth);
        expect(positionToTranslate.y).toEqual(selectionCoordsStub.finalBottomRight.y + MOUSE_OFFSET + selectionHeight);
    });

    it('#magnetizeX should round the x coordinate of a position to the nearest grid square', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        positionToMagnetize = service['magnetizeX'](selectionCoordsStub.finalBottomRight);
        expect(positionToMagnetize.x).toEqual(Math.round(positionToMagnetize.x / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize);
        expect(positionToMagnetize.y).toEqual(selectionCoordsStub.finalBottomRight.y);
    });

    it('#magnetizeY should round the y coordinate of a position to the nearest grid square', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        positionToMagnetize = service['magnetizeY'](selectionCoordsStub.finalBottomRight);
        expect(positionToMagnetize.y).toEqual(Math.round(positionToMagnetize.y / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize);
        expect(positionToMagnetize.x).toEqual(selectionCoordsStub.finalBottomRight.x);
    });

    it('#getMagnetizedOffsetPosition should magnetize the mouse move offset position', () => {
        const EXPECTED_MAGNETIZED_MOUSE_OFFSET = 0;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        expect(mouseOffsetTopToMagnetize.x).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
        expect(mouseOffsetTopToMagnetize.y).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
    });
});
