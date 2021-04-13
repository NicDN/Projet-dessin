// tslint:disable: no-any
// tslint:disable: no-string-literal
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet-selection.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ClipboardSelectionService } from './clipboard-selection.service';

// tslint:disable: max-file-line-count
describe('ClipboardService', () => {
    let service: ClipboardSelectionService;
    let toolServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    let resizeSelectionServiceSpyObj: jasmine.SpyObj<ResizeSelectionService>;
    let magnetSelectionServiceSpyObj: jasmine.SpyObj<MagnetSelectionService>;
    // tslint:disable-next-line: prefer-const
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let lineServiceSpyObj: jasmine.SpyObj<LineService>;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let rectangleSelectionServiceStub: RectangleSelectionService;
    let ellipseSelectionServiceStub: EllipseSelectionService;
    let lassoSelectionServiceStub: LassoSelectionService;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };

    const coordsStub = {
        initialTopLeft: TOP_LEFT_CORNER_COORDS,
        initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        finalTopLeft: TOP_LEFT_CORNER_COORDS,
        finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
    };

    const pathStub: Vec2 = { x: 1, y: 1 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub];
    const firstPointOffSetStub: Vec2 = { x: 1, y: 1 };

    beforeEach(() => {
        toolServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['fillWithWhite', 'clearCanvas']);
        resizeSelectionServiceSpyObj = jasmine.createSpyObj('ResizeSelectionService', ['']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['']);
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', ['']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo']);
        lineServiceSpyObj = jasmine.createSpyObj('LineService', ['clearPath']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['']);
        magnetSelectionServiceSpyObj = jasmine.createSpyObj('MagnetSelectionService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ToolsService, useValue: toolServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ResizeSelectionService, useValue: resizeSelectionServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: SnackBarService, useValue: snackbarServiceSpy },
                { provide: ColorService, useValue: colorServiceSpyObj },
            ],
        });

        toolServiceSpyObj.lineService = new LineService(drawingServiceSpyObj, colorServiceSpyObj, undoRedoServiceSpyObj);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        drawingServiceSpyObj.baseCtx = baseCtxStub;
        drawingServiceSpyObj.previewCtx = previewCtxStub;

        service = TestBed.inject(ClipboardSelectionService);

        rectangleSelectionServiceStub = new RectangleSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionServiceSpyObj,
            magnetSelectionServiceSpyObj,
        );

        ellipseSelectionServiceStub = new EllipseSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionServiceSpyObj,
            magnetSelectionServiceSpyObj,
        );

        lassoSelectionServiceStub = new LassoSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionServiceSpyObj,
            toolServiceSpyObj.lineService,
            magnetSelectionServiceSpyObj,
        );
        toolServiceSpyObj.rectangleSelectionService = rectangleSelectionServiceStub;
        toolServiceSpyObj.ellipseSelectionService = ellipseSelectionServiceStub;
        toolServiceSpyObj.lassoSelectionService = lassoSelectionServiceStub;
        service['toolsService'].currentTool = rectangleSelectionServiceStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#switchToStoredClipboardImageSelectionTool should switch to the tool with the appropriate type', () => {
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Ellipse,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.clipBoardData.selectionType = SelectionType.Rectangle;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.rectangleSelectionService);

        service.clipBoardData.selectionType = SelectionType.Ellipse;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.ellipseSelectionService);

        service.clipBoardData.selectionType = SelectionType.Lasso;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.lassoSelectionService);
    });

    it('#canUseClipBoardService should return true if the current tool is a selection tool instance and if a selection exists', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        rectangleSelectionServiceStub.selectionExists = true;
        expect(service.canUseClipboardService()).toBeTrue();
    });

    it('#canUseClipBoardService should return false if the current tool is not a selection tool instance and if a selection exists', () => {
        toolServiceSpyObj.currentTool = toolServiceSpyObj.pencilService;
        rectangleSelectionServiceStub.selectionExists = true;
        expect(service.canUseClipboardService()).toBeFalse();
    });

    it('#canUseClipBoardService should return false if the current tool is selection tool instance and if a selection doesnt exists', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        rectangleSelectionServiceStub.selectionExists = false;
        expect(service.canUseClipboardService()).toBeFalse();
    });

    it('#getSelectionType should return selection type rectangle if the current tool is a rectangleSelection', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Rectangle);
    });

    it('#checkSelectionType should return selection type ellipse if the current tool is a ellipseSelection', () => {
        toolServiceSpyObj.currentTool = ellipseSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Ellipse);
    });

    it('#checkSelectionType should return selection type rectangle if the current tool is a lassoSelection', () => {
        toolServiceSpyObj.currentTool = lassoSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Lasso);
    });

    it('#checkSelectionType should return selection type none if the current tool is not a selection tool', () => {
        toolServiceSpyObj.currentTool = toolServiceSpyObj.pencilService;
        expect(service['getSelectionType']()).toEqual(SelectionType.None);
    });

    it('#cut should call copy and delete from the service', () => {
        const copySpy = spyOn(service, 'copy');
        const deleteSpy = spyOn(service, 'delete');
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('#deleteCurrentSelectionService should call the clearCanvas from drawingService', () => {
        service['toolsService'].currentTool = rectangleSelectionServiceStub;
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        (service['toolsService'].currentTool as SelectionTool).data = service.clipBoardData.clipboardImage;
        service['deleteCurrentSelection']();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('setAsideInitialCoords should set aside initialCoords', () => {
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };

        service['setAsideInitialCoords']();
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialTopLeft).toEqual({
            x: service['outsideDrawingZoneCoords'],
            y: service['outsideDrawingZoneCoords'],
        });
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialBottomRight).toEqual({
            x: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.width,
            y: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.height,
        });
    });

    it('#delete should cancel selection', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        const cancelSelectionSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'cancelSelection');
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        service.delete();
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#delete if current tool is a lasso service, should call the clear path and set isShift down to false of lineservice', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        spyOn<any>(service, 'deleteCurrentSelection').and.returnValues();
        spyOn<any>(service, 'moveInitialCoordsToCountAsAction').and.returnValues();

        const localSpyObjectToolsService = jasmine.createSpyObj<ToolsService>('ToolsService', ['setCurrentTool'], {
            lassoSelectionService: lassoSelectionServiceStub,
            lineService: lineServiceSpyObj,
            currentTool: lassoSelectionServiceStub,
        });
        service['toolsService'] = localSpyObjectToolsService;
        spyOn(service['toolsService'].lassoSelectionService, 'cancelSelection').and.returnValue();
        service.delete();
        expect(lineServiceSpyObj.clearPath).toHaveBeenCalled();
    });

    it('#delete should set all the pixels of the image to white', () => {
        const whiteRGB = 255;
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        service.delete();
        let opacity = true;
        let red = true;
        let green = true;
        let blue = true;
        const pixelSize = 4;
        const globalAlphaPosition = 3;
        for (let index = 0; index < (toolServiceSpyObj.currentTool as SelectionTool).data.data.length; index += pixelSize) {
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index] !== 0) red = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + 1] !== 0) green = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + 2] !== 0) blue = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + globalAlphaPosition] !== whiteRGB) opacity = false;
        }
        expect(opacity).toBeTrue();
        expect(red).toBeTrue();
        expect(green).toBeTrue();
        expect(blue).toBeTrue();
    });

    it('#paste should change the data in selection tool with the one in clipboard selection service', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        drawingServiceSpyObj.previewCtx.fillStyle = 'green';
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).data).toBe(service.clipBoardData.clipboardImage);
    });

    it('#paste should call the switch to stored clipboard image selection tool and the drawAll method from the current tool ( if it is a selection tool', () => {
        const drawAllSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool').and.returnValues();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.paste();
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(switchToolSpy).toHaveBeenCalled();
    });

    it('#paste should not change path data if lineService is undefined', () => {
        const drawAllSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool').and.returnValues();
        // tslint:disable-next-line: prefer-const
        let undefinedTmp: any;
        service['toolsService'].lineService = undefinedTmp;
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.paste();
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(switchToolSpy).toHaveBeenCalled();
    });

    it('#paste should change path data if SelectionType is Lasso is undefined', () => {
        const drawAllSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool').and.returnValues();
        service['toolsService'].lassoSelectionService.firstPointOffset = { x: 1, y: 1 };
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Lasso,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.paste();
        expect(service['toolsService'].lassoSelectionService.firstPointOffset).toEqual(service.clipBoardData.firstPointOffSet);
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(switchToolSpy).toHaveBeenCalled();
    });

    it('#paste should set selection exist of current tool to true', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        (toolServiceSpyObj.currentTool as SelectionTool).selectionExists = false;
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).selectionExists).toBeTrue();
    });

    it('#paste should not paste if clipboard there are no images', () => {
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool');
        service.paste();
        expect(switchToolSpy).not.toHaveBeenCalled();
    });

    it('#paste should set selection exist of current tool to true', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'cancelSelection').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        (toolServiceSpyObj.currentTool as SelectionTool).selectionExists = true;
        service.paste();
        expect(switchSpy).toHaveBeenCalled();
    });

    it('#paste should not paste if clipboard there are no images', () => {
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool');
        service.paste();
        expect(switchToolSpy).not.toHaveBeenCalled();
    });

    it('#paste should put selection in the upper right corner', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalTopLeft).toEqual({
            x: service['pasteOffSet'],
            y: service['pasteOffSet'],
        });
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalBottomRight).toEqual({
            x:
                service['pasteOffSet'] +
                service.clipBoardData.selectionCoords.finalBottomRight.x -
                service.clipBoardData.selectionCoords.finalTopLeft.x,
            y:
                service['pasteOffSet'] +
                service.clipBoardData.selectionCoords.finalBottomRight.y -
                service.clipBoardData.selectionCoords.finalTopLeft.y,
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialTopLeft).toEqual({
            x: service['outsideDrawingZoneCoords'],
            y: service['outsideDrawingZoneCoords'],
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialBottomRight).toEqual({
            x: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.width,
            y: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.height,
        });
    });

    it('#copy should change the current clipboard image', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        drawingServiceSpyObj.previewCtx.fillStyle = 'green';
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
            selectionCoords: coordsStub,
            selectionPathData: pathArrayStub,
            firstPointOffSet: firstPointOffSetStub,
        };
        service.copy();

        expect(service.clipBoardData.clipboardImage).toBe((toolServiceSpyObj.currentTool as SelectionTool).data);
    });

    it('#copy should not copy there are no selection active', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(false);
        const checkSelectionType = spyOn<any>(service, 'getSelectionType');
        service.copy();
        expect(checkSelectionType).not.toHaveBeenCalled();
    });

    it('#setFinalCoordsOfStoredImage should put final coords to the right position', () => {
        const TMP_COORDS = 90;
        service['setFinalCoordsOfStoredImage'](TMP_COORDS, TMP_COORDS);

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalBottomRight).toEqual({
            x: 100,
            y: 100,
        });
    });

    it('#setFinalCoordsOfStoredImage should put final coords to the right position if width and height < 0', () => {
        const TMP_COORDS = 90;
        service['setFinalCoordsOfStoredImage'](-TMP_COORDS, -TMP_COORDS);

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalTopLeft).toEqual({
            x: 100,
            y: 100,
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalBottomRight).toEqual({
            x: 10,
            y: 10,
        });
    });

    it('#loadFirstPointOffSet should change the firstPointOffSet of selectionService ', () => {
        lassoSelectionServiceStub.firstPointOffset = { x: 1, y: 1 };
        const localSpyObjectToolsService = jasmine.createSpyObj<ToolsService>('ToolsService', ['setCurrentTool'], {
            lassoSelectionService: lassoSelectionServiceStub,
            lineService: lineServiceSpyObj,
            currentTool: lassoSelectionServiceStub,
        });
        service['toolsService'] = localSpyObjectToolsService;
        const result = service['loadFirstPointOffSet']();
        expect(result).toEqual({ x: 1, y: 1 });
    });
});
