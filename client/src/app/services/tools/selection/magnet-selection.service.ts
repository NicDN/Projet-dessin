import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetSelectionService {
    constructor(private gridService: GridService) {}

    pointToMagnetize: number = 0;
    mouseMoveOffset: Vec2 = { x: 0, y: 0 };
    isUsingMouse: boolean = false;
    mouseOffsetTop: Vec2;
    dimension: Vec2;

    private magPos(pos: Vec2): Vec2 {
        return {
            x: Math.round(pos.x / this.gridService.squareSize) * this.gridService.squareSize,
            y: Math.round(pos.y / this.gridService.squareSize) * this.gridService.squareSize,
        };
    }

    private translateCoords(coords: Vec2, offset: Vec2, dimension: Vec2): Vec2 {
        return { x: coords.x + offset.x + dimension.x, y: coords.y + offset.y + dimension.y };
    }

    getMagnetizedOffsetPosition(): Vec2 {
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
            pos = this.magPos(pos);
            selectionCoords.finalTopLeft = this.translateCoords(pos, { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y }, { x: 0, y: 0 });
        } else {
            selectionCoords.finalTopLeft = this.magPos(selectionCoords.finalTopLeft);
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: 0, y: 0 });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magTopMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x / 2, y: pos.y });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x / 2, y: 0 },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x / 2,
                y: selectionCoords.finalTopLeft.y,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: -this.dimension.x / 2, y: 0 });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magTopRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x, y: pos.y });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x, y: 0 },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x,
                y: selectionCoords.finalTopLeft.y,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: -this.dimension.x, y: 0 });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magMidLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x, y: pos.y + this.dimension.y / 2 });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: 0, y: -this.dimension.y / 2 },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x,
                y: selectionCoords.finalTopLeft.y + this.dimension.y / 2,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: 0, y: -this.dimension.y / 2 });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    magCenter(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x / 2, y: pos.y + this.dimension.y / 2 });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x / 2, y: -this.dimension.y / 2 },
            );
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x / 2,
                y: selectionCoords.finalTopLeft.y + this.dimension.y / 2,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, {
                x: -this.dimension.x / 2,
                y: -this.dimension.y / 2,
            });
            selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
        }
    }

    private magMidRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x, y: pos.y + this.dimension.y / 2 });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x, y: -this.dimension.y / 2 },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x,
                y: selectionCoords.finalTopLeft.y + this.dimension.y / 2,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, {
                x: -this.dimension.x,
                y: -this.dimension.y / 2,
            });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magBotLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x, y: pos.y + this.dimension.y });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: 0, y: -this.dimension.y },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({ x: selectionCoords.finalTopLeft.x, y: selectionCoords.finalTopLeft.y + this.dimension.y });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, {
                x: 0,
                y: -this.dimension.y,
            });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magBotMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x / 2, y: pos.y + this.dimension.y });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x / 2, y: -this.dimension.y },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x / 2,
                y: selectionCoords.finalTopLeft.y + this.dimension.y,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, {
                x: -this.dimension.x / 2,
                y: -this.dimension.y,
            });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    private magBotRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.isUsingMouse) {
            pos = this.magPos({ x: pos.x + this.dimension.x, y: pos.y + this.dimension.y });
            selectionCoords.finalTopLeft = this.translateCoords(
                pos,
                { x: -this.mouseOffsetTop.x, y: -this.mouseOffsetTop.y },
                { x: -this.dimension.x, y: -this.dimension.y },
            );
        } else {
            selectionCoords.finalTopLeft = this.magPos({
                x: selectionCoords.finalTopLeft.x + this.dimension.x,
                y: selectionCoords.finalTopLeft.y + this.dimension.y,
            });
            selectionCoords.finalTopLeft = this.translateCoords(selectionCoords.finalTopLeft, delta, { x: -this.dimension.x, y: -this.dimension.y });
        }
        selectionCoords.finalBottomRight = this.translateCoords(selectionCoords.finalTopLeft, { x: 0, y: 0 }, this.dimension);
    }

    topLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
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

    topMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magBotMid(pos, selectionCoords, delta);
        } else {
            this.magTopMid(pos, selectionCoords, delta);
        }
    }

    topRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
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

    midLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidRight(pos, selectionCoords, delta);
        } else {
            this.magMidLeft(pos, selectionCoords, delta);
        }
    }

    midRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.yIsFlipped(selectionCoords)) {
            this.magMidLeft(pos, selectionCoords, delta);
        } else {
            this.magMidRight(pos, selectionCoords, delta);
        }
    }

    botLeft(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
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

    botMid(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        if (this.xIsFlipped(selectionCoords)) {
            this.magTopMid(pos, selectionCoords, delta);
        } else {
            this.magBotMid(pos, selectionCoords, delta);
        }
    }

    botRight(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
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
