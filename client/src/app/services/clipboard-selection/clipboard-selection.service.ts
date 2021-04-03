import { Injectable } from '@angular/core';
import { SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { SelectionCoords, SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from './../undo-redo/undo-redo.service';

interface ClipBoardData {
    clipboardImage: ImageData;
    selectionType: SelectionType;
    selectionCoords: SelectionCoords;
    selectionPathData: Vec2[];
    firstPointOffSet: Vec2;
}

@Injectable({
    providedIn: 'root',
})
export class ClipboardSelectionService {
    clipBoardData: ClipBoardData;
    private readonly outsideDrawingZoneCoords: number = 1000000;
    private readonly pasteOffSet: number = 10;
    constructor(private toolsService: ToolsService, private drawingService: DrawingService, private undoRedoService: UndoRedoService) {}

    copy(): void {
        if (!this.canUseClipboardService()) return;
        this.clipBoardData = {
            clipboardImage: (this.toolsService.currentTool as SelectionTool).data,
            selectionType: this.getSelectionType(),
            selectionCoords: this.loadCoords(),
            selectionPathData: this.toolsService.lineService.pathData,
            firstPointOffSet: this.loadFirstPointOffSet(),
        };
        console.log(this.clipBoardData.selectionCoords.finalBottomRight.x);
    }

    paste(): void {
        if (this.clipBoardData === undefined) return;
        if ((this.toolsService.currentTool as SelectionTool).selectionExists) (this.toolsService.currentTool as SelectionTool).cancelSelection();
        this.switchToStoredClipboardImageSelectionTool();
        const width = Math.abs(this.clipBoardData.selectionCoords.finalBottomRight.x - this.clipBoardData.selectionCoords.finalTopLeft.x);
        const height = Math.abs(this.clipBoardData.selectionCoords.finalBottomRight.y - this.clipBoardData.selectionCoords.finalTopLeft.y);

        this.toolsService.lineService.pathData = this.clipBoardData.selectionPathData;
        (this.toolsService.currentTool as SelectionTool).data = this.clipBoardData.clipboardImage;

        if (this.clipBoardData.selectionType === SelectionType.Lasso) {
            (this.toolsService.currentTool as LassoSelectionService).firstPointOffset = this.clipBoardData.firstPointOffSet;
        }

        this.setAsideInitialCoords();
        this.setFinalCoordsOfStoredImage(width, height);
        this.undoRedoService.disableUndoRedo();

        (this.toolsService.currentTool as SelectionTool).drawAll(this.drawingService.previewCtx);
    }

    cut(): void {
        this.copy();
        this.delete();
    }

    delete(): void {
        if (!this.canUseClipboardService()) return;

        this.deleteCurrentSelection();
        this.moveInitialCoordsToCountAsAction();

        (this.toolsService.currentTool as SelectionTool).selectionExists = true;
        (this.toolsService.currentTool as SelectionTool).cancelSelection();

        if (this.toolsService.currentTool === this.toolsService.lassoSelectionService) {
            this.toolsService.lineService.clearPath();
            this.toolsService.lineService.isShiftDown = false;
        }
    }

    setAsideInitialCoords(): void {
        (this.toolsService.currentTool as SelectionTool).selectionExists = true;
        (this.toolsService.currentTool as SelectionTool).coords.initialTopLeft = {
            x: this.outsideDrawingZoneCoords,
            y: this.outsideDrawingZoneCoords,
        };
        (this.toolsService.currentTool as SelectionTool).coords.initialBottomRight = {
            x: this.outsideDrawingZoneCoords + this.clipBoardData.clipboardImage.width,
            y: this.outsideDrawingZoneCoords + this.clipBoardData.clipboardImage.height,
        };
    }

    setFinalCoordsOfStoredImage(width: number, height: number): void {
        (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft = {
            x: this.pasteOffSet,
            y: this.pasteOffSet,
        };
        (this.toolsService.currentTool as SelectionTool).coords.finalBottomRight = {
            x: this.pasteOffSet + width,
            y: this.pasteOffSet + height,
        };
    }

    deleteCurrentSelection(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        (this.toolsService.currentTool as SelectionTool).data = this.drawingService.previewCtx.getImageData(
            (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.x,
            (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.y,
            (this.toolsService.currentTool as SelectionTool).data.width,
            (this.toolsService.currentTool as SelectionTool).data.height,
        );
    }

    // In order for a selection to be counted as a selection, final coords must be different from initial coords
    moveInitialCoordsToCountAsAction(): void {
        (this.toolsService.currentTool as SelectionTool).coords.initialTopLeft.x--;
        (this.toolsService.currentTool as SelectionTool).coords.initialTopLeft.y--;
        (this.toolsService.currentTool as SelectionTool).coords.initialBottomRight.x--;
        (this.toolsService.currentTool as SelectionTool).coords.initialBottomRight.y--;
    }

    private getSelectionType(): SelectionType {
        if (this.toolsService.currentTool instanceof RectangleSelectionService) {
            return SelectionType.Rectangle;
        } else if (this.toolsService.currentTool instanceof EllipseSelectionService) {
            return SelectionType.Ellipse;
        } else if (this.toolsService.currentTool instanceof LassoSelectionService) {
            return SelectionType.Lasso;
        }
        return SelectionType.None;
    }

    private switchToStoredClipboardImageSelectionTool(): void {
        if (this.clipBoardData.selectionType === SelectionType.Rectangle) {
            this.toolsService.setCurrentTool(this.toolsService.rectangleSelectionService);
        }
        if (this.clipBoardData.selectionType === SelectionType.Ellipse) {
            this.toolsService.setCurrentTool(this.toolsService.ellipseSelectionService);
        }
        if (this.clipBoardData.selectionType === SelectionType.Lasso) {
            this.toolsService.setCurrentTool(this.toolsService.lassoSelectionService);
        }
    }

    loadCoords(): SelectionCoords {
        return {
            initialTopLeft: {
                x: (this.toolsService.currentTool as SelectionTool).coords.initialTopLeft.x,
                y: (this.toolsService.currentTool as SelectionTool).coords.initialTopLeft.y,
            },
            initialBottomRight: {
                x: (this.toolsService.currentTool as SelectionTool).coords.initialBottomRight.x,
                y: (this.toolsService.currentTool as SelectionTool).coords.initialBottomRight.y,
            },
            finalTopLeft: {
                x: (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.x,
                y: (this.toolsService.currentTool as SelectionTool).coords.finalTopLeft.y,
            },
            finalBottomRight: {
                x: (this.toolsService.currentTool as SelectionTool).coords.finalBottomRight.x,
                y: (this.toolsService.currentTool as SelectionTool).coords.finalBottomRight.y,
            },
        };
    }

    private loadFirstPointOffSet(): Vec2 {
        if (this.toolsService.currentTool === this.toolsService.lassoSelectionService) {
            return {
                x: (this.toolsService.currentTool as LassoSelectionService).firstPointOffset.x,
                y: (this.toolsService.currentTool as LassoSelectionService).firstPointOffset.y,
            };
        }
        return { x: 0, y: 0 };
    }

    canUseClipboardService(): boolean {
        if (!(this.toolsService.currentTool instanceof SelectionTool)) return false;
        return (this.toolsService.currentTool as SelectionTool).selectionExists;
    }
}
