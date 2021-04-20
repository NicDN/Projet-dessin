import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { of } from 'rxjs';
import { MagnetSelectionService } from './magnet-selection.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
describe('MagnetSelectionService', () => {
    let service: MagnetSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let gridServiceSpyObj: jasmine.SpyObj<GridService>;

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
        mouseOffsetTopToMagnetize = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };
        selectionWidth = BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x;
        selectionHeight = BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y;
        deltaStub = { x: deltaX, y: deltaY };
        dimensionStub = { x: selectionWidth, y: selectionHeight };
        gridServiceSpyObj.squareSize = SQUARE_SIZE;
        service = TestBed.inject(MagnetSelectionService);
        service['dimension'] = dimensionStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magTopLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopLeft should allign the selection to the top left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopMid should allign the selection to the top middle position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magTopMid']({ x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y }, selectionCoordsStub, deltaStub);

        expect(
            Math.abs(selectionCoordsStub.finalTopLeft.x - (positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2)),
        ).toBeLessThan(2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopMid should allign the selection to the top middle position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopRight should allign the selection to the top right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        deltaStub = { x: 0, y: 0 };
        service['magTopRight']({ x: positionToMagnetize.x - selectionWidth, y: positionToMagnetize.y }, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magTopRight should allign the selection to the top right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magTopRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidLeft should allign the selection to the middle left position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magMidLeft']({ x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight / 2 }, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight / 2);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidLeft should allign the selection to the middle left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magMidLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magCenter should allign the selection to the center position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magCenter'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            deltaStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight / 2);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magCenter should allign the selection to the center position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magCenter'](positionToMagnetize, selectionCoordsStub, deltaStub);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidRight should allign the selection to the middle right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magMidRight'](
            { x: positionToMagnetize.x - selectionWidth, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            deltaStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight / 2);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magMidRight should allign the selection to the middle right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magMidRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotLeft should allign the selection to the bottom left position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magBotLeft']({ x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight }, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetTopToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotLeft should allign the selection to the bottom left position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotMid should allign the selection to the bottom middle position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magBotMid'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y - selectionHeight },
            selectionCoordsStub,
            deltaStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotMid should allign the selection to the bottom middle position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotRight should allign the selection to the bottom right position when using the mouse', () => {
        service.isUsingMouse = true;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service['mouseOffsetTop'] = mouseOffsetTopToMagnetize;
        service['magBotRight'](
            { x: positionToMagnetize.x - selectionWidth, y: positionToMagnetize.y - selectionHeight },
            selectionCoordsStub,
            deltaStub,
        );
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#magBotRight should allign the selection to the bottom right position when using the arrows', () => {
        service.isUsingMouse = false;
        service['magBotRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#topLeft should call magTopRight if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['topLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magBotLeft if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['topLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magBotRight if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['topLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#topLeft should call magTopLeft if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['topLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#topMid should call magBotMid if the x axis is flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotMidSpy = spyOn<any>(service, 'magBotMid');
        service['topMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotMidSpy).toHaveBeenCalled();
    });

    it('#topMid should call magTopMid if the x axis is not flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopMidSpy = spyOn<any>(service, 'magTopMid');
        service['topMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopMidSpy).toHaveBeenCalled();
    });

    it('#topRight should call magTopLeft if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['topRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#topRight should call magBotRight if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['topRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#topRight should call magBotLeft if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['topRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#topRight should call magTopRight if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['topRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#midLeft should call magMidRight if the y axis is flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        const magMidRightSpy = spyOn<any>(service, 'magMidRight');
        service['midLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magMidRightSpy).toHaveBeenCalled();
    });

    it('#midLeft should call magMidLeft if the y axis is not  flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        const magMidLeftSpy = spyOn<any>(service, 'magMidLeft');
        service['midLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magMidLeftSpy).toHaveBeenCalled();
    });

    it('#midRight should call magMidLeft if the y axis is flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        const magMidLeftSpy = spyOn<any>(service, 'magMidLeft');
        service['midRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magMidLeftSpy).toHaveBeenCalled();
    });

    it('#midRight should call magMidRight if the y axis is not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        const magMidRightSpy = spyOn<any>(service, 'magMidRight');
        service['midRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magMidRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magBotRight if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['botLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magTopLeft if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['botLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magTopRight if the x and y axis are flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['botLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#botLeft should call magBotLeft if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['botLeft'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#botMid should call magTopMid if the x axis is flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopMidSpy = spyOn<any>(service, 'magTopMid');
        service['botMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopMidSpy).toHaveBeenCalled();
    });

    it('#botMid should call magBotMid if the x axis is not  flipped', () => {
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotMidSpy = spyOn<any>(service, 'magBotMid');
        service['botMid'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotMidSpy).toHaveBeenCalled();
    });

    it('#botRight should call magBotLeft if the y axis is flipped but not the x axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotLeftSpy = spyOn<any>(service, 'magBotLeft');
        service['botRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotLeftSpy).toHaveBeenCalled();
    });

    it('#botRight should call magTopRight if the x axis is flipped but not the y axis', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopRightSpy = spyOn<any>(service, 'magTopRight');
        service['botRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopRightSpy).toHaveBeenCalled();
    });

    it('#botRight should call magTopLeft if the x and y axis are  flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(true);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(true);
        const magTopLeftSpy = spyOn<any>(service, 'magTopLeft');
        service['botRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magTopLeftSpy).toHaveBeenCalled();
    });

    it('#botRight should call magBotRight if the x and y axis are not flipped', () => {
        spyOn<any>(service, 'yIsFlipped').and.returnValue(false);
        spyOn<any>(service, 'xIsFlipped').and.returnValue(false);
        const magBotRightSpy = spyOn<any>(service, 'magBotRight');
        service['botRight'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magBotRightSpy).toHaveBeenCalled();
    });

    it('#magPos should magnetize the x and y coordinates to the nearest grid intersection', () => {
        positionToMagnetize = selectionCoordsStub.finalTopLeft;
        service['magPos'](positionToMagnetize);
        expect(
            Math.abs(positionToMagnetize.x - Math.round(positionToMagnetize.x / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize),
        ).toBeLessThan(2);
        expect(
            Math.abs(positionToMagnetize.y - Math.round(positionToMagnetize.y / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize),
        ).toBeLessThan(2);
    });

    it('#translateCoords should translate the coordinates with the proper parameters', () => {
        let positionToTranslate = selectionCoordsStub.finalBottomRight;
        positionToTranslate = service['translateCoords'](positionToTranslate, mouseOffsetTopToMagnetize, dimensionStub);
        expect(positionToTranslate.x).toEqual(selectionCoordsStub.finalBottomRight.x + MOUSE_OFFSET + selectionWidth);
        expect(positionToTranslate.y).toEqual(selectionCoordsStub.finalBottomRight.y + MOUSE_OFFSET + selectionHeight);
    });

    it('#getMagnetizedOffsetPosition should magnetize the mouse move offset position', () => {
        const EXPECTED_MAGNETIZED_MOUSE_OFFSET = 0;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        expect(mouseOffsetTopToMagnetize.x).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
        expect(mouseOffsetTopToMagnetize.y).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
    });
});
