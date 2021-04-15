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
    private mouseOffsetTop: Vec2;
    private mouseOffsetBottom: Vec2;
    private dimension: Vec2;

    alignToProperMagnetPosition(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        this.mouseOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        this.mouseOffsetBottom = { x: selectionCoords.finalBottomRight.x - pos.x, y: selectionCoords.finalBottomRight.y - pos.y };

        let trueDeltaX = delta.x > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.x === 0) trueDeltaX = 0;

        let trueDeltaY = delta.y > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.y === 0) trueDeltaY = 0;

        const trueDelta = { x: trueDeltaX, y: trueDeltaY };
        this.dimension = {
            x: selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x,
            y: selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y,
        };

        this.mouseOffsetTop = this.getMagnetizedOffsetPosition();
        this.mouseOffsetBottom = this.getMagnetizedOffsetPosition();
        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                this.topLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.TOP_MIDDLE:
                this.topMid(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.TOP_RIGHT:
                this.topRight(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.MIDDLE_LEFT:
                this.midLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.CENTER:
                this.magCenter(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.MIDDLE_RIGHT:
                this.midRight(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_LEFT:
                this.botLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_MIDDLE:
                this.botMid(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                this.botRight(pos, selectionCoords, trueDelta);
                break;
        }
    }

    private finalMagnetized(pos: Vec2, magPosX: boolean, magPosY: boolean): Vec2 {
        if (magPosX) pos = this.magnetizeX(pos);
        if (magPosY) pos = this.magnetizeY(pos);
        return pos;
    }

    private translateCoords(coords: Vec2, offset: Vec2, dimension: Vec2): Vec2 {
        return { x: coords.x + offset.x + dimension.x, y: coords.y + offset.y + dimension.y };
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

    private magTopLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y }, { x: 0, y: 0 });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: 0, y: 0 });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        }
    }

    private magTopMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x + this.dimension.x / 2, y: pos.y }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x / 2, y: 0 },
            );
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x + this.dimension.x / 2, y: selectionCoords.finalTopLeft.y },
                true,
                true,
            );
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: -this.dimension.x / 2, y: 0 });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        }
    }

    private magTopRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: this.mouseOffsetBottom.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x, y: 0 },
            );
            selectionCoords.finalBottomRight = {
                x: pos.x + this.mouseOffsetBottom.x,
                y: selectionCoords.finalTopLeft.y + this.dimension.y,
            };
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, false, true);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - this.dimension.x;
            selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + this.dimension.y;
        }
    }

    private magMidLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x, y: pos.y + this.dimension.y / 2 }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: 0, y: -this.dimension.y / 2 },
            );
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + this.dimension.y / 2 },
                true,
                true,
            );
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: 0, y: -this.dimension.y / 2 });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        }
    }

    private magCenter(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(pos, { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y }, { x: 0, y: 0 });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta, { x: 0, y: 0 });
            selectionCoords.finalTopLeft = this.translateCoords(
                selectionCoords.finalBottomRight,
                { x: 0, y: 0 },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, true);
        }
    }

    private magMidRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x, y: pos.y + this.dimension.y / 2 }, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(
                pos,
                { x: this.mouseOffsetBottom.x, y: -this.mouseOffsetBottom.y },
                { x: 0, y: this.dimension.y / 2 },
            );
            selectionCoords.finalTopLeft = this.translateCoords(
                selectionCoords.finalBottomRight,
                { x: 0, y: 0 },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, false);
            selectionCoords.finalTopLeft = this.finalMagnetized(
                { x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + this.dimension.y / 2 },
                false,
                true,
            );
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y - this.dimension.y / 2;
            selectionCoords.finalTopLeft.x = selectionCoords.finalBottomRight.x - this.dimension.x;
            selectionCoords.finalBottomRight.y = selectionCoords.finalTopLeft.y + this.dimension.y;
        }
    }

    private magBotLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: this.mouseOffsetBottom.y },
                { x: 0, y: -this.dimension.y },
            );
            selectionCoords.finalBottomRight = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: this.mouseOffsetBottom.y },
                { x: this.dimension.x, y: 0 },
            );
        } else {
            selectionCoords.finalTopLeft = this.finalMagnetized(selectionCoords.finalTopLeft, true, false);
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, false, true);
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
            selectionCoords.finalBottomRight.x = selectionCoords.finalTopLeft.x + this.dimension.x;
            selectionCoords.finalTopLeft.y = selectionCoords.finalBottomRight.y - this.dimension.y;
        }
    }

    private magBotMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized({ x: pos.x + this.dimension.x / 2, y: pos.y }, true, true);
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: this.mouseOffsetBottom.y },
                { x: -this.dimension.x / 2, y: -this.dimension.y },
            );
            selectionCoords.finalBottomRight = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: this.mouseOffsetBottom.y },
                { x: this.dimension.x / 2, y: 0 },
            );
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(
                { x: selectionCoords.finalBottomRight.x - this.dimension.x / 2, y: selectionCoords.finalBottomRight.y },
                true,
                true,
            );
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta, { x: this.dimension.x / 2, y: 0 });
            selectionCoords.finalTopLeft = this.translateCoords(
                selectionCoords.finalBottomRight,
                { x: 0, y: 0 },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
        }
    }

    private magBotRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.finalMagnetized(pos, true, true);
            selectionCoords.finalBottomRight = this.getMagnetizedOffsetPosition();
            selectionCoords.finalBottomRight = this.translateCoords(pos, this.mouseOffsetBottom, { x: 0, y: 0 });
            selectionCoords.finalTopLeft = this.translateCoords(
                selectionCoords.finalBottomRight,
                { x: 0, y: 0 },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
        } else {
            selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalBottomRight, delta, { x: 0, y: 0 });
            selectionCoords.finalTopLeft = this.translateCoords(
                selectionCoords.finalBottomRight,
                { x: 0, y: 0 },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
        }
    }

    private topLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, delta);
        } else {
            this.magTopLeft(pos, selectionCoords, delta);
        }
    }

    private topMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magBotMid(pos, selectionCoords, delta);
        } else {
            this.magTopMid(pos, selectionCoords, delta);
        }
    }

    private topRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, delta);
        } else {
            this.magTopRight(pos, selectionCoords, delta);
        }
    }

    private midLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidRight(pos, selectionCoords, delta);
        } else {
            this.magMidLeft(pos, selectionCoords, delta);
        }
    }

    private midRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidLeft(pos, selectionCoords, delta);
        } else {
            this.magMidRight(pos, selectionCoords, delta);
        }
    }

    private botLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magBotRight(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, delta);
        } else {
            this.magBotLeft(pos, selectionCoords, delta);
        }
    }

    private botMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magTopMid(pos, selectionCoords, delta);
        } else {
            this.magBotMid(pos, selectionCoords, delta);
        }
    }

    private botRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magBotLeft(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magTopRight(pos, selectionCoords, delta);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magTopLeft(pos, selectionCoords, delta);
        } else {
            this.magBotRight(pos, selectionCoords, delta);
        }
    }
}
