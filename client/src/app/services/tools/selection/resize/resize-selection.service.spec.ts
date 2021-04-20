import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SelectedPoint } from '@app/services/tools/selection/move/move-selection.service';
import { ResizeSelectionService } from './resize-selection.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('ResizeSelectionService', () => {
    let service: ResizeSelectionService;
    // tslint:disable-next-line: prefer-const
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const CONST_TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const CONST_BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const RGB_MAX = 255;

    const widthStub = 100;
    const heightStub = 100;
    const expectedResult = 90;
    const expectedCoords = 100;

    const offSetXStub = 10;

    let coordsStub = {
        initialTopLeft: TOP_LEFT_CORNER_COORDS,
        initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        finalTopLeft: TOP_LEFT_CORNER_COORDS,
        finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
    };

    const posStub = { x: 100, y: 100 };
    const previewCanvasMock = document.createElement('canvas');

    const previewCanvasRef: ElementRef<HTMLCanvasElement> = {
        nativeElement: previewCanvasMock,
    };

    const previewCtxStub = previewCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SnackBarService, useValue: snackbarServiceSpy }],
        });
        service = TestBed.inject(ResizeSelectionService);
        service.lastDimensions = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#drawBox should draw a blue hollow rectangle and draw the controlPoints', () => {
        const drawControlPointsSpy = spyOn<any>(service, 'drawControlPoints');

        service['drawBox'](previewCtxStub, CONST_TOP_LEFT_CORNER_COORDS, CONST_BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 0, y: 0 };
        const borderPoint2: Vec2 = { x: 20, y: 20 };
        const centerPoint: Vec2 = { x: 10, y: 10 };

        const imageDataBorder: ImageData = previewCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data[2]).toEqual(RGB_MAX);
        const imageDataBorder2: ImageData = previewCtxStub.getImageData(borderPoint2.x, borderPoint2.y, 1, 1);
        expect(imageDataBorder2.data[2]).toEqual(RGB_MAX);
        const imageDataCenter: ImageData = previewCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        expect(drawControlPointsSpy).toHaveBeenCalled();
    });

    it('#getControlPointsCoords should return an array of 8 coords representing the control points positions', () => {
        const NO_OF_EXPECTED_POINTS = 9;
        expect(service['getControlPointsCoords'](TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS).length).toEqual(NO_OF_EXPECTED_POINTS);
    });

    it('#drawControlPoints should get all the control points data and draw a rectangle for each one excpet for the the one in index 4', () => {
        const NUMBER_OF_CONTROL_POINTS = 6;
        const getControlPointsCoordsSpy = spyOn<any>(service, 'getControlPointsCoords').and.returnValue([
            {} as Vec2,
            {} as Vec2,
            {} as Vec2,
            {} as Vec2,
            {} as Vec2,
            {} as Vec2,
            {} as Vec2,
        ]);
        const rectSpy = spyOn(previewCtxStub, 'rect');

        service['drawControlPoints'](previewCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        expect(getControlPointsCoordsSpy).toHaveBeenCalledWith(TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(rectSpy).toHaveBeenCalledTimes(NUMBER_OF_CONTROL_POINTS);
    });

    it('#resizeSelection should call #handleTopLeft if TOP_LEFT has been selected', () => {
        const handleTopLeftSpy = spyOn<any>(service, 'handleTopLeft').and.returnValues();
        service.selectedPointIndex = SelectedPoint.TOP_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(handleTopLeftSpy).toHaveBeenCalled();
    });

    it('#resizeSelection should call #handleBottomLeft if BOTTOM_LEFT has been selected', () => {
        const handleBottomLeftSpy = spyOn<any>(service, 'handleBottomLeft').and.returnValues();
        service.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(handleBottomLeftSpy).toHaveBeenCalled();
    });

    it('#resizeSelection should call #handleTopRight if TOP_RIGHT has been selected', () => {
        const handleTopRightSpy = spyOn<any>(service, 'handleTopRight').and.returnValues();
        service.selectedPointIndex = SelectedPoint.TOP_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(handleTopRightSpy).toHaveBeenCalled();
    });

    it('#resizeSelection should call #handleBottomRight if BOTTOM_RIGHT has been selected', () => {
        const handleBottomRightSpy = spyOn<any>(service, 'handleBottomRight').and.returnValues();
        service.selectedPointIndex = SelectedPoint.BOTTOM_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(handleBottomRightSpy).toHaveBeenCalled();
    });

    it('#handleTopLeft should resizeCoords of top left', () => {
        service['handleTopLeft'](posStub, coordsStub);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
    });

    it('#handleTopRight should resizeCoords of top right', () => {
        service['handleTopRight'](posStub, coordsStub);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
    });

    it('#handleBottomRight should resizeCoords of bottom left', () => {
        service['handleBottomLeft'](posStub, coordsStub);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
    });

    it('#handleBottomRight should resizeCoords of bottom right', () => {
        service['handleBottomRight'](posStub, coordsStub);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords of top middle if TOP_MIDDLE has been selected', () => {
        service.selectedPointIndex = SelectedPoint.TOP_MIDDLE;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords of middle left if MIDDLE_LEFT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.MIDDLE_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords of middle right if MIDDLE_RIGHT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.MIDDLE_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords of bottom middle if BOTTOM_MIDDLE has been selected', () => {
        service.selectedPointIndex = SelectedPoint.BOTTOM_MIDDLE;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
    });

    it('#handleTopLeft should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service['handleTopLeft'](posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#handleTopRight should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service['handleTopRight'](posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#handleBottomRight should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service['handleBottomRight'](posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#handleBottomLeft should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service['handleBottomLeft'](posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#findDistance should change the width if it is equal to 0', () => {
        service.lastDimensions = { x: widthStub, y: heightStub };
        service['width'] = 0;
        service['height'] = heightStub;
        const result = service['findDistance'](posStub, offSetXStub);
        expect(result.x).toEqual(expectedResult);
    });

    it('#findDistance should change the height if it is equal to 0', () => {
        service.lastDimensions = { x: widthStub, y: heightStub };
        service['width'] = widthStub;
        service['height'] = 0;
        const result = service['findDistance'](posStub, offSetXStub);
        expect(result.y).toEqual(expectedResult);
    });

    it('#findDistance should find the right distance', () => {
        service.lastDimensions = { x: widthStub, y: heightStub };
        service['width'] = widthStub;
        service['height'] = heightStub;
        const result = service['findDistance'](posStub, offSetXStub);
        expect(result.y).toEqual(expectedResult);
        expect(result.x).toEqual(expectedResult);
    });

    it('#findEndCoords should return the appropriate end coords', () => {
        const coordsXStub = 80;
        const coordsYStub = 80;
        spyOn<any>(service, 'findDistance').and.returnValue({ x: 10, y: 10 });
        service['width'] = widthStub;
        service['height'] = heightStub;
        const result = service['findEndCoords'](posStub, coordsXStub, coordsYStub);
        expect(result.x).toEqual(expectedResult);
        expect(result.y).toEqual(expectedResult);
    });

    it('#checkIfAControlPointHasBeenSelected should return the right point, should be no point if no point is selected', () => {
        const NOT_A_POINT_STUB = -1000;
        const posBottomRightStub = { x: NOT_A_POINT_STUB, y: NOT_A_POINT_STUB };
        coordsStub = {
            initialTopLeft: TOP_LEFT_CORNER_COORDS,
            initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
            finalTopLeft: TOP_LEFT_CORNER_COORDS,
            finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        };
        service.selectedPointIndex = SelectedPoint.NO_POINT;
        service.checkIfAControlPointHasBeenSelected(posBottomRightStub, coordsStub, false);
        expect(service.selectedPointIndex).toEqual(SelectedPoint.NO_POINT);
    });

    it('#checkIfAControlPointHasBeenSelected should return the right point', () => {
        const posBottomRightStub = BOTTOM_RIGHT_CORNER_COORDS;
        service.checkIfAControlPointHasBeenSelected(posBottomRightStub, coordsStub, false);
        expect(service.selectedPointIndex).toEqual(SelectedPoint.BOTTOM_RIGHT);
    });

    it('#checkIfAControlPointHasBeenSelected should not upadte selectedPoint if its a preview ', () => {
        const posBottomRightStub = BOTTOM_RIGHT_CORNER_COORDS;
        service.checkIfAControlPointHasBeenSelected(posBottomRightStub, coordsStub, true);
        expect(service.selectedPointIndex).toEqual(SelectedPoint.NO_POINT);
    });
});
