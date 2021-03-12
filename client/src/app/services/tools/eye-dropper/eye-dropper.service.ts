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
        // this.currentGridOfPixelData = this.drawingService.baseCtx.getImageData(
        //     this.getPositionFromMouse(event).x - 10,
        //     this.getPositionFromMouse(event).y - 10,
        //     20,
        //     20,
        // );
        const sizePreview = 10;
        this.currentGridOfPixelData = this.drawingService.baseCtx.getImageData(
            this.getPositionFromMouse(event).x - sizePreview / 2,
            this.getPositionFromMouse(event).y - sizePreview / 2,
            sizePreview,
            sizePreview,
        );
    }

    getImageData(mousePosition: Vec2): void {
        this.currentPixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1);
        this.sendNotifColor();
    }
}
