import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';

// TODO : Avoir un fichier séparé pour les constantes ?
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

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
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    // TODO : Avoir un service dédié pour gérer tous les outils ? Ceci peut devenir lourd avec le temps
    // private tools: Tool[];
    // currentTool: Tool;
    constructor(private drawingService: DrawingService, private toolsService: ToolsService) {
        // this.tools = [pencilService];
        // this.currentTool = this.tools[0];
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        // this.currentTool.onMouseMove(event);
        this.toolsService.currentTool.onMouseMove(event);
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        // this.currentTool.onMouseDown(event);
        this.toolsService.currentTool.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        // this.currentTool.onMouseUp(event);
        this.toolsService.currentTool.onMouseUp(event);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.toolsService.onKeyDown(event);
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.toolsService.currentTool.onMouseOut(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.toolsService.currentTool.onMouseEnter(event);
    }

    onSizeChange(boxsize: BoxSize): void {
        console.log(boxsize.widthBox);

        this.previewCanvas.nativeElement.width = boxsize.widthBox;
        this.previewCanvas.nativeElement.height = boxsize.heightBox;
        this.previewCtx.drawImage(this.baseCanvas.nativeElement, 0, 0);

        this.baseCanvas.nativeElement.width = boxsize.widthBox;
        this.baseCanvas.nativeElement.height = boxsize.heightBox;

        this.baseCtx.drawImage(this.previewCanvas.nativeElement, 0, 0);

        this.previewCanvas.nativeElement.width = boxsize.widthBox;
        this.previewCanvas.nativeElement.height = boxsize.heightBox;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
