import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

interface ShortcutFunctions {
    action?: () => void;
    actionCtrl?: () => void;
    actionCtrlShift?: () => void;
}

enum shortCutManager {
    RECTANGLE_SELECTION = 'KeyR',
    LASSO_SELECTION = 'KeyV',
    SAVE = 'KeyS',
    CAROUSEL = 'KeyG',
    EXPORT = 'KeyE',
    NEWDRAWING = 'KeyO',
    ERASER = 'KeyE',
    PENCIL = 'KeyC',
    LINE = 'KeyL',
    SPRAY_CAN = 'KeyA',
    EYE_DROPPER = 'KeyI',
    UNDO_REDO = 'KeyZ',
    ELLIPSE = 'Digit2',
    RECTANGLE = 'Digit1',
    POLYGON = 'Digit3',
    STAMP = 'KeyD',
    TEXT = 'KeyT',
    FILL_DRIP = 'KeyB',
    GRID = 'KeyG',
}

type ShortcutManager = {
    [key in shortCutManager]: ShortcutFunctions;
};

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    private shortCutManager: ShortcutManager;
    listenToKeyEvents: boolean = true;

    constructor(
        private router: Router,
        private drawingService: DrawingService,
        private toolService: ToolsService,
        private dialogService: DialogService,
        private undoRedoService: UndoRedoService,
        private rectangleSelectionService: RectangleSelectionService,
    ) {
        this.initializeShorcutManager();
        this.observeDialogService();
    }

    private initializeShorcutManager(): void {
        this.shortCutManager = {
            KeyR: {
                action: () => this.toolService.setCurrentTool(this.toolService.rectangleSelectionService),
            },
            KeyS: {
                action: () => this.toolService.setCurrentTool(this.toolService.ellipseSelectionService),
                actionCtrl: () => this.dialogService.openDialog(DialogType.Save),
            },
            KeyG: {
                action: () => this.toolService.setCurrentTool(this.toolService.gridService),
                actionCtrl: () => this.dialogService.openDialog(DialogType.Carousel),
            },
            KeyO: { actionCtrl: () => this.handleCtrlO() },
            KeyA: {
                action: () => this.toolService.setCurrentTool(this.toolService.sprayCanService),
                actionCtrl: () => this.handleSelectAll(),
            },
            KeyI: { action: () => this.toolService.setCurrentTool(this.toolService.eyeDropperService) },
            KeyE: {
                action: () => this.toolService.setCurrentTool(this.toolService.eraserService),
                actionCtrl: () => this.dialogService.openDialog(DialogType.Export),
            },
            KeyL: { action: () => this.toolService.setCurrentTool(this.toolService.lineService) },
            KeyC: { action: () => this.toolService.setCurrentTool(this.toolService.pencilService) },
            Digit1: { action: () => this.toolService.setCurrentTool(this.toolService.rectangleDrawingService) },
            Digit2: { action: () => this.toolService.setCurrentTool(this.toolService.ellipseDrawingService) },
            Digit3: { action: () => this.toolService.setCurrentTool(this.toolService.polygonService) },
            KeyZ: { actionCtrl: () => this.undoRedoService.undo(), actionCtrlShift: () => this.undoRedoService.redo() },
            KeyD: { action: () => this.toolService.setCurrentTool(this.toolService.stampService) },
            KeyT: { action: () => this.toolService.setCurrentTool(this.toolService.textService) },
            KeyB: { action: () => this.toolService.setCurrentTool(this.toolService.fillDripService) },
            KeyV: { action: () => this.toolService.setCurrentTool(this.toolService.lassoSelectionService) },
        };
    }

    private observeDialogService(): void {
        this.dialogService.listenToKeyEvents().subscribe((listenToKeyEvents) => {
            this.listenToKeyEvents = listenToKeyEvents;
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.listenToKeyEvents) {
            return;
        }
        if (event.ctrlKey) {
            event.preventDefault();
            event.shiftKey
                ? this.shortCutManager[event.code as shortCutManager]?.actionCtrlShift?.()
                : this.shortCutManager[event.code as shortCutManager]?.actionCtrl?.();
        } else {
            this.shortCutManager[event.code as shortCutManager]?.action?.();
        }
        this.toolService.currentTool.onKeyDown(event); // current tool custom onkeydown implementation
        event.returnValue = true; // To accept default web shortCutManager
    }

    private handleSelectAll(): void {
        this.toolService.setCurrentTool(this.toolService.rectangleSelectionService);
        this.rectangleSelectionService.selectAll();
    }

    private handleCtrlO(): void {
        this.currentRouteIsEditor(this.router.url) ? this.drawingService.handleNewDrawing() : this.router.navigate(['editor']);
    }

    private currentRouteIsEditor(url: string): boolean {
        return url === '/editor';
    }
}
