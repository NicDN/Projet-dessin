import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasCommunicationService {
    canvasIsEmpty: boolean = true;

    constructor() {
        //
    }

    checkIfCanvasIsEmpty(): boolean {
        return this.canvasIsEmpty;
    }

    canvasModified(): void {
        this.canvasIsEmpty = false;
    }
}
