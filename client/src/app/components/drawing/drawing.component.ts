import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { Subscription } from 'rxjs';

// TODO : Avoir un fichier séparé pour les constantes ?
export const DEFAULT_SIZE = 250;
export const MINIMUM_WORKSPACE_SIZE = 500;
export const SIDE_BAR_SIZE = 400;
export const HALF_RATIO = 0.5;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;

    private canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO, y: window.innerHeight * HALF_RATIO };
    private canDraw: boolean = true;

    subscription: Subscription;

    isEraser: boolean;

    constructor(private drawingService: DrawingService, private toolsService: ToolsService) {
        this.subscription = this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => {
            this.isEraser = currentTool instanceof EraserService;
        });
    }
    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.canDraw) {
            this.toolsService.currentTool.onMouseMove(event);
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (this.canDraw) {
            this.toolsService.currentTool.onMouseDown(event);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseUp(event);
        this.canDraw = true;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.toolsService.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolsService.onKeyUp(event);
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseOut(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if (this.canDraw) this.toolsService.currentTool.onMouseEnter(event);
    }

    disableDrawing(isUsingButton: boolean): void {
        this.canDraw = !isUsingButton;
    }

    onSizeChange(boxsize: BoxSize): void {
        this.drawingService.onSizeChange(boxsize);
    }

    get width(): number {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.x : DEFAULT_SIZE;
    }

    get height(): number {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE ? this.canvasSize.y : DEFAULT_SIZE;
    }
}
