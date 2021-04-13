import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid.service';

// tslint:disable: max-file-line-count
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
export class MagnetSelectionService {
    constructor(private gridService: GridService) {}

    pointToMagnetize: number = 0;
    mouseMoveOffset: Vec2 = { x: 0, y: 0 };
    isUsingMouse: boolean = false;

    alignToProperMagnetMousePosition(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2, width: number, height: number): void {
        let moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        let moveOffsetBottom = { x: selectionCoords.finalBottomRight.x - pos.x, y: selectionCoords.finalBottomRight.y - pos.y };

        let trueDeltaX = delta.x > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.x === 0) trueDeltaX = 0;

        let trueDeltaY = delta.y > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.y === 0) trueDeltaY = 0;

        const trueDelta = { x: trueDeltaX, y: trueDeltaY };
        const dimension = { x: width, y: height };

        moveOffsetTop = this.getMagnetizedOffsetPosition();
        moveOffsetBottom = this.getMagnetizedOffsetPosition();
        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                this.topLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.TOP_MIDDLE:
                this.topMid(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.TOP_RIGHT:
                this.topRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.MIDDLE_LEFT:
                this.midLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.CENTER:
                this.magCenter(pos, selectionCoords, moveOffsetTop, trueDelta, dimension);
                break;
            case SelectedPoint.MIDDLE_RIGHT:
                this.midRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.BOTTOM_LEFT:
                this.botLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.BOTTOM_MIDDLE:
                this.botMid(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                this.botRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, trueDelta, dimension);
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

    private yIsFlipped(selectionCoords: SelectionCoords): boolean {
        return selectionCoords.finalBottomRight.x < selectionCoords.finalTopLeft.x;
    }

    private xIsFlipped(selectionCoords: SelectionCoords): boolean {
        return selectionCoords.finalBottomRight.y < selectionCoords.finalTopLeft.y;
    }

    private magTopLeft(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, 0);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta.x, delta.y, 0, 0);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        }
    }

    private magTopMid(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x + dimension.x / 2, y: pos.y }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, -dimension.y / 2, 0);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x + dimension.x / 2, y: selectionCoords.finalTopLeft.y },
                true,
                true,
            );
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta.x, delta.y, -dimension.x / 2, 0);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        }
    }

    private magTopRight(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        delta: Vec2,
        dimension: Vec2,
    ): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, mouseOffsetBottom.x, -mouseOffsetTop.y, -dimension.x, 0);
            selectionCoords.finalBottomRight = {
                x: pos.x + mouseOffsetBottom.x,
                y: selectionCoords.finalTopLeft.y + dimension.y,
            };
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, false, true);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - dimension.x;
            selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + dimension.y;
        }
    }

    private magMidLeft(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x, y: pos.y + dimension.y / 2 }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, -dimension.y / 2);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + dimension.y / 2 },
                true,
                true,
            );
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta.x, delta.y, 0, -dimension.y / 2);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
        }
    }

    private magCenter(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, 0);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, dimension.x, dimension.y);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta.x, delta.y, 0, 0);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -dimension.x, -dimension.y);
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
        }
    }

    private magMidRight(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x, y: pos.y + dimension.y / 2 }, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(pos, mouseOffsetBottom.x, -mouseOffsetBottom.y, 0, dimension.y / 2);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -dimension.x, -dimension.y);
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + dimension.y / 2 },
                false,
                true,
            );
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y - dimension.y / 2;
            selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - dimension.x;
            selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + dimension.y;
        }
    }

    private magBotLeft(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        delta: Vec2,
        dimension: Vec2,
    ): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, 0, -dimension.y);
            selectionCoords.finalBottomRight = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, dimension.x, 0);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, false);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, false, true);
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
            selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + dimension.x;
            selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - dimension.y;
        }
    }

    private magBotMid(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        delta: Vec2,
        dimension: Vec2,
    ): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x + dimension.x / 2, y: pos.y }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, -dimension.x / 2, -dimension.y);
            selectionCoords.finalBottomRight = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, dimension.x / 2, 0);
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(
                { x: selectionCoords.finalBottomRight.x - dimension.x / 2, y: selectionCoords.finalBottomRight.y },
                true,
                true,
            );
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta.x, delta.y, dimension.x / 2, 0);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -dimension.x, -dimension.y);
        }
    }

    private magBotRight(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalBottomRight = this.getMagnetizedOffsetPosition();
            selectionCoords.finalBottomRight = this.translateCoords(pos, mouseOffsetBottom.x, mouseOffsetBottom.y, 0, 0);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -dimension.x, -dimension.y);
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta.x, delta.y, 0, 0);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -dimension.x, -dimension.y);
        }
    }

    private topLeft(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        } else {
            this.magTopLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        }
    }

    private topMid(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magBotMid(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else {
            this.magTopMid(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        }
    }

    private topRight(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else {
            this.magTopRight(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        }
    }

    private midLeft(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        } else {
            this.magMidLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        }
    }

    private midRight(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        } else {
            this.magMidRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        }
    }

    private botLeft(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else {
            this.magBotLeft(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        }
    }

    private botMid(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magTopMid(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        } else {
            this.magBotMid(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        }
    }

    private botRight(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, mouseOffsetBottom: Vec2, delta: Vec2, dimension: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, delta, dimension);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, mouseOffsetTop, delta, dimension);
        } else {
            this.magBotRight(pos, selectionCoords, mouseOffsetBottom, delta, dimension);
        }
    }
}
