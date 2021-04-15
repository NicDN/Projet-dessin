import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
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
    MOVING = 9,
    NO_POINT = -1,
}

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService {
    constructor(private gridService: GridService) {}

    movingWithMouse: boolean = false;
    mouseMoveOffset: Vec2;
    pointToMagnetize: number = 0;
    isUsingMagnet: boolean = false;

    readonly arrowMoveDelta: number = 3;

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

    moveSelectionWithArrows(delta: Vec2, selectionCoords: SelectionCoords): void {
        const width = Math.abs(selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x);
        const height = Math.abs(selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y);

        if (this.isUsingMagnet) {
            this.alignToProperMagnetArrowPosition(selectionCoords, delta.x, delta.y, width, height);
        } else {
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
        }
    }

    moveSelectionWithMouse(pos: Vec2, selectionCoords: SelectionCoords): void {
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
    }

    private alignToProperMagnetArrowPosition(selectionCoords: SelectionCoords, deltaX: number, deltaY: number, width: number, height: number): void {
        let trueDeltaX = deltaX > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (deltaX === 0) trueDeltaX = 0;

        let trueDeltaY = deltaY > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (deltaY === 0) trueDeltaY = 0;

        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, trueDeltaX, trueDeltaY, 0, 0);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.TOP_MIDDLE:
                selectionCoords.finalTopLeft = this.finalMagnetized(
                    { x: selectionCoords.finalTopLeft.x + width / 2, y: selectionCoords.finalTopLeft.y },
                    true,
                    true,
                );
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, trueDeltaX, trueDeltaY, -width / 2, 0);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.TOP_RIGHT:
                selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, false, true);
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
                selectionCoords.finalBottomRight.x += trueDeltaX;
                selectionCoords.finalTopLeft.y += trueDeltaY;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.MIDDLE_LEFT:
                selectionCoords.finalTopLeft = this.finalMagnetized(
                    { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + height / 2 },
                    true,
                    true,
                );
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, trueDeltaX, trueDeltaY, 0, -height / 2);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.CENTER:
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, trueDeltaX, trueDeltaY, 0, 0);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
                selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
                break;

            case SelectedPoint.MIDDLE_RIGHT:
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
                selectionCoords.finalTopLeft = this.finalMagnetized(
                    { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + height / 2 },
                    false,
                    true,
                );
                selectionCoords.finalBottomRight.x += trueDeltaX;
                selectionCoords.finalTopLeft.y += trueDeltaY - height / 2;
                selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - width;
                selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + height;
                break;

            case SelectedPoint.BOTTOM_LEFT:
                selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, false);
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, false, true);
                selectionCoords.finalTopLeft.x += trueDeltaX;
                selectionCoords.finalBottomRight.y += trueDeltaY;
                selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + width;
                selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - height;
                break;

            case SelectedPoint.BOTTOM_MIDDLE:
                selectionCoords.finalBottomRight = this.finalMagnetized(
                    { x: selectionCoords.finalBottomRight.x - width / 2, y: selectionCoords.finalBottomRight.y },
                    true,
                    true,
                );
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, trueDeltaX, trueDeltaY, width / 2, 0);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
                break;

            case SelectedPoint.BOTTOM_RIGHT:
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, trueDeltaX, trueDeltaY, 0, 0);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
                break;
        }
    }

    private alignToProperMagnetMousePosition(pos: Vec2, selectionCoords: SelectionCoords, width: number, height: number): void {
        let moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        let moveOffsetBottom = { x: selectionCoords.finalBottomRight.x - pos.x, y: selectionCoords.finalBottomRight.y - pos.y };

        moveOffsetTop = this.getMagnetizedOffsetPosition();
        moveOffsetBottom = this.getMagnetizedOffsetPosition();

        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                pos = this.finalMagnetized(pos, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, -moveOffsetTop.y, 0, 0);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.TOP_MIDDLE:
                pos = this.finalMagnetized({ x: pos.x + width / 2, y: pos.y }, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, -moveOffsetTop.y, -width / 2, 0);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.TOP_RIGHT:
                pos = this.finalMagnetized(pos, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, moveOffsetBottom.x, -moveOffsetTop.y, -width, 0);
                selectionCoords.finalBottomRight = {
                    x: pos.x + moveOffsetBottom.x,
                    y: selectionCoords.finalTopLeft.y + height,
                };
                break;

            case SelectedPoint.MIDDLE_LEFT:
                pos = this.finalMagnetized({ x: pos.x, y: pos.y + height / 2 }, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, -moveOffsetTop.y, 0, -height / 2);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                break;

            case SelectedPoint.CENTER:
                pos = this.finalMagnetized(pos, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, -moveOffsetTop.y, 0, 0);
                selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
                selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
                break;

            case SelectedPoint.MIDDLE_RIGHT:
                pos = this.finalMagnetized({ x: pos.x, y: pos.y + height / 2 }, true, true);
                selectionCoords.finalBottomRight = this.translateCoords(pos, moveOffsetBottom.x, -moveOffsetBottom.y, 0, height / 2);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
                break;

            case SelectedPoint.BOTTOM_LEFT:
                pos = this.finalMagnetized(pos, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, moveOffsetBottom.y, 0, -height);
                selectionCoords.finalBottomRight = this.translateCoords(pos, -moveOffsetTop.x, moveOffsetBottom.y, width, 0);
                break;

            case SelectedPoint.BOTTOM_MIDDLE:
                pos = this.finalMagnetized({ x: pos.x + width / 2, y: pos.y }, true, true);
                selectionCoords.finalTopLeft = this.translateCoords(pos, -moveOffsetTop.x, moveOffsetBottom.y, -width / 2, -height);
                selectionCoords.finalBottomRight = this.translateCoords(pos, -moveOffsetTop.x, moveOffsetBottom.y, width / 2, 0);
                break;

            case SelectedPoint.BOTTOM_RIGHT:
                pos = this.finalMagnetized(pos, true, true);
                selectionCoords.finalBottomRight = this.getMagnetizedOffsetPosition();
                selectionCoords.finalBottomRight = this.translateCoords(pos, moveOffsetBottom.x, moveOffsetBottom.y, 0, 0);
                selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
                break;
        }
    }

    private finalMagnetized(pos: Vec2, magPosX: boolean, magPosY: boolean): Vec2 {
        if (magPosX) pos = this.magnetizeX(pos);
        if (magPosY) pos = this.magnetizeY(pos);
        return pos;
    }

    private translateCoords(coords: Vec2, offsetX: number, offsetY: number, width: number, height: number): Vec2 {
        return { x: coords.x + offsetX + width, y: coords.y + offsetY + height };
    }

    private magnetizeX(pos: Vec2): Vec2 {
        return { x: Math.round(pos.x / this.gridService.squareSize) * this.gridService.squareSize, y: pos.y };
    }

    private magnetizeY(pos: Vec2): Vec2 {
        return { x: pos.x, y: Math.round(pos.y / this.gridService.squareSize) * this.gridService.squareSize };
    }

    private getMagnetizedOffsetPosition(): Vec2 {
        return {
            x: Math.round(this.mouseMoveOffset.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(this.mouseMoveOffset.y / this.gridService.squareSize) * this.gridService.squareSize,
        };
    }
}
