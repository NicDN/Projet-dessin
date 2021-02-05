import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Vec2 } from '@app/classes/vec2';
import { CanvasCommunicationService } from '@app/services/canvas_coms/canvas-communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';

// TODO : Avoir un fichier séparé pour les constantes ?
export const DEFAULT_SIZE = 250;
const MINIMUM_WORKSPACE_SIZE = 500;
const SIDE_BAR_SIZE = 300;
const HALF_RATIO = 0.5;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;

    private canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO, y: window.innerHeight * HALF_RATIO };

    private canDraw: boolean = true;

    constructor(private drawingService: DrawingService, private toolsService: ToolsService, private comsCanvasService: CanvasCommunicationService) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.canDraw) {
            this.toolsService.currentTool.onMouseMove(event);
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (this.canDraw) {
            this.comsCanvasService.canvasModified();
            console.log(this.comsCanvasService.canvasIsEmpty);
            this.toolsService.currentTool.onMouseDown(event);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseUp(event);
        this.canDraw = true;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.toolsService.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolsService.onKeyUp(event);
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseOut(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseEnter(event);
    }

    disableDrawing(isUsingButton: boolean): void {
        this.canDraw = !isUsingButton;
    }

    onSizeChange(boxsize: BoxSize): void {
        this.previewCanvas.nativeElement.width = boxsize.widthBox;
        this.previewCanvas.nativeElement.height = boxsize.heightBox;
        this.previewCtx.drawImage(this.baseCanvas.nativeElement, 0, 0);

        this.baseCanvas.nativeElement.width = boxsize.widthBox;
        this.baseCanvas.nativeElement.height = boxsize.heightBox;

        this.baseCtx.drawImage(this.previewCanvas.nativeElement, 0, 0);

        this.previewCanvas.nativeElement.width = boxsize.widthBox;
        this.previewCanvas.nativeElement.height = boxsize.heightBox;
    }

    isEmpty(): boolean {
        console.log('Is perhaps empty');
        return false;
    }

    get width(): number {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.x : DEFAULT_SIZE;
    }

    get height(): number {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.y : DEFAULT_SIZE;
    }
}
