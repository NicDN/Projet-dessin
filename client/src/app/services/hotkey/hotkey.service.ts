import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';

enum Shortcuts {
    NEWDRAWING = 'KeyO',
    ERASER = 'KeyE',
    PENCIL = 'KeyC',
    LINE = 'KeyL',
    SPRAY_CAN = 'KeyA',
    EYE_DROPPER = 'KeyI',
    ELLIPSE = 'Digit2',
    RECTANGLE = 'Digit1',
    POLYGON = 'Digit3',
}

type ShortcutManager = {
    [key in Shortcuts]: () => void;
};

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    shortcuts: ShortcutManager;
    ctrlKeyPressed: boolean = false;

    constructor(public router: Router, public drawingService: DrawingService, private toolService: ToolsService) {
        this.shortcuts = {
            KeyO: () => this.handleCtrlO(),
            KeyA: () => this.toolService.setCurrentTool(this.toolService.sprayCanService),
            KeyI: () => this.toolService.setCurrentTool(this.toolService.eyeDropperService),
            KeyE: () => this.toolService.setCurrentTool(this.toolService.eraserService),
            KeyL: () => this.toolService.setCurrentTool(this.toolService.lineService),
            KeyC: () => this.toolService.setCurrentTool(this.toolService.pencilService),
            Digit1: () => this.toolService.setCurrentTool(this.toolService.rectangleDrawingService),
            Digit2: () => this.toolService.setCurrentTool(this.toolService.ellipseDrawingService),
            Digit3: () => this.toolService.setCurrentTool(this.toolService.polygonService),
        };
    }
    onKeyDown(event: KeyboardEvent): void {
        this.verifyCtrlKeyStatus(event);
        this.shortcuts[event.code as Shortcuts]?.();
        this.toolService.currentTool.onKeyDown(event);
        event.returnValue = true; // To accept default web shortcuts
    }

    verifyCtrlKeyStatus(event: KeyboardEvent): void {
        this.ctrlKeyPressed = event.ctrlKey;
        if (!event.ctrlKey) return;
        event.preventDefault();
        this.ctrlKeyPressed = true;
    }

    handleCtrlO(): void {
        if (!this.ctrlKeyPressed) return;
        this.router.navigate(['editor']);
        this.drawingService.handleNewDrawing();
    }
}
