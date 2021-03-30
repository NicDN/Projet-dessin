import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private drawingService: DrawingService) {}

    saveCanvas(): void {
        console.log('saved');

        // ******* test purposes
        const image = new Image();
        console.log('Canvas sizes: width: ' + this.drawingService.canvas.width + ' height: ' + this.drawingService.canvas.height);
        image.src = (' ' + this.drawingService.canvas.toDataURL()).slice(1);
        console.log('Image sizes: width: ' + image.width + ' height: ' + image.height);
        // *******

        const canvasURLCopy = (' ' + this.drawingService.canvas.toDataURL()).slice(1); // deep copy of canvas url
        localStorage.setItem('canvas', canvasURLCopy);
    }

    storageIsEmpty(): boolean {
        return localStorage.getItem('canvas') === null;
    }
}
