import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

export enum SelectedPoint {
    TOP_LEFT = 0,
    TOP_MIDDLE = 1,
    TOP_RIGHT = 2,
    MIDDLE_LEFT = 3,
    CENTER = 4,
    MIDDLE_RIGHT = 5,
    BOTTOM_LEFT = 6,
    BOTTOM_MIDDLE = 7,
    BOTTOM_RIGHT = 8,
}

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService {
    constructor(private drawingService: DrawingService, private gridService: GridService) {}

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
        if (this.isUsingMagnet) {
            this.alignToProperArrowPosition(selectionCoords, delta.x, delta.y);
        } else {
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    moveSelectionWithMouse(ctx: CanvasRenderingContext2D, pos: Vec2, selectionCoords: SelectionCoords): void {
        const width = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        const height = selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y;
        if (this.isUsingMagnet) {
            this.alignToProperMagnetMousePosition(pos, selectionCoords, width, height);
        } else {
            selectionCoords.finalTopLeft = { x: pos.x - this.mouseMoveOffset.x, y: pos.y - this.mouseMoveOffset.y };
            selectionCoords.finalBottomRight = {
                x: selectionCoords.finalTopLeft.x + width,
                y: selectionCoords.finalTopLeft.y + height,
            };
        }

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    alignToProperArrowPosition(selectionCoords: SelectionCoords, deltaX: number, deltaY: number): void {
        const width = Math.abs(selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x);
        const height = Math.abs(selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y);

        let trueDeltaX = deltaX > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (deltaX === 0) trueDeltaX = 0;

        let trueDeltaY = deltaY > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (deltaY === 0) trueDeltaY = 0;

        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                selectionCoords.finalTopLeft = this.magnetizeX(selectionCoords.finalTopLeft);
                selectionCoords.finalTopLeft = this.magnetizeY(selectionCoords.finalTopLeft);
                selectionCoords.finalTopLeft.x = selectionCoords.finalTopLeft.x + trueDeltaX;
                selectionCoords.finalTopLeft.y = selectionCoords.finalTopLeft.y + trueDeltaY;
                selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.TOP_MIDDLE:
                selectionCoords.finalTopLeft = this.magnetizeY(selectionCoords.finalTopLeft);
                selectionCoords.finalTopLeft.y = selectionCoords.finalTopLeft.y + trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalTopLeft.x + deltaX;

                selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.TOP_RIGHT:
                selectionCoords.finalTopLeft = this.magnetizeY(selectionCoords.finalTopLeft);
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight.x = selectionCoords.finalBottomRight.x + trueDeltaX;
                selectionCoords.finalTopLeft.y = selectionCoords.finalTopLeft.y + trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.MIDDLE_LEFT:
                selectionCoords.finalTopLeft = this.magnetizeX(selectionCoords.finalTopLeft);
                selectionCoords.finalTopLeft.x = selectionCoords.finalTopLeft.x + trueDeltaX;
                selectionCoords.finalTopLeft.y = selectionCoords.finalTopLeft.y + deltaY;
                selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.CENTER:
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight.x = selectionCoords.finalBottomRight.x + trueDeltaX;
                selectionCoords.finalBottomRight.y = selectionCoords.finalBottomRight.y + trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - height;
                selectionCoords.finalTopLeft = this.magnetizeX(selectionCoords.finalTopLeft);
                selectionCoords.finalTopLeft = this.magnetizeY(selectionCoords.finalTopLeft);
                break;

            case SelectedPoint.MIDDLE_RIGHT:
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight.x = selectionCoords.finalBottomRight.x + trueDeltaX;
                selectionCoords.finalTopLeft.y = selectionCoords.finalTopLeft.y + deltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.BOTTOM_LEFT:
                selectionCoords.finalTopLeft = this.magnetizeX(selectionCoords.finalTopLeft);
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                selectionCoords.finalTopLeft.x = selectionCoords.finalTopLeft.x + trueDeltaX;
                selectionCoords.finalBottomRight.y = selectionCoords.finalBottomRight.y + trueDeltaY;
                selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + width;
                selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - height;
                break;

            case SelectedPoint.BOTTOM_MIDDLE:
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight.x = selectionCoords.finalBottomRight.x + deltaX;
                selectionCoords.finalBottomRight.y = selectionCoords.finalBottomRight.y + trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - height;
                break;

            case SelectedPoint.BOTTOM_RIGHT:
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight.x = selectionCoords.finalBottomRight.x + trueDeltaX;
                selectionCoords.finalBottomRight.y = selectionCoords.finalBottomRight.y + trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - height;
                break;
        }
    }

    alignToProperMagnetMousePosition(pos: Vec2, selectionCoords: SelectionCoords, width: number, height: number): void {
        const moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        const moveOffsetBottom = { x: selectionCoords.finalBottomRight.x - pos.x, y: selectionCoords.finalBottomRight.y - pos.y };

        const magnetizedTopOffset = this.getMagnetizedOffsetPosition(moveOffsetTop);
        const magnetizedBottomOffset = this.getMagnetizedOffsetPosition(moveOffsetBottom);

        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                pos = this.magnetizeX(pos);
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y - magnetizedTopOffset.y };
                selectionCoords.finalBottomRight = { x: selectionCoords.finalTopLeft.x + width, y: selectionCoords.finalTopLeft.y + height };
                break;

            case SelectedPoint.TOP_MIDDLE:
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y - magnetizedTopOffset.y };
                selectionCoords.finalBottomRight = { x: selectionCoords.finalTopLeft.x + width, y: selectionCoords.finalTopLeft.y + height };
                break;

            case SelectedPoint.TOP_RIGHT:
                pos = this.magnetizeX(pos);
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x + magnetizedBottomOffset.x - width, y: pos.y - magnetizedTopOffset.y };
                selectionCoords.finalBottomRight = {
                    x: pos.x + magnetizedBottomOffset.x,
                    y: selectionCoords.finalTopLeft.y + height,
                };
                break;

            case SelectedPoint.MIDDLE_LEFT:
                pos = this.magnetizeX(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y - magnetizedTopOffset.y };
                selectionCoords.finalBottomRight = { x: selectionCoords.finalTopLeft.x + width, y: selectionCoords.finalTopLeft.y + height };
                break;

            case SelectedPoint.CENTER:
                pos = this.magnetizeX(pos);
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y - magnetizedTopOffset.y };
                selectionCoords.finalBottomRight = {
                    x: selectionCoords.finalTopLeft.x + width,
                    y: selectionCoords.finalTopLeft.y + height,
                };
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                break;

            case SelectedPoint.MIDDLE_RIGHT:
                pos = this.magnetizeX(pos);
                selectionCoords.finalBottomRight = this.magnetizeX(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = this.magnetizeY(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = { x: pos.x + magnetizedBottomOffset.x, y: pos.y + magnetizedBottomOffset.y };
                selectionCoords.finalTopLeft = {
                    x: selectionCoords.finalBottomRight.x - width,
                    y: selectionCoords.finalBottomRight.y - height,
                };
                break;

            case SelectedPoint.BOTTOM_LEFT:
                pos = this.magnetizeX(pos);
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y + magnetizedBottomOffset.y - height };
                selectionCoords.finalBottomRight = {
                    x: pos.x - magnetizedTopOffset.x + width,
                    y: pos.y + magnetizedBottomOffset.y,
                };
                break;

            case SelectedPoint.BOTTOM_MIDDLE:
                pos = this.magnetizeY(pos);
                selectionCoords.finalTopLeft = { x: pos.x - magnetizedTopOffset.x, y: pos.y + magnetizedBottomOffset.y - height };
                selectionCoords.finalBottomRight = {
                    x: pos.x - magnetizedTopOffset.x + width,
                    y: pos.y + magnetizedBottomOffset.y,
                };
                break;

            case SelectedPoint.BOTTOM_RIGHT:
                pos = this.magnetizeX(pos);
                pos = this.magnetizeY(pos);
                selectionCoords.finalBottomRight = this.getMagnetizedOffsetPosition(selectionCoords.finalBottomRight);
                selectionCoords.finalBottomRight = { x: pos.x + magnetizedBottomOffset.x, y: pos.y + magnetizedBottomOffset.y };
                selectionCoords.finalTopLeft = {
                    x: selectionCoords.finalBottomRight.x - width,
                    y: selectionCoords.finalBottomRight.y - height,
                };
                break;
        }
    }

    magnetizeX(pos: Vec2): Vec2 {
        return { x: Math.round(pos.x / this.gridService.squareSize) * this.gridService.squareSize, y: pos.y };
    }

    magnetizeY(pos: Vec2): Vec2 {
        return { x: pos.x, y: Math.round(pos.y / this.gridService.squareSize) * this.gridService.squareSize };
    }

    getMagnetizedOffsetPosition(pos: Vec2): Vec2 {
        this.adjustedMouseMoveOffSet = {
            x: Math.round(this.mouseMoveOffset.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(this.mouseMoveOffset.y / this.gridService.squareSize) * this.gridService.squareSize,
        };
        return this.adjustedMouseMoveOffSet;
    }
}
