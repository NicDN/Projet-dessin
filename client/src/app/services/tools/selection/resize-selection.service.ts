import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

enum PointSelected {
    TOP_LEFT = 1,
    TOP_MIDDLE = 2,
    TOP_RIGHT = 3,
    MIDDLE_LEFT = 4,
    MIDDLE_RIGHT = 5,
    BOTTOM_LEFT = 6,
    BOTTOM_MIDDLE = 7,
    BOTTOM_RIGHT = 8,
    NONE = 9,
}

@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService {
    constructor(protected shapeService: ShapeService) {}
    private readonly selectingPointOffSet: number = 20;
    private selectedPoint: PointSelected;
    private selectingAreaWidth: number;
    private selectingAreaHeight: number;

    isAmovingSelectionPoint(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        this.selectingAreaWidth = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        this.selectingAreaHeight = selectionCoords.finalTopLeft.y - selectionCoords.finalBottomRight.y;
        this.checkIfAControlPointHasBeenSelected(mousePosition, selectionCoords);
        console.log(this.selectedPoint);
    }

    private checkIfAControlPointHasBeenSelected(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        this.isUpperLeft(mousePosition, selectionCoords);
        this.isUpperMiddle(mousePosition, selectionCoords);
        this.isUpperRight(mousePosition, selectionCoords);
        this.isMiddleLeft(mousePosition, selectionCoords);
        this.isMiddleRight(mousePosition, selectionCoords);
        this.isBottomLeft(mousePosition, selectionCoords);
        this.isBottomMiddle(mousePosition, selectionCoords);
        this.isBottomRight(mousePosition, selectionCoords);
    }

    private isUpperLeft(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingAreaHeight + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y + this.selectingAreaHeight - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.TOP_LEFT;
        }
    }

    private isUpperMiddle(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x + this.selectingAreaWidth / 2 - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingAreaWidth / 2 + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingAreaHeight + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y + this.selectingAreaHeight - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.TOP_MIDDLE;
        }
    }

    private isUpperRight(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalBottomRight.x - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalBottomRight.x + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingAreaHeight + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y + this.selectingAreaHeight - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.TOP_RIGHT;
        }
    }

    private isMiddleLeft(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingAreaHeight / 2 + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y + this.selectingAreaHeight / 2 - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.MIDDLE_LEFT;
        }
    }

    private isMiddleRight(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalBottomRight.x - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalBottomRight.x + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingAreaHeight / 2 + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y + this.selectingAreaHeight / 2 - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.MIDDLE_RIGHT;
        }
    }

    private isBottomLeft(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.BOTTOM_LEFT;
        }
    }

    private isBottomMiddle(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x + this.selectingAreaWidth / 2 - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingAreaWidth / 2 + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.BOTTOM_MIDDLE;
        }
    }

    private isBottomRight(mousePosition: Vec2, selectionCoords: SelectionCoords): void {
        if (
            mousePosition.x > selectionCoords.finalTopLeft.x + this.selectingAreaWidth - this.selectingPointOffSet &&
            mousePosition.x < selectionCoords.finalTopLeft.x + this.selectingAreaWidth + this.selectingPointOffSet &&
            mousePosition.y < selectionCoords.finalBottomRight.y + this.selectingPointOffSet &&
            mousePosition.y > selectionCoords.finalBottomRight.y - this.selectingPointOffSet
        ) {
            this.selectedPoint = PointSelected.BOTTOM_RIGHT;
        }
    }
}
