import { Injectable } from '@angular/core';
import { SelectionCoords, SelectionTool } from '@app/classes/selection-tool';
import { ToolsService } from '@app/services/tools/tools.service';
import { DrawingService } from '../drawing/drawing.service';
import { EllipseSelectionService } from '../tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '../tools/selection/lasso/lasso-selection.service';
import { RectangleSelectionService } from '../tools/selection/rectangle/rectangle-selection.service';
import { SelectionPropreties } from './../../classes/commands/selection-command/selection-command';

enum SelectionType {
    RECTANGLE,
    ELLIPSE,
    LASSO,
    NONE,
}

interface ClipBoardData {
    clipboardImage: ImageData;
    selectionType: SelectionType;
    selectionCoords?: SelectionCoords;
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
        console.log("we're changing the data");
        this.clipBoardData = {
            clipboardImage: (this.toolsService.currentTool as SelectionTool).data,
            selectionType: this.currentSelectionType,
        };
    }

    paste(): void {
        if (this.clipBoardData.clipboardImage === undefined) return;
        if ((this.toolsService.currentTool as SelectionTool).selectionExists) return;
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
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.previewCanvas.height,
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
            console.log('im rectangle!');
            return SelectionType.RECTANGLE;
        } else if (this.toolsService.currentTool instanceof EllipseSelectionService) {
            console.log('im ellipse!');
            return SelectionType.ELLIPSE;
        } else if (this.toolsService.currentTool instanceof LassoSelectionService) {
            console.log('im lasso!');
            return SelectionType.LASSO;
        } else {
            console.log('not a selection tool ! ');
            return SelectionType.NONE;
        }
    }

    switchToStoredClipboardImageSelectionTool(): void {
        if (this.currentSelectionType === SelectionType.RECTANGLE) {
            this.toolsService.setCurrentTool(this.toolsService.rectangleSelectionService);
        }
        if (this.currentSelectionType === SelectionType.ELLIPSE) {
            this.toolsService.setCurrentTool(this.toolsService.ellipseSelectionService);
        }
        if (this.currentSelectionType === SelectionType.LASSO) {
            this.toolsService.setCurrentTool(this.toolsService.lassoSelectionService);
        }
    }

    canUseClipboardService(): boolean {
        return this.toolsService.currentTool instanceof SelectionTool && (this.toolsService.currentTool as SelectionTool).selectionExists;
    }
}
