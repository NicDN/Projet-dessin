import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    constructor(public router: Router, public drawingService: DrawingService) { }
    controlKeyDown: boolean = false;

    onKeyDown(event: KeyboardEvent): void {
        this.handleCtrlKey(event);
        switch (event.code) {
            case 'KeyO':
                this.handleCtrlO();
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

    handleCtrlO(): void {
        if (this.controlKeyDown) {
            this.router.navigate(['/editor']);
            this.drawingService.handleNewDrawing();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.ctrlKey) this.controlKeyDown = false;
    }
}
