import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

interface ShortcutFunctions {
    action?: () => void;
    actionCtrl?: () => void;
    actionCtrlShift?: () => void;
}

enum shortCutManager {
    RECTANGLE_SELECTION = 'KeyR',
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
}

type ShortcutManager = {
    [key in shortCutManager]: ShortcutFunctions;
};

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    shortCutManager: ShortcutManager;

    listenToKeyEvents: boolean = true;

    subscription: Subscription;
    constructor(
        public router: Router,
        public drawingService: DrawingService,
        private toolService: ToolsService,
        private dialogService: DialogService,
        private undoRedoService: UndoRedoService,
    ) {
        this.initializeShorcutManager();
        this.observeDialogService();
    }

    initializeShorcutManager(): void {
        this.shortCutManager = {
            KeyR: {
                action: () => this.toolService.setCurrentTool(this.toolService.rectangleSelectionService),
            },
            KeyS: {
                action: () => this.toolService.setCurrentTool(this.toolService.ellipseSelectionService),
                actionCtrl: () => this.dialogService.openDialog(DialogType.Save),
            },
            KeyG: { actionCtrl: () => this.dialogService.openDialog(DialogType.Carousel) },
            KeyO: { actionCtrl: () => this.handleCtrlO() },
            KeyA: {
                action: () => this.toolService.setCurrentTool(this.toolService.sprayCanService),
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
        };
    }

    observeDialogService(): void {
        this.subscription = this.dialogService.listenToKeyEvents().subscribe((value) => {
            this.listenToKeyEvents = value;
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

    handleCtrlO(): void {
        this.currentRouteIsEditor(this.router.url) ? this.drawingService.handleNewDrawing() : this.router.navigate(['editor']);
    }

    currentRouteIsEditor(url: string): boolean {
        return url === '/editor';
    }
}
