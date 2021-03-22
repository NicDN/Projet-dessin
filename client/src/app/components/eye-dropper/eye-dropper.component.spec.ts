import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { of } from 'rxjs';
import { EyeDropperComponent } from './eye-dropper.component';

// tslint:disable: no-string-literal no-any
describe('EyeDropperComponent', () => {
    let component: EyeDropperComponent;
    let fixture: ComponentFixture<EyeDropperComponent>;
    let mouseEvent: MouseEvent;
    let eyeDropperServiceSpyObj: jasmine.SpyObj<EyeDropperService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;

    const PRIMARY_COLOR_STUB = 'black';
    const SECONDARY_COLOR_STUB = 'white';
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const OPACITY_STUB = 1;

    const CANVAS_DEFAULT_WIDTH = 10;
    const CANVAS_DEFAULT_HEIGHT = 10;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_DEFAULT_WIDTH;
    canvas.height = CANVAS_DEFAULT_HEIGHT;

    const eyeDropperCanvasRefMock: ElementRef<HTMLCanvasElement> = ({
        nativeElement: canvas,
    } as ElementRef) as ElementRef;

    const gridCanvasRefMock: ElementRef<HTMLCanvasElement> = ({
        nativeElement: canvas,
    } as ElementRef) as ElementRef;

    let canvasRenderingContext2DMock: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        eyeDropperServiceSpyObj = jasmine.createSpyObj('EyeDropperService', ['newIncomingColor', 'sendNotifColor']);
        eyeDropperServiceSpyObj.newIncomingColor.and.returnValue(of());
        eyeDropperServiceSpyObj.sendNotifColor();
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', ['updateColor'], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
            secondaryColor: { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        TestBed.configureTestingModule({
            declarations: [EyeDropperComponent],
            providers: [
                { provide: EyeDropperService, useValue: eyeDropperServiceSpyObj },
                { provide: ColorService, useValue: colorServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        fixture = TestBed.createComponent(EyeDropperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;

        component.eyeDropperCanvasRef = eyeDropperCanvasRefMock;
        component.gridCanvasRef = gridCanvasRefMock;

        canvasRenderingContext2DMock = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        eyeDropperServiceSpyObj.currentPixelData = canvasRenderingContext2DMock.getImageData(0, 0, 1, 1);
        eyeDropperServiceSpyObj.currentGridOfPixelData = canvasRenderingContext2DMock.getImageData(0, 0, 1, 1);
        component['eyeDropperCtx'] = canvasRenderingContext2DMock;
        component['gridCtx'] = canvasRenderingContext2DMock;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#newColorNotification should call changeColor', () => {
        spyOn<any>(component, 'changeColor').and.stub();
        component['newColorNotification']();
        expect(component['changeColor']).toHaveBeenCalled();
    });

    it('#onMouseMove should call drawGrid and draw the preview if the mouse is on the canvas region', () => {
        spyOn<any>(component, 'buildImage').and.stub();
        spyOn<any>(component, 'drawGrid').and.stub();
        component['eyeDropperService'].preview = true;
        component.onMouseMove(mouseEvent);

        expect(component['buildImage']).toHaveBeenCalled();
        expect(component['drawGrid']).toHaveBeenCalled();
    });

    it('#onMouseMove should not call drawGrid and buildImage if the mouse is not on the canvas region', () => {
        spyOn<any>(component, 'buildImage').and.stub();
        spyOn<any>(component, 'drawGrid').and.stub();
        component['eyeDropperService'].preview = false;
        component.onMouseMove(mouseEvent);

        expect(component['buildImage']).not.toHaveBeenCalled();
        expect(component['drawGrid']).not.toHaveBeenCalled();
    });

    it('#changerColor should call updateColor with the primary color on right click', () => {
        const COLOR_STUB = { rgbValue: 'black', opacity: 1 };
        component['eyeDropperService'].leftClick = true;
        component['changeColor'](COLOR_STUB);
        expect(colorServiceSpyObj.updateColor).toHaveBeenCalledWith(component['colorService'].mainColor, COLOR_STUB);
    });

    it('#changerColor should call updateColor with the primary color on right click', () => {
        const COLOR_STUB = { rgbValue: 'black', opacity: 1 };
        component['eyeDropperService'].leftClick = false;
        component['changeColor'](COLOR_STUB);
        expect(colorServiceSpyObj.updateColor).toHaveBeenCalledWith(component['colorService'].secondaryColor, COLOR_STUB);
    });

    it('#setContextForPreview should set the context for the preview', () => {
        component['setContextForPreview']();
        expect(component['eyeDropperCtx'].imageSmoothingEnabled).toEqual(false);
    });

    it('#setGridContext should set the context of the grid so it is ready to draw', () => {
        const GRID_ALPHA = 0.25;
        component['setGridContext']();
        expect(component['gridCtx'].strokeStyle).toEqual('#000000');
        expect(component['gridCtx'].lineWidth).toEqual(1);
        expect(component['gridCtx'].globalAlpha).toEqual(GRID_ALPHA);
    });

    it('#buildImage should call setContextForPreview, makeImageForPreview and makePreviewCircular', () => {
        spyOn<any>(component, 'setContextForPreview').and.stub();
        spyOn<any>(component, 'makeImageForPreview').and.returnValue(document.createElement('canvas'));
        spyOn<any>(component, 'makePreviewCircular').and.stub();

        component['buildImage']();

        expect(component['setContextForPreview']).toHaveBeenCalled();
        expect(component['makeImageForPreview']).toHaveBeenCalled();
        expect(component['makePreviewCircular']).toHaveBeenCalled();
    });

    it('#makeImageForPreview should return an HTMLCanvasElement containing the imageDate for the preview', () => {
        const imageStub = document.createElement('canvas');
        imageStub.width = component.CANVAS_SIZE;
        imageStub.height = component.CANVAS_SIZE;
        (imageStub.getContext('2d') as CanvasRenderingContext2D).putImageData(component['eyeDropperService'].currentGridOfPixelData, 0, 0);

        expect(component['makeImageForPreview']()).toEqual(imageStub);
    });

    it('#drawGrid should draw the grid on the preview context', () => {
        spyOn<any>(component, 'drawBlackCircleAroundPreview').and.callThrough();
        spyOn<any>(component, 'makePreviewCircular').and.callThrough();
        spyOn<any>(component, 'setGridContext').and.callThrough();

        const imageStubBefore = component['gridCtx'].getImageData(0, 0, component.CANVAS_SIZE, component.CANVAS_SIZE);
        component['drawGrid']();
        const imageStubAfter = component['gridCtx'].getImageData(0, 0, component.CANVAS_SIZE, component.CANVAS_SIZE);

        expect(component['drawBlackCircleAroundPreview']).toHaveBeenCalled();
        expect(component['makePreviewCircular']).toHaveBeenCalled();
        expect(component['setGridContext']).toHaveBeenCalled();
        expect(imageStubBefore).not.toEqual(imageStubAfter);
    });

    // fit('#newColorNotification should be called whenever there is a new color in the service', () => {
    //     // let anything: any;
    //     component.ngOnInit();
    //     spyOn(component, 'changeColor').and.stub();
    //     console.log("if there is an hello there after this, means we're in the test");
    //     spyOn(component, 'newColorNotification').and.stub();
    //     component['eyeDropperService'].sendNotifColor();
    //     eyeDropperServiceSpyObj.sendNotifColor();
    //     expect(component.newColorNotification).toHaveBeenCalled();
    // });
});
