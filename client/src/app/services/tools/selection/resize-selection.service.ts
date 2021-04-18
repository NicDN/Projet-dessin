import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { SelectedPoint } from './magnet-selection.service';

@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    private readonly SELECTING_POINT_OFFSET: number = 13;
    private readonly BOX_COLOR: Color = { rgbValue: '#0000FF', opacity: 1 };
    private readonly NO_POINT_SELECTED_INDEX: number = -1;
    private readonly CONTROL_POINT_WIDTH: number = 6;
    private readonly HALF_CONTROL_POINT_WIDTH: number = this.CONTROL_POINT_WIDTH / 2;
    private width: number = 0;
    private height: number = 0;
    private endCoords: Vec2 = { x: 0, y: 0 };
    private readonly POINT_THICKNESS: number = 5;

    selectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    previewSelectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    shiftKeyIsDown: boolean = false;
    lastMousePos: Vec2 = { x: 0, y: 0 };
    lastDimensions: Vec2 = { x: 0, y: 0 };

    private getControlPointsCoords(begin: Vec2, end: Vec2): Vec2[] {
        return [
            { x: begin.x - this.HALF_CONTROL_POINT_WIDTH, y: begin.y - this.HALF_CONTROL_POINT_WIDTH }, // Top left
            { x: (end.x + begin.x) / 2 - this.HALF_CONTROL_POINT_WIDTH, y: begin.y - this.HALF_CONTROL_POINT_WIDTH }, // middle top
            { x: end.x - this.HALF_CONTROL_POINT_WIDTH, y: begin.y - this.HALF_CONTROL_POINT_WIDTH }, // top right
            { x: begin.x - this.HALF_CONTROL_POINT_WIDTH, y: (begin.y + end.y) / 2 - this.HALF_CONTROL_POINT_WIDTH }, // middle left
            { x: (end.x + begin.x) / 2, y: (begin.y + end.y) / 2 },
            { x: end.x - this.HALF_CONTROL_POINT_WIDTH, y: (begin.y + end.y) / 2 - this.HALF_CONTROL_POINT_WIDTH }, // middle right
            { x: begin.x - this.HALF_CONTROL_POINT_WIDTH, y: end.y - this.HALF_CONTROL_POINT_WIDTH }, // bottom left
            { x: (end.x + begin.x) / 2 - this.HALF_CONTROL_POINT_WIDTH, y: end.y - this.HALF_CONTROL_POINT_WIDTH }, // middle bottom
            { x: end.x - this.HALF_CONTROL_POINT_WIDTH, y: end.y - this.HALF_CONTROL_POINT_WIDTH }, // bottom right
        ];
    }

    private drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = this.POINT_THICKNESS;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        this.getControlPointsCoords(begin, end).forEach((coord: Vec2, index) => {
            if (index !== SelectedPoint.CENTER) ctx.rect(coord.x, coord.y, this.CONTROL_POINT_WIDTH, this.CONTROL_POINT_WIDTH);
        });
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.BOX_COLOR.rgbValue;
        ctx.globalAlpha = this.BOX_COLOR.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
        this.drawControlPoints(ctx, begin, end);
    }

    checkIfAControlPointHasBeenSelected(mousePosition: Vec2, selectionCoords: SelectionCoords, preview: boolean): void {
        if (!preview) this.selectedPointIndex = this.NO_POINT_SELECTED_INDEX;
        this.getControlPointsCoords(selectionCoords.finalTopLeft, selectionCoords.finalBottomRight).forEach((point, index) => {
            if (
                Math.abs(mousePosition.x - point.x) < this.SELECTING_POINT_OFFSET &&
                Math.abs(mousePosition.y - point.y) < this.SELECTING_POINT_OFFSET
            ) {
                if (!preview) this.selectedPointIndex = index;
                this.previewSelectedPointIndex = index;
            }
        });
    }

    resizeSelection(pos: Vec2, coords: SelectionCoords): void {
        this.width = Math.abs(coords.finalBottomRight.x - coords.finalTopLeft.x);
        this.height = Math.abs(coords.finalBottomRight.y - coords.finalTopLeft.y);
        this.lastMousePos = pos;

        switch (this.selectedPointIndex) {
            case SelectedPoint.TOP_LEFT:
                this.handleTopLeft(pos, coords);
                break;
            case SelectedPoint.BOTTOM_LEFT:
                this.handleBottomLeft(pos, coords);
                break;
            case SelectedPoint.TOP_RIGHT:
                this.handleTopRight(pos, coords);
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                this.handleBottomRight(pos, coords);
                break;
            case SelectedPoint.TOP_MIDDLE:
                coords.finalTopLeft.y = pos.y;
                break;
            case SelectedPoint.BOTTOM_MIDDLE:
                coords.finalBottomRight.y = pos.y;
                break;
            case SelectedPoint.MIDDLE_LEFT:
                coords.finalTopLeft.x = pos.x;
                break;
            case SelectedPoint.MIDDLE_RIGHT:
                coords.finalBottomRight.x = pos.x;
                break;
        }
    }

    private handleTopLeft(pos: Vec2, coords: SelectionCoords): void {
        coords.finalTopLeft.y = pos.y;
        coords.finalTopLeft.x = pos.x;
        if (this.shiftKeyIsDown) {
            this.endCoords = this.findEndCoords(pos, coords.finalBottomRight.x, coords.finalBottomRight.y);
            coords.finalTopLeft.y = this.endCoords.y;
            coords.finalTopLeft.x = this.endCoords.x;
        }
    }

    private handleBottomLeft(pos: Vec2, coords: SelectionCoords): void {
        coords.finalTopLeft.x = pos.x;
        coords.finalBottomRight.y = pos.y;
        if (this.shiftKeyIsDown) {
            this.endCoords = this.findEndCoords(pos, coords.finalBottomRight.x, coords.finalTopLeft.y);
            coords.finalTopLeft.x = this.endCoords.x;
            coords.finalBottomRight.y = this.endCoords.y;
        }
    }

    private handleTopRight(pos: Vec2, coords: SelectionCoords): void {
        coords.finalTopLeft.y = pos.y;
        coords.finalBottomRight.x = pos.x;
        if (this.shiftKeyIsDown) {
            this.endCoords = this.findEndCoords(pos, coords.finalTopLeft.x, coords.finalBottomRight.y);
            coords.finalBottomRight.x = this.endCoords.x;
            coords.finalTopLeft.y = this.endCoords.y;
        }
    }

    private handleBottomRight(pos: Vec2, coords: SelectionCoords): void {
        coords.finalBottomRight.x = pos.x;
        coords.finalBottomRight.y = pos.y;
        if (this.shiftKeyIsDown) {
            this.endCoords = this.findEndCoords(pos, coords.finalTopLeft.x, coords.finalTopLeft.y);
            coords.finalBottomRight.y = this.endCoords.y;
            coords.finalBottomRight.x = this.endCoords.x;
        }
    }

    private findDistance(pos: Vec2, offSetX: number): Vec2 {
        if (this.height === 0) {
            this.height = this.lastDimensions.y;
        }
        if (this.width === 0) {
            this.width = this.lastDimensions.x;
        }
        const distX = Math.abs(pos.x - offSetX);
        const distY = distX * (this.height / this.width);
        return { x: distX, y: distY };
    }

    private findEndCoords(pos: Vec2, coordsX: number, coordsY: number): Vec2 {
        const dist = this.findDistance(pos, coordsX);
        return { x: coordsX + Math.sign(pos.x - coordsX) * dist.x, y: coordsY + Math.sign(pos.y - coordsY) * dist.y };
    }
}
