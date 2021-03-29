import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private drawingService: DrawingService) {}

    saveCanvas(): void {
        const string_cpy = (' ' + this.drawingService.canvas.toDataURL()).slice(1);
        localStorage.setItem('canvas', string_cpy);
    }

    storageIsEmpty(): boolean {
        console.log(localStorage.getItem('canvas'));
        return localStorage.getItem('canvas') === null;
    }
}
