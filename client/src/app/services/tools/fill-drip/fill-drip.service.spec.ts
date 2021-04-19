// tslint:disable: no-any
// tslint:disable: no-string-literal
import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FillDripProperties } from '@app/classes/commands/fill-drip-command/fill-drip-command';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { FillDripService } from './fill-drip.service';

describe('FillDripService', () => {
    let service: FillDripService;
    let mouseEvent: MouseEvent;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let searchedPixels: boolean[];
    let properties: FillDripProperties;

    const MAX_RGB_VALUE = 255;
    const VALUES_PER_PIXEL = 4;

    const RED_PIXEL = new Uint8ClampedArray([MAX_RGB_VALUE, 0, 0, MAX_RGB_VALUE]);
    const WHITE_PIXEL = new Uint8ClampedArray([MAX_RGB_VALUE, MAX_RGB_VALUE, MAX_RGB_VALUE, MAX_RGB_VALUE]);
    const BLACK_PIXEL = new Uint8ClampedArray([0, 0, 0, 0]);
    const GRAY_PIXEL = new Uint8ClampedArray([MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2]);

    const CANVAS_WIDTH = 3;
    const CANVAS_HEIGHT = 3;

    const HALF_OPACITY = 0.5;

    const CENTER_POS = 4;

    const DEFAULT_MOUSE_POS = { x: 0, y: 0 } as Vec2;
    const PIXELS: number[] = [];
    for (let i = 0; i < VALUES_PER_PIXEL * CANVAS_WIDTH * CANVAS_HEIGHT; i++) {
        PIXELS.push(MAX_RGB_VALUE);
    }
    const PIXELS_DATA: Uint8ClampedArray = new Uint8ClampedArray(PIXELS);

    beforeEach(() => {
        searchedPixels = [false, false, false, false, false, false, false, false, false];

        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand', 'enableUndoRedo', 'disableUndoRedo']);
        TestBed.configureTestingModule({
            providers: [
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: MatBottomSheet, useValue: {} },
            ],
        });
        service = TestBed.inject(FillDripService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasTestHelper.canvas.width = CANVAS_WIDTH;
        canvasTestHelper.canvas.height = CANVAS_HEIGHT;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['colorService'].mainColor.rgbValue = 'rgb(100,100,100)';
        service['colorService'].mainColor.opacity = HALF_OPACITY;
        service['lowerLimit'] = BLACK_PIXEL;
        service['higherLimit'] = WHITE_PIXEL;
        service.acceptancePercentage = HALF_OPACITY;

        const img: ImageData = new ImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        img.data.set(PIXELS_DATA);
        properties = {
            ctx: baseCtxStub,
            data: img,
            mousePosition: DEFAULT_MOUSE_POS,
            isContiguous: true,
            mainColor: RED_PIXEL,
            acceptancePercentage: service.acceptancePercentage,
            higherLimit: service['higherLimit'],
            lowerLimit: service['lowerLimit'],
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should early return when #mouseDown is called without a mouse click', () => {
        mouseEvent = { button: MouseButton.Middle } as MouseEvent;
        spyOn<any>(service, 'getPositionFromMouse');

        service.onMouseDown(mouseEvent);
        expect(service.getPositionFromMouse).not.toHaveBeenCalled();
    });

    it('should call registerFillDripCommand with true when #mouseDown is called with a left click', () => {
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue(DEFAULT_MOUSE_POS);
        spyOn<any>(service, 'updateMainColor').and.stub();
        spyOn<any>(service, 'getColorRange').and.stub();
        spyOn<any>(service, 'registerFillDripCommand').and.stub();

        service.onMouseDown(mouseEvent);
        expect(service.getPositionFromMouse).toHaveBeenCalled();
        expect(service['updateMainColor']).toHaveBeenCalled();
        expect(service['getColorRange']).toHaveBeenCalled();
        expect(service['registerFillDripCommand']).toHaveBeenCalledWith(DEFAULT_MOUSE_POS, true);
    });

    it('should call registerFillDripCommand with false when #mouseDown is called with a right click', () => {
        mouseEvent = { button: MouseButton.Right } as MouseEvent;
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue(DEFAULT_MOUSE_POS);
        spyOn<any>(service, 'updateMainColor').and.stub();
        spyOn<any>(service, 'getColorRange').and.stub();
        spyOn<any>(service, 'registerFillDripCommand').and.stub();

        service.onMouseDown(mouseEvent);
        expect(service.getPositionFromMouse).toHaveBeenCalled();
        expect(service['updateMainColor']).toHaveBeenCalled();
        expect(service['getColorRange']).toHaveBeenCalled();
        expect(service['registerFillDripCommand']).toHaveBeenCalledWith(DEFAULT_MOUSE_POS, false);
    });

    it('#registerFillDripCommand should create and add a new command', () => {
        spyOn<any>(baseCtxStub, 'getImageData').and.stub();
        spyOn<any>(service, 'loadFillDripPropreties').and.returnValue(properties);

        service['registerFillDripCommand'](DEFAULT_MOUSE_POS, true);
        expect(baseCtxStub.getImageData).toHaveBeenCalled();
        expect(service['loadFillDripPropreties']).toHaveBeenCalled();
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
    });

    it('#loadFillDripProperties should return a filled struct', () => {
        const img: ImageData = {} as ImageData;
        const EXPECTED_PROPERTIES = {
            ctx: baseCtxStub,
            data: img,
            mousePosition: DEFAULT_MOUSE_POS,
            isContiguous: true,
            mainColor: service['mainColor'],
            acceptancePercentage: service.acceptancePercentage,
            higherLimit: service['higherLimit'],
            lowerLimit: service['lowerLimit'],
        };

        expect(service['loadFillDripPropreties'](true, DEFAULT_MOUSE_POS, img)).toEqual(EXPECTED_PROPERTIES as FillDripProperties);
    });

    it('should update the higherLimit and the lowerLimit when #getColorRange is called', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([50, 75, 100]);
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([178, 202, 228]);

        const imgData = new ImageData(1, 1);
        // tslint:disable-next-line: no-magic-numbers
        imgData.data.set([100, 150, 200]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#getColorRange should update the limits correctly with white current color', () => {
        const imgData = new ImageData(1, 1);
        imgData.data.set([MAX_RGB_VALUE, MAX_RGB_VALUE, MAX_RGB_VALUE]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2]);
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([MAX_RGB_VALUE, MAX_RGB_VALUE, MAX_RGB_VALUE]);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#getColorRange should update the limits correctly with black current color', () => {
        const imgData = new ImageData(1, 1);
        imgData.data.set([0, 0, 0]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([0, 0, 0]);
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2, MAX_RGB_VALUE / 2]);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#updateMainColor should update this.mainColor with the mainColor of colorService', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_COLOR = new Uint8ClampedArray([100, 100, 100, 128]);
        service['mainColor'] = new Uint8ClampedArray([0, 0, 0]);

        service['updateMainColor']();
        expect(service['mainColor']).toEqual(EXPECTED_COLOR);
    });

    it('#inRange should return true when the colorData is between the limits', () => {
        const COLOR = GRAY_PIXEL;
        const LOWER_LIMIT = BLACK_PIXEL;
        const HIGHER_LIMIT = WHITE_PIXEL;

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeTrue();
    });

    it('#inRange should return false when the colorData isnt between the limits', () => {
        const COLOR = RED_PIXEL;
        const LOWER_LIMIT = GRAY_PIXEL;
        const HIGHER_LIMIT = WHITE_PIXEL;

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeFalse();
    });

    it('#inRange should return true when the colorData is at the limit', () => {
        const COLOR = GRAY_PIXEL;
        const LOWER_LIMIT = GRAY_PIXEL;
        const HIGHER_LIMIT = WHITE_PIXEL;

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeTrue();
    });

    it('#nonContigousFilling should fill all white space with red', () => {
        spyOn<any>(service, 'inRange').and.returnValue(true);

        const EXPECTED_PIXELS: number[] = [];
        for (let i = 0; i < VALUES_PER_PIXEL * CANVAS_WIDTH * CANVAS_HEIGHT; i++) EXPECTED_PIXELS.push(MAX_RGB_VALUE);
        const EXPECTED_IMAGE_DATA = new Uint8ClampedArray(EXPECTED_PIXELS);
        for (let i = 0; i < CANVAS_WIDTH * CANVAS_HEIGHT; i++) EXPECTED_IMAGE_DATA.set(RED_PIXEL, i * VALUES_PER_PIXEL);

        service.nonContiguousFilling(properties);
        expect(baseCtxStub.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data).toEqual(EXPECTED_IMAGE_DATA);
    });

    it('#nonContigousFilling should fill no pixel if inRange return only falses', () => {
        spyOn<any>(service, 'inRange').and.returnValue(false);

        const EXPECTED_PIXELS: number[] = [];
        for (let i = 0; i < VALUES_PER_PIXEL * CANVAS_WIDTH * CANVAS_HEIGHT; i++) EXPECTED_PIXELS.push(MAX_RGB_VALUE);
        const EXPECTED_IMAGE_DATA = new Uint8ClampedArray(EXPECTED_PIXELS);

        service.nonContiguousFilling(properties);
        expect(baseCtxStub.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data).toEqual(EXPECTED_IMAGE_DATA);
    });

    it('should return true when areEqualColors receive two equivalent colors', () => {
        expect(service['areEqualColors'](GRAY_PIXEL, GRAY_PIXEL)).toBeTrue();
    });

    it('should return false when areEqualColors receive two differents colors', () => {
        expect(service['areEqualColors'](GRAY_PIXEL, RED_PIXEL)).toBeFalse();
    });

    it('#contigousFilling should fill the top left pixel with red', () => {
        spyOn<any>(service, 'getValidNeighbors').and.stub();

        properties.data.data.set(new Uint8ClampedArray([0, 0, 0, 0]), 0);
        const EXPECTED_PIXELS: number[] = [];
        for (let i = 0; i < VALUES_PER_PIXEL * CANVAS_WIDTH * CANVAS_HEIGHT; i++) EXPECTED_PIXELS.push(MAX_RGB_VALUE);
        const EXPECTED_IMAGE_DATA = new Uint8ClampedArray(EXPECTED_PIXELS);
        EXPECTED_IMAGE_DATA.set(RED_PIXEL, 0);

        service.contiguousFilling(properties);
        expect(baseCtxStub.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data).toEqual(EXPECTED_IMAGE_DATA);
    });

    it('should return all validNeighbors of a point in the canvas', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_NEIGHBORS: number[] = [CENTER_POS, 3, 5, 1, 7];
        const neighbors: number[] = [CENTER_POS]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(neighbors).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return 3 neighbors if the point is on the edge of the canvas', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([1, 0, 2, 4]);
        const neighbors: number[] = [1]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return 2 neighbors if the point is in the corner of a canvas', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_NEIGHBORS: number[] = [0, 1, 3];
        const neighbors: number[] = [0]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(neighbors).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neighbors if one of them isnt in the color range', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([CENTER_POS]);
        const neighbors: number[] = [CENTER_POS]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(false);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neigbors if one of them is already the good color', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([CENTER_POS]);
        const neighbors: number[] = [CENTER_POS]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(true);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neighbors if one of them has already been searched', () => {
        // tslint:disable-next-line: no-magic-numbers
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([CENTER_POS, 5, 7]);
        const neighbors: number[] = [CENTER_POS]; // on cherche les voisins du centre
        searchedPixels = [false, true, false, true, false, false, false, false, false];

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });
});
