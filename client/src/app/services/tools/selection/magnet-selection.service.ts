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
    NO_POINT = -1,
}

@Injectable({
    providedIn: 'root',
})
export class MagnetSelectionService {
    constructor(private gridService: GridService) {}

    pointToMagnetize: number = 0;
    mouseMoveOffset: Vec2;

    alignToProperMagnetArrowPosition(selectionCoords: SelectionCoords, deltaX: number, deltaY: number, width: number, height: number): void {
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

    alignToProperMagnetMousePosition(pos: Vec2, selectionCoords: SelectionCoords, width: number, height: number): void {
        let moveOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        let moveOffsetBottom = { x: selectionCoords.finalBottomRight.x - pos.x, y: selectionCoords.finalBottomRight.y - pos.y };

        moveOffsetTop = this.getMagnetizedOffsetPosition();
        moveOffsetBottom = this.getMagnetizedOffsetPosition();
        switch (this.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                this.handleMirrorTopLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.TOP_MIDDLE:
                this.handleMirrorTopMiddle(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.TOP_RIGHT:
                this.handleMirrorTopRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.MIDDLE_LEFT:
                this.handleMirrorMiddleLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.CENTER:
                this.magnetizeCenterMouse(pos, selectionCoords, moveOffsetTop, width, height);
                break;
            case SelectedPoint.MIDDLE_RIGHT:
                this.handleMirrorMiddleRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.BOTTOM_LEFT:
                this.handleMirrorBottomLeft(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.BOTTOM_MIDDLE:
                this.handleMirrorBottomMiddle(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                this.handleMirrorBottomRight(pos, selectionCoords, moveOffsetTop, moveOffsetBottom, width, height);
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

    private magnetizeTopLeftMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized(pos, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, 0);
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
    }

    private magnetizeTopMiddleMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized({ x: pos.x + width / 2, y: pos.y }, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, -width / 2, 0);
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
    }

    private magnetizeTopRightMouse(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        pos = this.finalMagnetized(pos, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, mouseOffsetBottom.x, -mouseOffsetTop.y, -width, 0);
        selectionCoords.finalBottomRight = {
            x: pos.x + mouseOffsetBottom.x,
            y: selectionCoords.finalTopLeft.y + height,
        };
    }

    private magnetizeMiddleLeftMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized({ x: pos.x, y: pos.y + height / 2 }, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, -height / 2);
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
    }

    private magnetizeCenterMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetTop: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized(pos, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, -mouseOffsetTop.y, 0, 0);
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, 0, 0, width, height);
        selectionCoords.finalBottomRight = this.finalMagnetized(selectionCoords.finalBottomRight, true, true);
    }

    private magnetizeMiddleRightMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetBottom: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized({ x: pos.x, y: pos.y + height / 2 }, true, true);
        selectionCoords.finalBottomRight = this.translateCoords(pos, mouseOffsetBottom.x, -mouseOffsetBottom.y, 0, height / 2);
        selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
    }

    private magnetizeBottomLeftMouse(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        pos = this.finalMagnetized(pos, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, 0, -height);
        selectionCoords.finalBottomRight = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, width, 0);
    }

    private magnetizeBottomMiddleMouse(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        pos = this.finalMagnetized({ x: pos.x + width / 2, y: pos.y }, true, true);
        selectionCoords.finalTopLeft = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, -width / 2, -height);
        selectionCoords.finalBottomRight = this.translateCoords(pos, -mouseOffsetTop.x, mouseOffsetBottom.y, width / 2, 0);
    }

    private magnetizeBottomRightMouse(pos: Vec2, selectionCoords: SelectionCoords, mouseOffsetBottom: Vec2, width: number, height: number): void {
        pos = this.finalMagnetized(pos, true, true);
        selectionCoords.finalBottomRight = this.getMagnetizedOffsetPosition();
        selectionCoords.finalBottomRight = this.translateCoords(pos, mouseOffsetBottom.x, mouseOffsetBottom.y, 0, 0);
        selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalBottomRight, 0, 0, -width, -height);
    }

    private handleMirrorTopLeft(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magnetizeTopRightMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magnetizeBottomLeftMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magnetizeBottomRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        } else {
            this.magnetizeTopLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        }
    }

    private handleMirrorTopMiddle(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magnetizeBottomMiddleMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else {
            this.magnetizeTopMiddleMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        }
    }

    private handleMirrorTopRight(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magnetizeTopLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magnetizeBottomRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magnetizeBottomLeftMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else {
            this.magnetizeTopRightMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        }
    }

    private handleMirrorMiddleLeft(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magnetizeMiddleRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        } else {
            this.magnetizeMiddleLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        }
    }

    private handleMirrorMiddleRight(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magnetizeMiddleLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        } else {
            this.magnetizeMiddleRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        }
    }

    private handleMirrorBottomLeft(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magnetizeBottomRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magnetizeTopLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magnetizeTopRightMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else {
            this.magnetizeBottomLeftMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        }
    }

    private handleMirrorBottomMiddle(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magnetizeTopMiddleMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        } else {
            this.magnetizeBottomMiddleMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        }
    }

    private handleMirrorBottomRight(
        pos: Vec2,
        selectionCoords: SelectionCoords,
        mouseOffsetTop: Vec2,
        mouseOffsetBottom: Vec2,
        width: number,
        height: number,
    ): void {
        if (this.yIsFlipped(selectionCoords) && !this.xIsFlipped(selectionCoords)) {
            this.magnetizeBottomLeftMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && !this.yIsFlipped(selectionCoords)) {
            this.magnetizeTopRightMouse(pos, selectionCoords, mouseOffsetTop, mouseOffsetBottom, width, height);
        } else if (this.xIsFlipped(selectionCoords) && this.yIsFlipped(selectionCoords)) {
            this.magnetizeTopLeftMouse(pos, selectionCoords, mouseOffsetTop, width, height);
        } else {
            this.magnetizeBottomRightMouse(pos, selectionCoords, mouseOffsetBottom, width, height);
        }
    }
}
