import { LineService } from './../../services/tools/line/line.service';
import { AfterContentInit, AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { ResizeCommand } from '@app/classes/commands/resize-command/resize-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

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
export class DrawingComponent implements AfterViewInit, AfterContentInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;

    private canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO, y: window.innerHeight * HALF_RATIO };

    canDraw: boolean = true;
    canvasWidth: number;
    canvasHeight: number;

    constructor(
        public drawingService: DrawingService,
        public toolsService: ToolsService,
        private hotKeyService: HotkeyService,
        private undoRedoService: UndoRedoService,
    ) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;

        this.drawingService.fillWithWhite(this.baseCtx);
    }

    ngAfterContentInit(): void {
        this.setCanvasDimensions();
    }

    setCanvasDimensions(): void {
        this.canvasWidth = window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.x : DEFAULT_WIDTH;
        this.canvasHeight = window.innerHeight > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.y : DEFAULT_HEIGHT;
        const onLoadBoxSize: BoxSize = { widthBox: this.canvasWidth, heightBox: this.canvasHeight };

        const onLoadActionResize: ResizeCommand = new ResizeCommand(onLoadBoxSize, this.drawingService);
        this.undoRedoService.addCommand(onLoadActionResize);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseMove(event);
    }

    onMouseDown(event: MouseEvent): void {
        if (this.canDraw) {
            this.undoRedoService.disableUndoRedo();
            this.toolsService.currentTool.onMouseDown(event);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!(this.toolsService.currentTool instanceof LineService)) {
            this.undoRedoService.enableUndoRedo();
        }
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
}
