import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { SelectedPoint } from '@app/services/tools/selection/magnet-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export const DEFAULT_WIDTH = 250;
export const DEFAULT_HEIGHT = 250;
export const MINIMUM_WORKSPACE_SIZE = 500;
export const SIDE_BAR_SIZE = 400;
export const HALF_RATIO = 0.5;

// tslint:disable: no-magic-numbers
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
    private dialogIsOpened: boolean = false;
    private refreshedImage: HTMLImageElement = new Image();

    constructor(
        private drawingService: DrawingService,
        private toolsService: ToolsService,
        private hotKeyService: HotkeyService,
        private undoRedoService: UndoRedoService,
        private resizeSelectionService: ResizeSelectionService,
        private dialogService: DialogService,
    ) {
        this.observeDialogService();
    }

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

    private observeDialogService(): void {
        this.dialogService.listenToKeyEvents().subscribe((dialogIsOpened) => {
            this.dialogIsOpened = !dialogIsOpened;
        });
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
        this.refreshedImage.src = localStorage.getItem('canvas') as string;
        await this.refreshedImage.decode();
        this.drawingService.changeDrawing(this.refreshedImage);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.canDraw && !this.dialogIsOpened) this.toolsService.currentTool.onMouseMove(event);
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.canDraw && this.isInsideCanvas(event) && !this.dialogIsOpened) {
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
        if (this.canDraw && !this.dialogIsOpened) this.toolsService.currentTool.onMouseUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotKeyService.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolsService.onKeyUp(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.canDraw && !this.dialogIsOpened) this.toolsService.currentTool.onMouseEnter(event);
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

        if (this.toolsService.currentTool === this.toolsService.eyeDropperService) {
            return 'zoom-in';
        }

        if (
            this.toolsService.lassoSelectionService &&
            this.toolsService.lassoSelectionService.checkIfLineCrossing() &&
            this.toolsService.currentTool !== this.toolsService.lineService
        ) {
            return 'not-allowed';
        }

        if (this.toolsService.currentTool === this.toolsService.textService) {
            if (!(this.toolsService.currentTool as TextService).isWriting) return 'text';
            else return 'pointer';
        }

        if (this.toolsService.currentTool instanceof SelectionTool) {
            return this.checkIfIsAControlPoint();
        }

        return 'crosshair';
    }

    private checkIfIsAControlPoint(): string {
        if ((this.toolsService.currentTool as SelectionTool).selectionExists) {
            switch (this.resizeSelectionService.previewSelectedPointIndex) {
                case SelectedPoint.TOP_LEFT:
                case SelectedPoint.BOTTOM_RIGHT:
                    return this.returnTrueFirstDiagonalCursor();
                case SelectedPoint.TOP_RIGHT:
                case SelectedPoint.BOTTOM_LEFT:
                    return this.returnTrueSecondDiagonalCursor();

                case SelectedPoint.TOP_MIDDLE:
                case SelectedPoint.BOTTOM_MIDDLE:
                    return 'n-resize';
                case SelectedPoint.MIDDLE_RIGHT:
                case SelectedPoint.MIDDLE_LEFT:
                    return 'w-resize';
                case SelectedPoint.CENTER:
                case SelectedPoint.MOVING:
                    return 'move';
                default:
                    return 'pointer';
            }
        }
        return 'pointer';
    }

    private returnTrueFirstDiagonalCursor(): string {
        if (!this.horizontalAxisSelectionIsFlipped()) {
            if (!this.verticalAxisSelectionIsFlipped()) {
                return 'nw-resize';
            } else {
                return 'ne-resize';
            }
        } else {
            if (!this.verticalAxisSelectionIsFlipped()) {
                return 'ne-resize';
            } else {
                return 'nw-resize';
            }
        }
    }

    private returnTrueSecondDiagonalCursor(): string {
        if (!this.horizontalAxisSelectionIsFlipped()) {
            if (!this.verticalAxisSelectionIsFlipped()) {
                return 'ne-resize';
            } else {
                return 'nw-resize';
            }
        } else {
            if (!this.verticalAxisSelectionIsFlipped()) {
                return 'nw-resize';
            } else {
                return 'ne-resize';
            }
        }
    }

    private horizontalAxisSelectionIsFlipped(): boolean {
        return (
            (this.toolsService.currentTool as SelectionTool).coords.finalBottomRight.x -
                (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.x <
            0
        );
    }

    private verticalAxisSelectionIsFlipped(): boolean {
        return (
            (this.toolsService.currentTool as SelectionTool).coords.finalBottomRight.y -
                (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.y <
            0
        );
    }
}
