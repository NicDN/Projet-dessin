import { Injectable } from '@angular/core';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EyeDropperService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService, 'Pipette');
    }
    currentPixelData: ImageData;
    currentGridOfPixelData: ImageData;
    leftClick: boolean = false;
    preview: boolean = false;
    gridDrawn: boolean = false;

    private subject: Subject<void> = new Subject<void>();

    sendNotifColor(): void {
        this.subject.next();
    }

    newIncomingColor(): Observable<void> {
        return this.subject.asObservable();
    }

    onMouseDown(event: MouseEvent): void {
        this.leftClick = event.button === MouseButton.Left;
        this.getImageData(this.getPositionFromMouse(event));
    }

    onMouseMove(event: MouseEvent): void {
        const sizePreview = 11;
        this.currentGridOfPixelData = this.drawingService.baseCtx.getImageData(
            this.getPositionFromMouse(event).x - Math.floor(sizePreview / 2),
            this.getPositionFromMouse(event).y - Math.floor(sizePreview / 2),
            sizePreview,
            sizePreview,
        );
    }

    onMouseEnter(event: MouseEvent): void {
        this.preview = true;
    }

    onMouseOut(event: MouseEvent): void {
        this.preview = false;
        this.gridDrawn = false;
    }

    getImageData(mousePosition: Vec2): void {
        this.currentPixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1);
        this.sendNotifColor();
    }
}
