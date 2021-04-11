import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { SelectedPoint } from './move-selection.service';
// tslint:disable: no-magic-numbers
@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    private readonly selectingPointOffSet: number = 13;
    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };

    readonly NO_POINT_SELECTED_INDEX: number = -1;
    selectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    previewSelectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    shiftKeyIsDown: boolean = false;
    lastMousePos: Vec2 = { x: 0, y: 0 };
    lastDimensions: Vec2 = { x: 0, y: 0 };

    readonly controlPointWidth: number = 6;
    readonly halfControlPointWidth: number = this.controlPointWidth / 2;

    getControlPointsCoords(begin: Vec2, end: Vec2): Vec2[] {
        return [
            { x: begin.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth }, // Top left
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth }, // middle top
            { x: end.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth }, // top right
            { x: begin.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth }, // middle left
            { x: (end.x + begin.x) / 2, y: (begin.y + end.y) / 2 },
            { x: end.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth }, // middle right
            { x: begin.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth }, // bottom left
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth }, // middle bottom
            { x: end.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth }, // bottom right
        ];
    }

    drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        this.getControlPointsCoords(begin, end).forEach((coord: Vec2, index) => {
            if (index !== 4) ctx.rect(coord.x, coord.y, this.controlPointWidth, this.controlPointWidth);
        });
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.boxColor.rgbValue;
        ctx.globalAlpha = this.boxColor.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
        this.drawControlPoints(ctx, begin, end);
    }

    checkIfAControlPointHasBeenSelected(mousePosition: Vec2, selectionCoords: SelectionCoords, preview: boolean): void {
        if (!preview) this.selectedPointIndex = this.NO_POINT_SELECTED_INDEX;
        this.getControlPointsCoords(selectionCoords.finalTopLeft, selectionCoords.finalBottomRight).forEach((point, index) => {
            if (Math.abs(mousePosition.x - point.x) < this.selectingPointOffSet && Math.abs(mousePosition.y - point.y) < this.selectingPointOffSet) {
                if (!preview) this.selectedPointIndex = index;
                this.previewSelectedPointIndex = index;
            }
        });
    }

    resizeSelection(pos: Vec2, coords: SelectionCoords): void {
        const width = Math.abs(coords.finalBottomRight.x - coords.finalTopLeft.x);
        const height = Math.abs(coords.finalBottomRight.y - coords.finalTopLeft.y);
        let endCoords = { x: 0, y: 0 };

        this.lastMousePos = pos;
        switch (this.selectedPointIndex) {
            case SelectedPoint.TOP_LEFT:
                coords.finalTopLeft.y = pos.y;
                coords.finalTopLeft.x = pos.x;
                if (this.shiftKeyIsDown) {
                    endCoords = this.findEndCoords(pos, coords.finalBottomRight.x, coords.finalBottomRight.y, height, width);
                    coords.finalTopLeft.y = endCoords.y;
                    coords.finalTopLeft.x = endCoords.x;
                }
                break;
            case SelectedPoint.BOTTOM_LEFT:
                coords.finalTopLeft.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    endCoords = this.findEndCoords(pos, coords.finalBottomRight.x, coords.finalTopLeft.y, height, width);
                    coords.finalTopLeft.x = endCoords.x;
                    coords.finalBottomRight.y = endCoords.y;
                }
                break;
            case SelectedPoint.TOP_RIGHT:
                coords.finalTopLeft.y = pos.y;
                coords.finalBottomRight.x = pos.x;
                if (this.shiftKeyIsDown) {
                    endCoords = this.findEndCoords(pos, coords.finalTopLeft.x, coords.finalBottomRight.y, height, width);
                    coords.finalBottomRight.x = endCoords.x;
                    coords.finalTopLeft.y = endCoords.y;
                }
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                coords.finalBottomRight.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    endCoords = this.findEndCoords(pos, coords.finalTopLeft.x, coords.finalTopLeft.y, height, width);
                    coords.finalBottomRight.y = endCoords.y;
                    coords.finalBottomRight.x = endCoords.x;
                }
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

    findDistance(pos: Vec2, offSetX: number, height: number, width: number): Vec2 {
        if (height === 0) {
            height = this.lastDimensions.y;
        }
        if (width === 0) {
            width = this.lastDimensions.x;
        }
        const distX = Math.abs(pos.x - offSetX);
        const distY = distX * (height / width);
        return { x: distX, y: distY };
    }

    findEndCoords(pos: Vec2, coordsX: number, coordsY: number, height: number, width: number): Vec2 {
        const dist = this.findDistance(pos, coordsX, height, width);
        return { x: coordsX + Math.sign(pos.x - coordsX) * dist.x, y: coordsY + Math.sign(pos.y - coordsY) * dist.y };
    }
}
