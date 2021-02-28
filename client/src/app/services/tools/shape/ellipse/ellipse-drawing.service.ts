import { Injectable } from '@angular/core';
import { EllipseCommand } from '@app/classes/commands/ellipse-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Ellipse');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: EllipseCommand = new EllipseCommand(
            ctx,
            begin,
            end,
            this.thickness,
            this.colorService.mainColor.rgbValue,
            this.colorService.secondaryColor.rgbValue,
            this.colorService.mainColor.opacity,
            this,
        );
        ellipseCommand.execute();
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: EllipseCommand = new EllipseCommand(
            ctx,
            begin,
            end,
            this.thickness,
            this.colorService.mainColor.rgbValue,
            this.colorService.secondaryColor.rgbValue,
            this.colorService.mainColor.opacity,
            this,
        );
        ellipseCommand.execute();
        this.undoRedoService.addCommand(ellipseCommand);
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
    }

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2;
    }

    adjustToBorder(ctx: CanvasRenderingContext2D, radiuses: Vec2, begin: Vec2, end: Vec2): void {
        const thicknessAdjustment: number = this.traceType !== TraceType.FilledNoBordered ? ctx.lineWidth / 2 : 0;
        radiuses.x -= thicknessAdjustment;
        radiuses.y -= thicknessAdjustment;
        if (radiuses.x <= 0) {
            ctx.lineWidth = begin.x !== end.x ? Math.abs(begin.x - end.x) : 1;
            radiuses.x = 1;
            radiuses.y = this.getRadius(begin.y, end.y) - ctx.lineWidth / 2;
        }
        if (radiuses.y <= 0) {
            ctx.lineWidth = begin.y !== end.y ? Math.abs(begin.y - end.y) : 1;
            radiuses.y = 1;
            radiuses.x = begin.x !== end.x ? this.getRadius(begin.x, end.x) - ctx.lineWidth / 2 : 1;
        }
    }
}
