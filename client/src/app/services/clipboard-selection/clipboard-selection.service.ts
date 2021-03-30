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

interface ClipBoardImage {
    clipboardImage: ImageData;
    selectionType: SelectionType;
    selectionCoords?: SelectionCoords;
}

@Injectable({
    providedIn: 'root',
})
export class ClipboardSelectionService {
    currentSelectionType: SelectionType;
    clipBoardImage: ClipBoardImage;
    constructor(private toolsService: ToolsService, private drawingService: DrawingService) {}

    copy(): void {
        if (!this.canUseClipboardService()) return;
        this.currentSelectionType = this.checkSelectionType();
        this.clipBoardImage = {
            clipboardImage: (this.toolsService.currentTool as SelectionTool).data,
            selectionType: this.currentSelectionType,
        };
    }

    paste(): void {
        if (this.clipBoardImage.clipboardImage === undefined) return;

        // const selectionPropretiesTmp = this.loadUpSelectionPropretiesForDelete();

        (this.toolsService.currentTool as SelectionTool).selectionExists = true;
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialTopLeft = { x: 1000, y: 1000 };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.initialBottomRight = {
            x: 1000 + this.clipBoardImage.clipboardImage.width,
            y: 1000 + this.clipBoardImage.clipboardImage.height,
        };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.finalTopLeft = {
            x: 2,
            y: 2,
        };
        (this.toolsService.currentTool as SelectionTool).selectionCoords.finalBottomRight = {
            x: 2 + this.clipBoardImage.clipboardImage.width,
            y: 2 + this.clipBoardImage.clipboardImage.height,
        };
        (this.toolsService.currentTool as SelectionTool).drawAll(this.drawingService.previewCtx);
    }

    cut(): void {}

    delete(): void {
        if (!this.canUseClipboardService()) return;
        const selectionPropretiesTmp = this.loadUpSelectionPropretiesForDelete();
        (this.toolsService.currentTool as SelectionTool).fillWithWhite(selectionPropretiesTmp);
        (this.toolsService.currentTool as SelectionTool).cancelSelection();
        selectionPropretiesTmp.bottomRight = selectionPropretiesTmp.finalBottomRight;
        selectionPropretiesTmp.topLeft = selectionPropretiesTmp.finalTopLeft;
        selectionPropretiesTmp.selectionCtx = this.drawingService.baseCtx;
        (this.toolsService.currentTool as SelectionTool).fillWithWhite(selectionPropretiesTmp);
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
