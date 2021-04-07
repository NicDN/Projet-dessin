import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService {
    constructor(private drawingService: DrawingService, private gridService: GridService) {
        gridService.gridDrawn = true;
        gridService.squareSize = 40;
        gridService.opacity = 100;
    }

    movingWithMouse: boolean = false;
    mouseMoveOffset: Vec2;
    pointToMagnetize: number = 0;
    isUsingMagnet: boolean = false;

    adjustedMouseMoveOffSet: Vec2;

    readonly arrowMoveDelta: number = 3;
    readonly NO_POINT_SELECTED_INDEX: number = -1;

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
        const moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };

        if (this.isUsingMagnet) {
            this.alignToProperMagnetSmthgSmthg(ctx, pos, selectionCoords);
        }

        // const magnetizedBottomOffset = this.getMagnetizedPosition(moveOffsetBottom)[1];

        this.alignToProperMagnetSmthgSmthg(ctx, pos, selectionCoords);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    alignToProperMagnetSmthgSmthg(ctx: CanvasRenderingContext2D, pos: Vec2, selectionCoords: SelectionCoords): void {
        const width = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        const height = selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y;
        const moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        const magnetizedTopOffset = this.getMagnetizedPosition(moveOffsetTop)[1];

        switch (this.pointToMagnetize) {
            case 0:
                // Nothing to do

                break;
            case 1:
                break;
            case 2:
                break;
        }
        console.log(this.pointToMagnetize);
    }

    getMagnetizedPosition(pos: Vec2): Vec2[] {
        const tmp: Vec2 = {
            x: Math.round(pos.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(pos.y / this.gridService.squareSize) * this.gridService.squareSize,
        };

        this.adjustedMouseMoveOffSet = {
            x: Math.round(this.mouseMoveOffset.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(this.mouseMoveOffset.y / this.gridService.squareSize) * this.gridService.squareSize,
        };
        return [tmp, this.adjustedMouseMoveOffSet];
    }
}

// en bas a droite

/*selectionCoords.finalBottomRight = this.getMagnetizedPosition(selectionCoords.finalBottomRight)[0];
selectionCoords.finalBottomRight = { x: pos.x + adjustedMouseMoveOffSet.x, y: pos.y + adjustedMouseMoveOffSet.y };
selectionCoords.finalTopLeft = {
    x: selectionCoords.finalBottomRight.x - width,
    y: selectionCoords.finalBottomRight.y - height,
};*/

// en haut a droite

/*selectionCoords.finalTopLeft = { x: pos.x + magnetizedBottomOffset.x - width, y: pos.y - magnetizedTopOffset.y };
        selectionCoords.finalBottomRight = {
            x: pos.x + magnetizedBottomOffset.x,
            y: selectionCoords.finalTopLeft.y + height,
        };*/

// en bas a gauche

// selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y + magnetizedBottomOffset.y - height };
// selectionCoords.finalBottomRight = {
//     x: pos.x - magnetizedTopOffset.x + width,
//     y: pos.y + magnetizedBottomOffset.y,
// };

// centre

// selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y - magnetizedTopOffset.y };
// selectionCoords.finalBottomRight = {
//     x: selectionCoords.finalTopLeft.x + width,
//     y: selectionCoords.finalTopLeft.y + height,
// };
// selectionCoords.finalBottomRight = this.getMagnetizedPosition(selectionCoords.finalBottomRight)[0];
