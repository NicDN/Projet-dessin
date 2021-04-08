import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
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
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    private canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO, y: window.innerHeight * HALF_RATIO };

    private canDraw: boolean = true;

    private currentMousePosition: MouseEvent;

    constructor(
        private drawingService: DrawingService,
        public toolsService: ToolsService,
        private hotKeyService: HotkeyService,
        private undoRedoService: UndoRedoService,
        private resizeSelectionService: ResizeSelectionService,
    ) {}

    ngAfterViewInit(): void {
        this.drawingService.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;
        this.drawingService.fillWithWhite(this.drawingService.baseCtx);

        const baseImage = new Image(this.canvasSize.x, this.canvasSize.y);
        baseImage.src = this.drawingService.canvas.toDataURL();
        this.drawingService.blankHTMLImage = baseImage;

        this.loadCanvasWithIncomingImage(baseImage);
    }

    private async loadCanvasWithIncomingImage(baseImage: HTMLImageElement): Promise<void> {
        // create new drawing
        if (this.drawingService.isNewDrawing) {
            this.drawingService.handleNewDrawing(baseImage);
            this.drawingService.isNewDrawing = false;
            return;
        }

        // open drawing from carousel
        if (this.drawingService.newImage) {
            this.drawingService.handleNewDrawing(this.drawingService.newImage);
            this.drawingService.newImage = undefined;
            return;
        }

        // reload editor (F5)
        const img = new Image();
        img.src = localStorage.getItem('canvas') as string;
        await img.decode();
        this.drawingService.changeDrawing(img);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.currentMousePosition = event;
        if (this.canDraw) this.toolsService.currentTool.onMouseMove(event);
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.canDraw && this.isInsideCanvas(event)) {
            if (!(this.toolsService.currentTool instanceof SelectionTool)) this.undoRedoService.disableUndoRedo();
            this.toolsService.currentTool.onMouseDown(event);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!(this.toolsService.currentTool instanceof LineService)) {
            if (!(this.toolsService.currentTool instanceof SelectionTool)) {
                this.undoRedoService.enableUndoRedo();
            }
        }
        if (this.canDraw) this.toolsService.currentTool.onMouseUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotKeyService.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.hotKeyService.onKeyUp(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseEnter(event);
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.toolsService.currentTool.onMouseOut(event);
    }

    @HostListener('wheel', ['$event'])
    onScroll(event: WheelEvent): void {
        if (this.toolsService.currentTool === this.toolsService.stampService) (this.toolsService.currentTool as StampService).rotateStamp(event);
    }

    disableDrawing(isUsingResizeButton: boolean): void {
        this.canDraw = !isUsingResizeButton;
    }

    private isInsideCanvas(event: MouseEvent): boolean {
        return (
            event.pageX < this.drawingService.canvas.width + SIDE_BAR_SIZE &&
            event.pageY < this.drawingService.canvas.height &&
            event.pageX > SIDE_BAR_SIZE
        );
    }

    getRightCursor(): string {
        if (this.toolsService.currentTool === this.toolsService.eraserService || this.toolsService.currentTool === this.toolsService.stampService) {
            return 'none';
        }

        if (
            this.toolsService.lassoSelectionService &&
            this.toolsService.lassoSelectionService.checkIfLineCrossing() &&
            this.toolsService.currentTool !== this.toolsService.lineService
        ) {
            return 'not-allowed';
        }

        if (this.toolsService.currentTool instanceof SelectionTool) {
            return this.checkIfIsAControlPoint();
        }

        return 'crosshair';
    }

    checkIfIsAControlPoint(): string {
        if ((this.toolsService.currentTool as SelectionTool).selectionExists) {
            switch (this.resizeSelectionService.previewSelectedPointIndex) {
                case 0:
                case 3:
                    return 'nw-resize';
                case 1:
                case 2:
                    return 'ne-resize';
                case 4:
                case 5:
                    return 'n-resize';
                case 6:
                case 7:
                    return 'w-resize';
                default:
                    return 'pointer';
            }
        }
        return 'pointer';
    }
}
