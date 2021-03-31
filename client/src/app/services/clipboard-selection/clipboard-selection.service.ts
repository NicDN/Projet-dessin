import { Injectable } from '@angular/core';
import { SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';

interface ClipBoardData {
    clipboardImage: ImageData;
    selectionType: SelectionType;
}

@Injectable({
    providedIn: 'root',
})
export class ClipboardSelectionService {
    clipBoardData: ClipBoardData;
    readonly outsideDrawingZoneCoords: number = 1000000;
    readonly pasteOffSet: number = 10;
    constructor(private toolsService: ToolsService, private drawingService: DrawingService) {}

    copy(): void {
        if (!this.canUseClipboardService()) return;
        this.clipBoardData = {
            clipboardImage: (this.toolsService.currentTool as SelectionTool).data,
            selectionType: this.getSelectionType(),
        };
    }

    paste(): void {
        if (this.clipBoardData === undefined) return;
        if ((this.toolsService.currentTool as SelectionTool).selectionExists) (this.toolsService.currentTool as SelectionTool).cancelSelection();
        this.switchToStoredClipboardImageSelectionTool();
        (this.toolsService.currentTool as SelectionTool).data = this.clipBoardData.clipboardImage;

        (this.toolsService.currentTool as SelectionTool).selectionExists = true;
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialTopLeft = {
            x: this.outsideDrawingZoneCoords,
            y: this.outsideDrawingZoneCoords,
        };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialBottomRight = {
            x: this.outsideDrawingZoneCoords + this.clipBoardData.clipboardImage.width,
            y: this.outsideDrawingZoneCoords + this.clipBoardData.clipboardImage.height,
        };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.finalTopLeft = {
            x: this.pasteOffSet,
            y: this.pasteOffSet,
        };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.finalBottomRight = {
            x: this.pasteOffSet + this.clipBoardData.clipboardImage.width,
            y: this.pasteOffSet + this.clipBoardData.clipboardImage.height,
        };
        (this.toolsService.currentTool as SelectionTool).drawAll(this.drawingService.previewCtx);
    }

    cut(): void {
        this.copy();
        this.delete();
    }

    delete(): void {
        if (!this.canUseClipboardService()) return;
        this.drawingService.fillWithWhite(this.drawingService.previewCtx);

        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialTopLeft.x--;
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialTopLeft.y--;
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialBottomRight.x--;
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialBottomRight.y--;
        (this.toolsService.currentTool as SelectionTool).data = this.drawingService.previewCtx.getImageData(
            (this.toolsService.currentTool as SelectionTool).selectionCoords.finalTopLeft.x,
            (this.toolsService.currentTool as SelectionTool).selectionCoords.finalTopLeft.y,
            (this.toolsService.currentTool as SelectionTool).data.width,
            (this.toolsService.currentTool as SelectionTool).data.height,
        );

        (this.toolsService.currentTool as SelectionTool).cancelSelection();
    }

    getSelectionType(): SelectionType {
        if (this.toolsService.currentTool instanceof RectangleSelectionService) {
            return SelectionType.Rectangle;
        } else if (this.toolsService.currentTool instanceof EllipseSelectionService) {
            return SelectionType.Ellipse;
        } else if (this.toolsService.currentTool instanceof LassoSelectionService) {
            return SelectionType.Lasso;
        }
        return SelectionType.None;
    }

    switchToStoredClipboardImageSelectionTool(): void {
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

    canUseClipboardService(): boolean {
        if (!(this.toolsService.currentTool instanceof SelectionTool)) return false;
        return (this.toolsService.currentTool as SelectionTool).selectionExists;
    }
}
