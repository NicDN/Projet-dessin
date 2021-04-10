import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { SelectedPoint } from './move-selection.service';
// tslint:disable: no-magic-numbers
@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    constructor(protected shapeService: ShapeService) {}
    private readonly selectingPointOffSet: number = 13;
    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };

    readonly NO_POINT_SELECTED_INDEX: number = -1;
    selectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    previewSelectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    shiftKeyIsDown: boolean = false;
    lastMousePos: Vec2;

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
        console.clear();
        console.log(this.previewSelectedPointIndex);
    }

    resizeSelection(pos: Vec2, coords: SelectionCoords): void {
        let distX: number;
        let distY: number;
        let endCoordX: number;
        let endCoordY: number;
        const width = Math.abs(coords.finalBottomRight.x - coords.finalTopLeft.x);
        const height = Math.abs(coords.finalBottomRight.y - coords.finalTopLeft.y);
        this.lastMousePos = pos;
        switch (this.selectedPointIndex) {
            case SelectedPoint.TOP_LEFT:
                coords.finalTopLeft.y = pos.y;
                coords.finalTopLeft.x = pos.x;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalBottomRight.x);
                    distY = Math.abs(pos.y - coords.finalBottomRight.y);
                    distY = distX * (height / width);
                    endCoordX = coords.finalBottomRight.x + Math.sign(pos.x - coords.finalBottomRight.x) * distX;
                    endCoordY = coords.finalBottomRight.y + Math.sign(pos.y - coords.finalBottomRight.y) * distY;
                    coords.finalTopLeft.y = endCoordY;
                    coords.finalTopLeft.x = endCoordX;
                }
                break;
            case SelectedPoint.BOTTOM_LEFT:
                coords.finalTopLeft.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalBottomRight.x);
                    distY = Math.abs(pos.y - coords.finalTopLeft.y);
                    distY = distX * (height / width);
                    endCoordX = coords.finalBottomRight.x + Math.sign(pos.x - coords.finalBottomRight.x) * distX;
                    endCoordY = coords.finalTopLeft.y + Math.sign(pos.y - coords.finalTopLeft.y) * distY;
                    coords.finalTopLeft.x = endCoordX;
                    coords.finalBottomRight.y = endCoordY;
                }
                break;
            case SelectedPoint.TOP_RIGHT:
                coords.finalTopLeft.y = pos.y;
                coords.finalBottomRight.x = pos.x;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalTopLeft.x);
                    distY = Math.abs(pos.y - coords.finalBottomRight.y);
                    distY = distX * (height / width);
                    endCoordX = coords.finalTopLeft.x + Math.sign(pos.x - coords.finalTopLeft.x) * distX;
                    endCoordY = coords.finalBottomRight.y + Math.sign(pos.y - coords.finalBottomRight.y) * distY;
                    coords.finalBottomRight.x = endCoordX;
                    coords.finalTopLeft.y = endCoordY;
                }
                break;
            case SelectedPoint.BOTTOM_RIGHT:
                coords.finalBottomRight.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalTopLeft.x);
                    distY = Math.abs(pos.y - coords.finalTopLeft.y);
                    distY = distX * (height / width);
                    endCoordX = coords.finalTopLeft.x + Math.sign(pos.x - coords.finalTopLeft.x) * distX;
                    endCoordY = coords.finalTopLeft.y + Math.sign(pos.y - coords.finalTopLeft.y) * distY;
                    coords.finalBottomRight.y = endCoordY;
                    coords.finalBottomRight.x = endCoordX;
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
}
