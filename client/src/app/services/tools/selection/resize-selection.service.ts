import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    constructor(protected shapeService: ShapeService) {}
    private readonly selectingPointOffSet: number = 13;

    readonly NO_POINT_SELECTED_INDEX: number = -1;
    selectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    previewSelectedPointIndex: number = this.NO_POINT_SELECTED_INDEX;
    shiftKeyIsDown: boolean = false;

    readonly controlPointWidth: number = 6;
    readonly halfControlPointWidth: number = this.controlPointWidth / 2;

    getControlPointsCoords(begin: Vec2, end: Vec2): Vec2[] {
        return [
            { x: begin.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: begin.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: begin.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth },
        ];
    }

    drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        this.getControlPointsCoords(begin, end).forEach((coord: Vec2) => ctx.rect(coord.x, coord.y, this.controlPointWidth, this.controlPointWidth));
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    checkIfAControlPointHasBeenSelected(mousePosition: Vec2, selectionCoords: SelectionCoords, preview: boolean): void {
        if (!preview) this.selectedPointIndex = this.NO_POINT_SELECTED_INDEX;
        this.previewSelectedPointIndex = this.NO_POINT_SELECTED_INDEX;

        this.getControlPointsCoords(selectionCoords.finalTopLeft, selectionCoords.finalBottomRight).forEach((point, index) => {
            if (Math.abs(mousePosition.x - point.x) < this.selectingPointOffSet && Math.abs(mousePosition.y - point.y) < this.selectingPointOffSet) {
                if (!preview) this.selectedPointIndex = index;
                this.previewSelectedPointIndex = index;
            }
        });
    }

    resizeSelection(pos: Vec2, coords: SelectionCoords): void {
        let distX: number;
        let distY: number;
        let endCoordX: number;
        let endCoordY: number;
        switch (this.selectedPointIndex) {
            case 0:
                coords.finalTopLeft.y = pos.y;
                coords.finalTopLeft.x = pos.x;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalBottomRight.x);
                    distY = Math.abs(pos.y - coords.finalBottomRight.y);
                    endCoordX = coords.finalBottomRight.x + Math.sign(pos.x - coords.finalBottomRight.x) * Math.min(distX, distY);
                    endCoordY = coords.finalBottomRight.y + Math.sign(pos.y - coords.finalBottomRight.y) * Math.min(distX, distY);
                    coords.finalTopLeft.y = endCoordY;
                    coords.finalTopLeft.x = endCoordX;
                }
                break;
            case 1:
                coords.finalTopLeft.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalBottomRight.x);
                    distY = Math.abs(pos.y - coords.finalTopLeft.y);
                    endCoordX = coords.finalBottomRight.x + Math.sign(pos.x - coords.finalBottomRight.x) * Math.min(distX, distY);
                    endCoordY = coords.finalTopLeft.y + Math.sign(pos.y - coords.finalTopLeft.y) * Math.min(distX, distY);
                    coords.finalTopLeft.x = endCoordX;
                    coords.finalBottomRight.y = endCoordY;
                }
                break;
            case 2:
                coords.finalTopLeft.y = pos.y;
                coords.finalBottomRight.x = pos.x;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalTopLeft.x);
                    distY = Math.abs(pos.y - coords.finalBottomRight.y);
                    endCoordX = coords.finalTopLeft.x + Math.sign(pos.x - coords.finalTopLeft.x) * Math.min(distX, distY);
                    endCoordY = coords.finalBottomRight.y + Math.sign(pos.y - coords.finalBottomRight.y) * Math.min(distX, distY);
                    coords.finalBottomRight.x = endCoordX;
                    coords.finalTopLeft.y = endCoordY;
                }
                break;
            case 3:
                coords.finalBottomRight.x = pos.x;
                coords.finalBottomRight.y = pos.y;
                if (this.shiftKeyIsDown) {
                    distX = Math.abs(pos.x - coords.finalTopLeft.x);
                    distY = Math.abs(pos.y - coords.finalTopLeft.y);
                    endCoordX = coords.finalTopLeft.x + Math.sign(pos.x - coords.finalTopLeft.x) * Math.min(distX, distY);
                    endCoordY = coords.finalTopLeft.y + Math.sign(pos.y - coords.finalTopLeft.y) * Math.min(distX, distY);
                    coords.finalBottomRight.y = endCoordY;
                    coords.finalBottomRight.x = endCoordX;
                }
                break;
            case 4:
                coords.finalTopLeft.y = pos.y;
                break;
            case 5:
                coords.finalBottomRight.y = pos.y;
                break;
            case 6:
                coords.finalTopLeft.x = pos.x;
                break;
            case 7:
                coords.finalBottomRight.x = pos.x;
                break;
        }
    }
}
