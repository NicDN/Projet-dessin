import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    controlKeyDown: boolean = false;

    constructor(private router: Router, public drawingService: DrawingService) {}

    onKeyDown(event: KeyboardEvent): void {
        this.handleCtrlKey(event);
        switch (event.code) {
            case 'KeyO':
                if (this.controlKeyDown) {
                    this.router.navigate(['/editor']);
                    this.drawingService.handleNewDrawing();
                }
                break;
            default:
            
        }
        event.returnValue = true;
    }

    handleCtrlKey(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            this.controlKeyDown = true;
            event.preventDefault();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.ctrlKey) this.controlKeyDown = false;
    }
}
