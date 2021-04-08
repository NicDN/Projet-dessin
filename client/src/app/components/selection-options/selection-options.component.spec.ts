// tslint:disable: no-any
// tslint:disable: no-string-literal
/*describe('SelectionOptionsComponent', () => {
    let component: SelectionOptionsComponent;
    let fixture: ComponentFixture<SelectionOptionsComponent>;

    let toolServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let clipboardSelectionServiceSpyObj: jasmine.SpyObj<ClipboardSelectionService>;

    let rectangleSelectionServiceSpyObj: jasmine.SpyObj<RectangleSelectionService>;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionService: jasmine.SpyObj<MoveSelectionService>;

    let rectangleSelectionServiceStub: RectangleSelectionService;
    let ellipseSelectionServiceStub: EllipseSelectionService;
    let lassoSelectionServiceStub: LassoSelectionService;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let imageStub: ImageData;

    beforeEach(async(() => {
        toolServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        clipboardSelectionServiceSpyObj = jasmine.createSpyObj('ClipboardSelectionService', ['canUseClipboardService']);

        rectangleSelectionServiceSpyObj = jasmine.createSpyObj('RectangleSelectionService', ['selectAll']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['fillWithWhite', 'clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo']);
        moveSelectionService = jasmine.createSpyObj('MoveSelectionService', ['']);

        TestBed.configureTestingModule({
            declarations: [SelectionOptionsComponent],
            providers: [
                { provide: RectangleSelectionService, useValue: rectangleSelectionServiceSpyObj },
                { provide: ToolsService, useValue: toolServiceSpyObj },
                { provide: ClipboardSelectionService, useValue: clipboardSelectionServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        rectangleSelectionServiceStub = new RectangleSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        ellipseSelectionServiceStub = new EllipseSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        lassoSelectionServiceStub = new LassoSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );
        toolServiceSpyObj.rectangleSelectionService = rectangleSelectionServiceStub;
        toolServiceSpyObj.ellipseSelectionService = ellipseSelectionServiceStub;
        toolServiceSpyObj.lassoSelectionService = lassoSelectionServiceStub;
        toolServiceSpyObj.currentTool = toolServiceSpyObj.rectangleSelectionService;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub.fillRect(0, 0, 1, 1);
        imageStub = baseCtxStub.getImageData(0, 0, 1, 1);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#selectionIsActive should return false if there are no selection in process', () => {
        clipboardSelectionServiceSpyObj.canUseClipboardService.and.returnValue(false);
        expect(component.selectionIsActive()).toBeFalse();
    });

    it('#selectionIsActive should return true if there is a selection in process', () => {
        clipboardSelectionServiceSpyObj.canUseClipboardService.and.returnValue(true);
        expect(component.selectionIsActive()).toBeTrue();
    });

    it('#selectAll should change the current tool to rectangleSelectionService', () => {
        component.selectAll();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalled();
        expect(toolServiceSpyObj.currentTool).toBe(toolServiceSpyObj.rectangleSelectionService);
    });

    it('#selectAll should call the select all method from rectangle selection service', () => {
        component.selectAll();
        expect(rectangleSelectionServiceSpyObj.selectAll).toHaveBeenCalled();
    });

    it('# can paste should return false if the clipboard is undefined', () => {
        // tslint:disable-next-line: prefer-const
        let undefinedImage: any;
        clipboardSelectionServiceSpyObj.clipBoardData = undefinedImage;
        expect(component.canPaste()).toBeFalse();
    });

    it('#can paste should return true if the clipboard is defined', () => {
        clipboardSelectionServiceSpyObj.clipBoardData = {
            clipboardImage: imageStub,
            selectionType: SelectionType.Rectangle,
        };
        expect(component.canPaste()).toBeTrue();
    });
});*/
