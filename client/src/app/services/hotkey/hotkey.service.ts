import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ClipboardSelectionService } from '@app/services/clipboard-selection/clipboard-selection.service';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { TextHotkeyService } from '@app/services/tools/text/textHotkey/text-hotkey.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

interface ShortcutFunctions {
    action?: () => void;
    actionCtrl?: () => void;
    actionShift?: () => void;
    actionCtrlShift?: () => void;
}

interface ShortcutTextFunctions {
    textAction?: () => void;
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
    INCREMENT_SQUARE_SIZE = 'Equal',
    DECREMENT_SQUARE_SIZE = 'Minus',
    CUT = 'KeyX',
    DELETE = 'Delete',
    MAGNETISME = 'KeyM',
    BACKSPACE = 'Backspace',
}

enum shortCutTextManager {
    ESCAPE = 'Escape',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_UP = 'ArrowUp',
    ARROW_DOWN = 'ArrowDown',
    ENTER = 'Enter',
    DELETE = 'Delete',
    BACKSPACE = 'Backspace',
}

type ShortcutManager = {
    [key in shortCutManager]: ShortcutFunctions;
};

type ShortcutTextManager = { [key in shortCutTextManager]: ShortcutTextFunctions };

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    private shortCutManager: ShortcutManager;
    private shortCutTextManager: ShortcutTextManager;
    listenToKeyEvents: boolean = true;
    private listenToTextEvent: boolean = true;

    constructor(
        private router: Router,
        private drawingService: DrawingService,
        private toolService: ToolsService,
        private dialogService: DialogService,
        private undoRedoService: UndoRedoService,
        private rectangleSelectionService: RectangleSelectionService,
        private textService: TextService,
        private gridService: GridService,
        private clipboardSelectionService: ClipboardSelectionService,
        private moveSelectionService: MoveSelectionService,
        private textHotKeyService: TextHotkeyService,
    ) {
        this.initializeShorcutManager();
        this.initializeShortcutTextManager();
        this.observeDialogService();
        this.observeTextService();
    }

    private initializeShortcutTextManager(): void {
        this.shortCutTextManager = {
            Escape: {
                textAction: () => this.textService.disableWriting(),
            },
            ArrowLeft: {
                textAction: () => this.textHotKeyService.arrowLeftPressed(),
            },
            ArrowRight: {
                textAction: () => this.textHotKeyService.arrowRightPressed(),
            },
            ArrowUp: {
                textAction: () => this.textHotKeyService.arrowUpPressed(),
            },
            ArrowDown: {
                textAction: () => this.textHotKeyService.arrowDownPressed(),
            },
            Enter: {
                textAction: () => {
                    if (this.textService.isWriting) this.textHotKeyService.enterPressed();
                },
            },
            Delete: {
                textAction: () => this.textHotKeyService.deletePressed(),
            },
            Backspace: {
                textAction: () => this.textHotKeyService.backSpacePressed(),
            },
        };
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
                action: () => {
                    this.gridService.handleDrawGrid();
                },
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
            KeyC: {
                action: () => this.toolService.setCurrentTool(this.toolService.pencilService),
                actionCtrl: () => this.clipboardSelectionService.copy(),
            },
            Digit1: { action: () => this.toolService.setCurrentTool(this.toolService.rectangleDrawingService) },
            Digit2: { action: () => this.toolService.setCurrentTool(this.toolService.ellipseDrawingService) },
            Digit3: { action: () => this.toolService.setCurrentTool(this.toolService.polygonService) },
            KeyZ: { actionCtrl: () => this.undoRedoService.undo(), actionCtrlShift: () => this.undoRedoService.redo() },
            KeyD: { action: () => this.toolService.setCurrentTool(this.toolService.stampService) },
            KeyT: { action: () => this.toolService.setCurrentTool(this.toolService.textService) },
            KeyB: { action: () => this.toolService.setCurrentTool(this.toolService.fillDripService) },
            KeyV: {
                action: () => this.toolService.setCurrentTool(this.toolService.lassoSelectionService),
                actionCtrl: () => this.clipboardSelectionService.paste(),
            },
            Equal: {
                action: () => this.handleIncrementingSquareSize(),
                actionShift: () => this.handleIncrementingSquareSize(),
            },
            Minus: { action: () => this.handleDecrementingSquareSize() },

            KeyX: { actionCtrl: () => this.clipboardSelectionService.cut() },
            Delete: { action: () => this.clipboardSelectionService.delete() },
            KeyM: { action: () => (this.moveSelectionService.isUsingMagnet = !this.moveSelectionService.isUsingMagnet) },
            Backspace: { action: () => this.clipboardSelectionService.delete() },
        };
    }

    private observeDialogService(): void {
        this.dialogService.listenToKeyEvents().subscribe((listenToKeyEvents) => {
            this.listenToKeyEvents = listenToKeyEvents;
            this.listenToTextEvent = listenToKeyEvents;
        });
    }

    private observeTextService(): void {
        this.textService.disableEnableKeyEvents().subscribe((listenToKeyEvents) => {
            this.listenToKeyEvents = listenToKeyEvents;
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.toolService.currentTool instanceof TextService) this.onKeyDownTextService(event);
        if (!this.listenToKeyEvents || this.textService.isWriting) {
            return;
        }
        if (event.altKey) {
            event.preventDefault();
        }
        if (event.ctrlKey) {
            event.preventDefault();
            event.shiftKey
                ? this.shortCutManager[event.code as shortCutManager]?.actionCtrlShift?.()
                : this.shortCutManager[event.code as shortCutManager]?.actionCtrl?.();
        } else if (event.shiftKey) {
            event.preventDefault();
            this.shortCutManager[event.code as shortCutManager]?.actionShift?.();
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

    private handleIncrementingSquareSize(): void {
        this.gridService.incrementSquareSize();
        this.drawingService.updateGrid();
    }

    private handleDecrementingSquareSize(): void {
        this.gridService.decrementSquareSize();
        this.drawingService.updateGrid();
    }

    private onKeyDownTextService(event: KeyboardEvent): void {
        if (!this.listenToTextEvent) return;
        event.preventDefault();
        this.shortCutTextManager[event.code as shortCutTextManager]?.textAction?.();
        this.toolService.currentTool.onKeyDown(event); // current tool custom onkeydown implementation
        event.returnValue = true; // To accept default web shortCutManager
    }
}
