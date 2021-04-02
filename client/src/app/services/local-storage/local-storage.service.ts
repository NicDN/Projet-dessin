import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private drawingService: DrawingService, private snackBarService: SnackBarService) {}

    saveCanvas(): void {
        const canvasURLCopy = (' ' + this.drawingService.canvas.toDataURL()).slice(1); // deep copy of canvas url

        try {
            localStorage.setItem('canvas', canvasURLCopy);
        } catch (error) {
            this.snackBarService.openSnackBar('Erreur lors de la sauvegarde automatique.', 'Fermer');
        }
    }

    storageIsEmpty(): boolean {
        return localStorage.getItem('canvas') === null;
    }
}
