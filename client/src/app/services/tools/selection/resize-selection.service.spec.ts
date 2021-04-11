import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SelectedPoint } from './move-selection.service';
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

    const coordsStub = {
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

    it('#resizeSelection should resizeCoords if TOP_LEFT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.TOP_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if TOP_MIDDLE has been selected', () => {
        service.selectedPointIndex = SelectedPoint.TOP_MIDDLE;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if TOP_RIGHT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.TOP_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
        expect(coordsStub.finalTopLeft.y).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if MIDDLE_LEFT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.MIDDLE_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if MIDDLE_RIGHT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.MIDDLE_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if BOTTOM_LEFT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalTopLeft.x).toEqual(expectedCoords);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if BOTTOM_MIDDLE has been selected', () => {
        service.selectedPointIndex = SelectedPoint.BOTTOM_MIDDLE;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
    });

    it('#resizeSelection should resizeCoords if BOTTOM_RIGHT has been selected', () => {
        service.selectedPointIndex = SelectedPoint.BOTTOM_RIGHT;
        service.resizeSelection(posStub, coordsStub);
        expect(coordsStub.finalBottomRight.y).toEqual(expectedCoords);
        expect(coordsStub.finalBottomRight.x).toEqual(expectedCoords);
    });

    it('#resizeSelection top_left should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        service.selectedPointIndex = SelectedPoint.TOP_LEFT;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service.resizeSelection(posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#resizeSelection top_right should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        service.selectedPointIndex = SelectedPoint.TOP_RIGHT;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service.resizeSelection(posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#resizeSelection bottom_right should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        service.selectedPointIndex = SelectedPoint.BOTTOM_RIGHT;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service.resizeSelection(posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#resizeSelection with bottom_left should call the find distance and find end coords', () => {
        service.shiftKeyIsDown = true;
        service.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        const findEndCoordsSpy = spyOn<any>(service, 'findEndCoords').and.returnValue(BOTTOM_RIGHT_CORNER_COORDS);
        service.resizeSelection(posStub, coordsStub);
        expect(findEndCoordsSpy).toHaveBeenCalled();
    });

    it('#findDistance should change the width if it is equal to 0', () => {
        service.lastDimensions = { x: widthStub, y: heightStub };
        const result = service['findDistance'](posStub, offSetXStub, 0, heightStub);
        expect(result.x).toEqual(expectedResult);
    });

    it('#findDistance should change the height if it is equal to 0', () => {
        service.lastDimensions = { x: 100, y: 100 };
        const result = service['findDistance'](posStub, offSetXStub, widthStub, 0);
        expect(result.y).toEqual(expectedResult);
    });

    it('#findDistance should find the right distance', () => {
        const result = service['findDistance'](posStub, offSetXStub, widthStub, heightStub);
        expect(result.y).toEqual(expectedResult);
        expect(result.x).toEqual(expectedResult);
    });

    it('#findEndCoords should return the appropriate end coords', () => {
        const coordsXStub = 80;
        const coordsYStub = 80;
        spyOn<any>(service, 'findDistance').and.returnValue({ x: 10, y: 10 });
        const result = service['findEndCoords'](posStub, coordsXStub, coordsYStub, heightStub, widthStub);
        expect(result.x).toEqual(expectedResult);
        expect(result.y).toEqual(expectedResult);
    });

    it('#checkIfAControlPointHasBeenSelected should return the right point, should be no point if no point is selected', () => {
        const posBottomRightStub = { x: -1, y: -1 };
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
