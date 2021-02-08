import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    controlKeyDown: boolean = false;

    constructor(private router: Router, public drawingService: DrawingService) {}

    onKeyDownMainPage(event: KeyboardEvent): void {
        event.stopPropagation();
        if (event.ctrlKey) {
            this.controlKeyDown = true;
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyO':
                if(this.controlKeyDown) this.router.navigate(['/editor']);
                break;
            default:
        }
        event.returnValue = true; // Reanables all normal web shortcuts
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            this.controlKeyDown = true;
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyO':
                if (this.controlKeyDown) this.drawingService.handleNewDrawing();
                break;
            default:
            /* Nothing happens if a random key is pressed */
            /* Maybe we want this to be in a service */
        }
        event.returnValue = true; // Renables shortcuts like f11
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.ctrlKey) this.controlKeyDown = false;
    }
}