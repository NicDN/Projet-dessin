import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetSelectionService } from './magnet-selection.service';

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
    constructor(private drawingService: DrawingService, private magnetSelectionService: MagnetSelectionService, private gridService: GridService) {}

    movingWithMouse: boolean = false;
    mouseMoveOffset: Vec2 = { x: 0, y: 0 };
    isUsingMagnet: boolean = false;

    readonly arrowMoveDelta: number = 3;

    movingWithArrows: boolean = false;
    private keyUpIsPressed: boolean = false;
    private keyDownIsPressed: boolean = false;
    private keyLeftIsPressed: boolean = false;
    private keyRightIsPressed: boolean = false;
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
        const emptyPosition = { x: 0, y: 0 };

        this.magnetSelectionService.isUsingMouse = false;
        if (this.isUsingMagnet) {
            this.alignToProperMagnetPosition(emptyPosition, selectionCoords, delta);
        } else {
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    moveSelectionWithMouse(ctx: CanvasRenderingContext2D, pos: Vec2, delta: Vec2, selectionCoords: SelectionCoords): void {
        const width = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        const height = selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y;

        this.magnetSelectionService.isUsingMouse = true;
        if (this.isUsingMagnet) {
            this.alignToProperMagnetPosition(pos, selectionCoords, delta);
        } else {
            selectionCoords.finalTopLeft = { x: pos.x - this.mouseMoveOffset.x, y: pos.y - this.mouseMoveOffset.y };
            selectionCoords.finalBottomRight = {
                x: selectionCoords.finalTopLeft.x + width,
                y: selectionCoords.finalTopLeft.y + height,
            };
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    alignToProperMagnetPosition(pos: Vec2, selectionCoords: SelectionCoords, delta: Vec2): void {
        this.magnetSelectionService.mouseOffsetTop = { x: pos.x - selectionCoords.finalTopLeft.x, y: pos.y - selectionCoords.finalTopLeft.y };
        this.magnetSelectionService.mouseOffsetBottom = {
            x: selectionCoords.finalBottomRight.x - pos.x,
            y: selectionCoords.finalBottomRight.y - pos.y,
        };

        let trueDeltaX = delta.x > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.x === 0) trueDeltaX = 0;

        let trueDeltaY = delta.y > 0 ? this.gridService.squareSize : -this.gridService.squareSize;
        if (delta.y === 0) trueDeltaY = 0;

        const trueDelta = { x: trueDeltaX, y: trueDeltaY };
        this.magnetSelectionService.dimension = {
            x: selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x,
            y: selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y,
        };

        this.magnetSelectionService.mouseOffsetTop = this.magnetSelectionService.getMagnetizedOffsetPosition();
        this.magnetSelectionService.mouseOffsetBottom = this.magnetSelectionService.getMagnetizedOffsetPosition();
        switch (this.magnetSelectionService.pointToMagnetize) {
            case SelectedPoint.TOP_LEFT:
                this.magnetSelectionService.topLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.TOP_MIDDLE:
                this.magnetSelectionService.topMid(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.TOP_RIGHT:
                this.magnetSelectionService.topRight(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.MIDDLE_LEFT:
                this.magnetSelectionService.midLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.CENTER:
                this.magnetSelectionService.magCenter(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.MIDDLE_RIGHT:
                this.magnetSelectionService.midRight(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_LEFT:
                this.magnetSelectionService.botLeft(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_MIDDLE:
                this.magnetSelectionService.botMid(pos, selectionCoords, trueDelta);
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                this.magnetSelectionService.botRight(pos, selectionCoords, trueDelta);
                break;
        }
    }
}
