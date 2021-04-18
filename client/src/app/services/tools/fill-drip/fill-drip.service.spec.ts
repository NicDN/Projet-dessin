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

fdescribe('FillDripService', () => {
    let service: FillDripService;
    let mouseEvent: MouseEvent;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let searchedPixels: boolean[];

    const DEFAULT_MOUSE_POS = { x: 0, y: 0 } as Vec2;
    const PIXELS: number[] = [];
    for (let i = 0; i < 4 * 9; i++) {
        if (i < 4) PIXELS.push(0);
        else PIXELS.push(255);
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
        canvasTestHelper.canvas.width = 3;
        canvasTestHelper.canvas.height = 3;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['colorService'].mainColor.rgbValue = 'rgb(100,100,100)';
        service['colorService'].mainColor.opacity = 0.5;
        service['lowerLimit'] = new Uint8ClampedArray([0, 0, 0]);
        service['higherLimit'] = new Uint8ClampedArray([255, 255, 255]);
        service.percentage = 0.5;
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
        expect(service.registerFillDripCommand).toHaveBeenCalledWith(DEFAULT_MOUSE_POS, true);
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
        expect(service.registerFillDripCommand).toHaveBeenCalledWith(DEFAULT_MOUSE_POS, false);
    });

    // it('#registerFillDripCommand should create and add a new command', () => {
    //     spyOn<any>(baseCtxStub, 'getImageData').and.stub();
    //     spyOn<any>(service, 'loadFillDripPropreties').and.stub();
    //     spyOnProperty(FillDripCommand, 'execute', 'void');

    //     service.registerFillDripCommand(DEFAULT_MOUSE_POS, true);
    //     expect(baseCtxStub.getImageData).toHaveBeenCalled();
    //     expect(service.loadFillDripPropreties).toHaveBeenCalled();
    //     expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
    // });

    it('#loadFillDripProperties should return a filled struct', () => {
        const img: ImageData = {} as ImageData;
        const EXPECTED_PROPERTIES = {
            ctx: baseCtxStub,
            data: img,
            mousePosition: DEFAULT_MOUSE_POS,
            isContiguous: true,
            mainColor: service['mainColor'],
            percentage: service.percentage,
            higherLimit: service['higherLimit'],
            lowerLimit: service['lowerLimit'],
        };

        expect(service.loadFillDripPropreties(true, DEFAULT_MOUSE_POS, img)).toEqual(EXPECTED_PROPERTIES as FillDripProperties);
    });

    it('should update the higherLimit and the lowerLimit when #getColorRange is called', () => {
        const imgData = new ImageData(1, 1);
        imgData.data.set([100, 100, 100]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([50, 50, 50]);
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([178, 178, 178]);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#getColorRange should update the limits correctly with white current color', () => {
        const imgData = new ImageData(1, 1);
        imgData.data.set([255, 255, 255]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([128, 128, 128]);
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([255, 255, 255]);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#getColorRange should update the limits correctly with black current color', () => {
        const imgData = new ImageData(1, 1);
        imgData.data.set([0, 0, 0]);
        spyOn<any>(baseCtxStub, 'getImageData').and.returnValue(imgData);

        const EXPECTED_LOWER_LIMIT = new Uint8ClampedArray([0, 0, 0]);
        const EXPECTED_HIGHER_LIMIT = new Uint8ClampedArray([128, 128, 128]);

        service['getColorRange'](DEFAULT_MOUSE_POS);
        expect(service['lowerLimit']).toEqual(EXPECTED_LOWER_LIMIT);
        expect(service['higherLimit']).toEqual(EXPECTED_HIGHER_LIMIT);
    });

    it('#updateMainColor should update this.mainColor with the mainColor of colorService', () => {
        const EXPECTED_COLOR = new Uint8ClampedArray([100, 100, 100, 128]);
        service['mainColor'] = new Uint8ClampedArray([0, 0, 0]);

        service['updateMainColor']();
        expect(service['mainColor']).toEqual(EXPECTED_COLOR);
    });

    it('#inRange should return true when the colorData is between the limits', () => {
        const COLOR = new Uint8ClampedArray([100, 100, 100]);
        const LOWER_LIMIT = new Uint8ClampedArray([90, 90, 90]);
        const HIGHER_LIMIT = new Uint8ClampedArray([110, 110, 110]);

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeTrue();
    });

    it('#inRange should return false when the colorData isnt between the limits', () => {
        const COLOR = new Uint8ClampedArray([100, 100, 100]);
        const LOWER_LIMIT = new Uint8ClampedArray([105, 105, 105]);
        const HIGHER_LIMIT = new Uint8ClampedArray([110, 110, 110]);

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeFalse();
    });

    it('#inRange should return true when the colorData is at the limit', () => {
        const COLOR = new Uint8ClampedArray([100, 100, 100]);
        const LOWER_LIMIT = new Uint8ClampedArray([100, 100, 100]);
        const HIGHER_LIMIT = new Uint8ClampedArray([110, 110, 110]);

        expect(service['inRange'](COLOR, HIGHER_LIMIT, LOWER_LIMIT)).toBeTrue();
    });

    it('#nonContigousFilling should fill all white space with red', () => {});

    it('should return true when areEqualColors receive two equivalent colors', () => {
        const COLOR = new Uint8ClampedArray([67, 40, 110]);
        const EXPECTED_COLOR = new Uint8ClampedArray([67, 40, 110]);

        expect(service['areEqualColors'](COLOR, EXPECTED_COLOR)).toBeTrue();
    });

    it('should return false when areEqualColors receive two differents colors', () => {
        const COLOR = new Uint8ClampedArray([200, 40, 110]);
        const EXPECTED_COLOR = new Uint8ClampedArray([67, 40, 110]);

        expect(service['areEqualColors'](COLOR, EXPECTED_COLOR)).toBeFalse();
    });

    it('#contigousFilling should fill the top left pixel with red', () => {
        spyOn<any>(service, 'getValidNeighbors').and.stub();
        const EXPECTED_PIXELS: number[] = [];
        for (let i = 0; i < 4 * 9; i++) {
            EXPECTED_PIXELS.push(255);
        }
        EXPECTED_PIXELS[1] = 0;
        EXPECTED_PIXELS[2] = 0;
        const EXPECTED_IMAGE_DATA = new Uint8ClampedArray(EXPECTED_PIXELS);

        const img: ImageData = new ImageData(3, 3);
        img.data.set(PIXELS_DATA);
        const properties: FillDripProperties = {
            ctx: baseCtxStub,
            data: img,
            mousePosition: DEFAULT_MOUSE_POS,
            isContiguous: true,
            mainColor: new Uint8ClampedArray([255, 0, 0, 255]),
            percentage: service['percentage'],
            higherLimit: service['higherLimit'],
            lowerLimit: service['lowerLimit'],
        };

        service.contiguousFilling(properties);
        console.log(baseCtxStub.getImageData(0, 0, 3, 3));
        expect(baseCtxStub.getImageData(0, 0, 3, 3).data).toEqual(EXPECTED_IMAGE_DATA);
    });

    it('should return all validNeighbors of a point in the canvas', () => {
        const EXPECTED_NEIGHBORS: number[] = [4, 3, 5, 1, 7];
        const neighbors: number[] = [4]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(neighbors).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return 3 neighbors if the point is on the edge of the canvas', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([1, 0, 2, 4]);
        const neighbors: number[] = [1]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return 2 neighbors if the point is in the corner of a canvas', () => {
        const EXPECTED_NEIGHBORS: number[] = [0, 1, 3];
        const neighbors: number[] = [0]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(neighbors).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neighbors if one of them isnt in the color range', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([4]);
        const neighbors: number[] = [4]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(false);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neigbors if one of them is already the good color', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([4]);
        const neighbors: number[] = [4]; // on cherche les voisins du centre

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(true);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });

    it('should return less than 4 neighbors if one of them has already been searched', () => {
        const EXPECTED_NEIGHBORS: Uint8ClampedArray = new Uint8ClampedArray([4, 5, 7]);
        const neighbors: number[] = [4]; // on cherche les voisins du centre
        searchedPixels = [false, true, false, true, false, false, false, false, false];

        spyOn<any>(service, 'inRange').and.returnValue(true);
        spyOn<any>(service, 'areEqualColors').and.returnValue(false);

        service['getValidNeighbors'](PIXELS_DATA, neighbors, searchedPixels, service['mainColor'], service['higherLimit'], service['lowerLimit']);
        expect(new Uint8ClampedArray(neighbors)).toEqual(EXPECTED_NEIGHBORS);
    });
});
