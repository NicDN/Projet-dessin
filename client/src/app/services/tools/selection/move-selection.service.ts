import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService {
    constructor(private drawingService: DrawingService, private gridService: GridService) {}

    movingWithMouse: boolean = false;
    mouseMoveOffset: Vec2;
    magnetisme: boolean = false;

    readonly arrowMoveDelta: number = 3;
    pointToMagnetize: number = -1;
    movingWithArrows: boolean = false;
    keyUpIsPressed: boolean = false;
    keyDownIsPressed: boolean = false;
    keyLeftIsPressed: boolean = false;
    keyRightIsPressed: boolean = false;
    initialKeyPress: boolean = false;

    calculateDelta(): Vec2 {
        let deltaY = 0;
        let deltaX = 0;
        if (this.keyUpIsPressed) deltaY -= this.arrowMoveDelta;
        if (this.keyDownIsPressed) deltaY += this.arrowMoveDelta;
        if (this.keyLeftIsPressed) deltaX -= this.arrowMoveDelta;
        if (this.keyRightIsPressed) deltaX += this.arrowMoveDelta;
        return { x: deltaX, y: deltaY };
    }

    checkIfAnyArrowIsPressed(): boolean {
        return this.keyUpIsPressed || this.keyDownIsPressed || this.keyLeftIsPressed || this.keyRightIsPressed;
    }

    updateArrowKeysPressed(event: KeyboardEvent, state: boolean): void {
        if (event.code === 'ArrowUp') this.keyUpIsPressed = state;
        if (event.code === 'ArrowDown') this.keyDownIsPressed = state;
        if (event.code === 'ArrowLeft') this.keyLeftIsPressed = state;
        if (event.code === 'ArrowRight') this.keyRightIsPressed = state;
    }

    moveSelectionWithArrows(ctx: CanvasRenderingContext2D, delta: Vec2, selectionCoords: SelectionCoords): void {
        selectionCoords.finalTopLeft.x += delta.x;
        selectionCoords.finalTopLeft.y += delta.y;
        selectionCoords.finalBottomRight.x += delta.x;
        selectionCoords.finalBottomRight.y += delta.y;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    moveSelectionWithMouse(ctx: CanvasRenderingContext2D, pos: Vec2, selectionCoords: SelectionCoords): void {
        if (!this.magnetisme) {
            pos = this.getTruePosition(pos);
        }

        const largeur = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        const hauteur = selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y;
        selectionCoords.finalTopLeft = { x: pos.x - this.mouseMoveOffset.x, y: pos.y - this.mouseMoveOffset.y };
        selectionCoords.finalBottomRight = {
            x: selectionCoords.finalTopLeft.x + largeur,
            y: selectionCoords.finalTopLeft.y + hauteur,
        };
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    getTruePosition(pos: Vec2): Vec2 {
        console.clear();
        console.table(pos);
        const tmp: Vec2 = {
            x: Math.round(pos.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(pos.y / this.gridService.squareSize) * this.gridService.squareSize,
        };
        console.table(pos);
        return tmp;
    }
}
