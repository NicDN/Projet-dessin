import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    constructor(public router: Router, public drawingService: DrawingService) { }
    
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyO':
                this.handleCtrlO(event);
                break;
        }
        event.returnValue = true;
    }

    handleCtrlO(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            this.router.navigate(['/editor']);
            this.drawingService.handleNewDrawing();
        }
    }
}
