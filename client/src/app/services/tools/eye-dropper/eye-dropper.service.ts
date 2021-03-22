import { Injectable } from '@angular/core';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EyeDropperService extends Tool {
    private subject: Subject<void> = new Subject<void>();

    currentPixelData: ImageData = new ImageData(1, 1);
    currentGridOfPixelData: ImageData = new ImageData(1, 1);

    isLeftClick: boolean = false;
    previewIsDisplayed: boolean = false;
    gridDrawn: boolean = false;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Pipette');
    }

    sendNotifColor(): void {
        this.subject.next();
    }

    newIncomingColor(): Observable<void> {
        return this.subject.asObservable();
    }

    onMouseDown(event: MouseEvent): void {
        this.isLeftClick = event.button === MouseButton.Left;
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

    onMouseEnter(): void {
        this.previewIsDisplayed = true;
    }

    onMouseOut(): void {
        this.previewIsDisplayed = false;
    }

    private getImageData(mousePosition: Vec2): void {
        this.currentPixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1);
        this.sendNotifColor();
    }
}
