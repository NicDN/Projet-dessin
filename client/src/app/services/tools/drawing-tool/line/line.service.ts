import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    readonly INITIAL_JUNCTION_DIAMETER_PX=5;
    junctionDiameter:number=this.INITIAL_JUNCTION_DIAMETER_PX; 
    drawWithJunction:boolean=false; // initial state

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService,"Ligne");
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }
}
