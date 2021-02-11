import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Vec2 } from '@app/classes/vec2';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    router: Router;

    readonly MINIMUM_WORKSPACE_SIZE: number = 500;
    readonly SIDE_BAR_SIZE: number = 400;
    readonly HALF_RATIO: number = 0.5;

    private subject: Subject<any> = new Subject<any>();

    canvasSize: Vec2;

    constructor() {
        this.canvasSize = { x: (window.innerWidth - this.SIDE_BAR_SIZE) * this.HALF_RATIO, y: window.innerHeight * this.HALF_RATIO };
    }

    sendNotifReload(message: string): void {
        this.subject.next({ text: message });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleNewDrawing(): void {
        if (!this.checkIfCanvasEmpty()) {
            const response = confirm('Si vous créez un nouveau dessin, vos changements seront perdus. Voulez-vous continuer ?');
            if (response === true) {
                this.reloadDrawing();
            }
        } else {
            this.reloadDrawing();
        }
    }

    reloadDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.resizeCanvas();
    }

    resizeCanvas(): void {
        this.sendNotifReload('Plz reload');
    }

    checkIfCanvasEmpty(): boolean {
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }
}
