import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { ToolsService } from '@app/services/tools/tools.service';
import { DrawingService } from '../drawing/drawing.service';
import { EllipseSelectionService } from '../tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '../tools/selection/lasso/lasso-selection.service';
import { RectangleSelectionService } from '../tools/selection/rectangle/rectangle-selection.service';
import { SelectionPropreties, SelectionType } from './../../classes/commands/selection-command/selection-command';

interface ClipBoardData {
    clipboardImage: ImageData;
    selectionType: SelectionType;
}

@Injectable({
    providedIn: 'root',
})
export class ClipboardSelectionService {
    currentSelectionType: SelectionType;
    clipBoardData: ClipBoardData;
    readonly outsideDrawingZoneCoords: number = 1000000;
    readonly pasteOffSet: number = 10;
    constructor(private toolsService: ToolsService, private drawingService: DrawingService) {}

    copy(): void {
        if (!this.canUseClipboardService()) return;
        this.currentSelectionType = this.checkSelectionType();
        this.clipBoardData = {
            clipboardImage: (this.toolsService.currentTool as SelectionTool).data,
            selectionType: this.currentSelectionType,
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

    loadUpSelectionPropretiesForDelete(): SelectionPropreties {
        return {
            selectionCtx: this.drawingService.previewCtx,
            imageData: (this.toolsService.currentTool as SelectionTool).data,
            topLeft: (this.toolsService.currentTool as SelectionTool).selectionCoords.initialTopLeft,
            bottomRight: (this.toolsService.currentTool as SelectionTool).selectionCoords.initialBottomRight,
            finalTopLeft: (this.toolsService.currentTool as SelectionTool).selectionCoords.finalTopLeft,
            finalBottomRight: (this.toolsService.currentTool as SelectionTool).selectionCoords.finalBottomRight,
        };
    }

    checkSelectionType(): SelectionType {
        if (this.toolsService.currentTool instanceof RectangleSelectionService) {
            return SelectionType.Rectangle;
        } else if (this.toolsService.currentTool instanceof EllipseSelectionService) {
            return SelectionType.Ellipse;
        } else if (this.toolsService.currentTool instanceof LassoSelectionService) {
            return SelectionType.Lasso;
        } else {
            return SelectionType.None;
        }
    }

    switchToStoredClipboardImageSelectionTool(): void {
        if (this.currentSelectionType === SelectionType.Rectangle) {
            this.toolsService.setCurrentTool(this.toolsService.rectangleSelectionService);
        }
        if (this.currentSelectionType === SelectionType.Ellipse) {
            this.toolsService.setCurrentTool(this.toolsService.ellipseSelectionService);
        }
        if (this.currentSelectionType === SelectionType.Lasso) {
            this.toolsService.setCurrentTool(this.toolsService.lassoSelectionService);
        }
    }

    canUseClipboardService(): boolean {
        if (!(this.toolsService.currentTool instanceof SelectionTool)) return false;
        return (this.toolsService.currentTool as SelectionTool).selectionExists;
    }
}
