import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

// Ceci est une implémentation de base de l'outil Crayon pour aider à débuter le projet
// L'implémentation ici ne couvre pas tous les critères d'accepetation du projet
// Vous êtes encouragés de modifier et compléter le code.
// N'oubliez pas de regarder les tests dans le fichier spec.ts aussi!

const DEFAULTTHICKNESS = 1;

@Injectable({
    providedIn: 'root',
})
export class PencilService extends TraceTool {
    thickness: number;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Crayon');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.thickness = DEFAULTTHICKNESS;
        this.minThickness = 1;
    }

    private pathData: Vec2[];

    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    everyMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
    }

    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineJoin = ctx.lineCap = 'round'; 
        ctx.lineWidth = this.thickness;
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        ctx.strokeStyle = this.colorService.mainColor.rgbValue;
        ctx.beginPath();

        for (const point of path) {
            ctx.moveTo(oldPointX, oldPointY);
            ctx.strokeStyle = this.colorService.mainColor.rgbValue;
            ctx.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseOut(event: MouseEvent): void {
        this.onMouseUp(event);
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
        }
    }
}
