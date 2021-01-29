import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './../drawing/drawing.component';
import { BoxSize } from '@app/classes/BoxSize';

const enum Status {
    OFF = 0,
    RESIZE_DIAGONAL = 1,
    RESIZE_HORIZONTAL = 2,
    RESIZE_VERTICAL = 3,
}

@Component({
    selector: 'app-resize-container',
    templateUrl: './resize-container.component.html',
    styleUrls: ['./resize-container.component.scss'],
})
export class ResizeContainerComponent implements OnInit, AfterViewInit {
    @Input() width: number;
    @Input() height: number;
    @Input() left: number;
    @Input() top: number;

    @Output() notifyResize = new EventEmitter();

    @ViewChild('box') box: ElementRef;
    private boxPosition: { left: number; top: number };
    private containerPos: { left: number; top: number; right: number; bottom: number };

    mouse: { x: number; y: number };
    status: Status = Status.OFF;
    // private mouseClick: { x: number; y: number; left: number; top: number };

    boxSize: BoxSize;

    constructor() {
        // Avoid linting error
    }

    ngOnInit(): void {
        // Avoid linting error
    }
    ngAfterViewInit(): void {
        this.loadBox();
        this.loadContainer();
    }

    private loadBox(): void {
        const { left, top } = this.box.nativeElement.getBoundingClientRect();
        this.boxPosition = { left, top };
    }

    private loadContainer(): void {
        const left = this.boxPosition.left - this.left;
        const top = this.boxPosition.top - this.top;
        const right = left + window.innerWidth;
        const bottom = top + window.innerHeight;
        this.containerPos = { left, top, right, bottom };
    }

    setStatus(event: MouseEvent, status: number): void {
        if (status === Status.RESIZE_DIAGONAL || Status.RESIZE_HORIZONTAL || Status.RESIZE_VERTICAL) event.stopPropagation();
        else this.loadBox();
        this.status = status;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.mouse = { x: event.clientX, y: event.clientY };
        this.resize();
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.onMouseUpContainer(event);
        // Ici que l'on sauvegarde le canvas et qu'on resize
    }

    onMouseUpContainer(event: MouseEvent): void {
        if (this.width < DEFAULT_WIDTH) this.width = DEFAULT_WIDTH;
        if (this.height < DEFAULT_HEIGHT) this.height = DEFAULT_HEIGHT;
        if (this.height < DEFAULT_HEIGHT) this.height = DEFAULT_HEIGHT;

        if (this.status !== Status.OFF) {
            this.boxSize = { widthBox: this.width, heightBox: this.height };
            this.notifyResize.emit(this.boxSize);
        }

        this.setStatus(event, Status.OFF);
    }

    resize(): void {
        if (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_HORIZONTAL) {
            this.width = Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left : 0;
        }
        if (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) {
            this.height = Number(this.mouse.y > this.boxPosition.top) ? this.mouse.y - this.boxPosition.top : 0;
        }
    }

    resizeCondMeet(): boolean {
        return this.mouse.x < this.containerPos.right && this.mouse.y < this.containerPos.bottom;
    }
}
