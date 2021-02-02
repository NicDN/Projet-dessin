import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';

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
export class ResizeContainerComponent implements AfterViewInit {
    @Input() width: number;
    @Input() height: number;
    @Input() left: number;
    @Input() top: number;

    @Output() notifyResize: EventEmitter<BoxSize> = new EventEmitter();
    @Output() usingButton: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('box') box: ElementRef;

    private boxPosition: { left: number; top: number };
    private containerPos: { left: number; top: number; right: number; bottom: number };

    private DEFAULT_HEIGHT: number = 250;
    private DEFAULT_WIDTH: number = 250;

    private MOUSE_OFFSET: number = 15;

    mouse: { x: number; y: number };
    status: Status = Status.OFF;

    boxSize: BoxSize;

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
        if (this.status !== Status.OFF) {
            this.usingButton.emit(true);
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.mouse = { x: event.clientX, y: event.clientY };
        this.resize();
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.onMouseUpContainer(event);
    }

    onMouseUpContainer(event: MouseEvent): void {
        if (this.width < this.DEFAULT_WIDTH) this.width = this.DEFAULT_WIDTH;
        if (this.height < this.DEFAULT_HEIGHT) this.height = this.DEFAULT_HEIGHT;

        if (this.status !== Status.OFF) {
            this.boxSize = { widthBox: this.width, heightBox: this.height };
            this.notifyResize.emit(this.boxSize);
        }

        this.setStatus(event, Status.OFF);
    }

    resize(): void {
        if (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_HORIZONTAL) {
            this.width = Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left - this.MOUSE_OFFSET : 0;
        }
        if (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) {
            this.height = Number(this.mouse.y > this.boxPosition.top) ? this.mouse.y - this.boxPosition.top - this.MOUSE_OFFSET : 0;
        }
    }

    resizeCondMeet(): boolean {
        return this.mouse.x < this.containerPos.right && this.mouse.y < this.containerPos.bottom;
    }
}
