import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ToolsService } from '@app/services/tools/tools.service';

export const DEFAULT_WIDTH = 250;
export const DEFAULT_HEIGHT = 250;
export const MINIMUM_WORKSPACE_SIZE = 500;
export const SIDE_BAR_SIZE = 400;
export const HALF_RATIO = 0.5;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;

    private canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO, y: window.innerHeight * HALF_RATIO };
    canDraw: boolean = true;

    constructor(public drawingService: DrawingService, public toolsService: ToolsService, private hotKeyService: HotkeyService) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;

        this.baseCtx.save();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.baseCtx.restore();
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseMove(event);
    }

    onMouseDown(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotKeyService.onKeyDown(event);
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

    disableDrawing(isUsingResizeButton: boolean): void {
        this.canDraw = !isUsingResizeButton;
    }

    onSizeChange(boxsize: BoxSize): void {
        this.drawingService.onSizeChange(boxsize);
    }

    get width(): number {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.x : DEFAULT_WIDTH;
    }

    get height(): number {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.y : DEFAULT_HEIGHT;
    }
}
