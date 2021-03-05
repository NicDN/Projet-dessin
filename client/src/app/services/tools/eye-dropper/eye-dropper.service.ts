import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
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

    private subject: Subject<void> = new Subject<void>();

    sendNotifColor(): void {
        this.subject.next();
    }

    newIncomingColor(): Observable<void> {
        return this.subject.asObservable();
    }

    onMouseDown(event: MouseEvent): void {
        this.getImageData(this.getPositionFromMouse(event));
    }

    getImageData(mousePosition: Vec2): void {
        this.currentPixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1);
        this.currentGridOfPixelData = this.drawingService.baseCtx.getImageData(mousePosition.x - 10, mousePosition.y - 10, 20, 20);
        this.sendNotifColor();
    }

    buildPreviewImage(): void {
        // TBD
    }
}
