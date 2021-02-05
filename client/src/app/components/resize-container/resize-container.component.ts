import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subscription } from 'rxjs';

const enum Status {
    OFF = 0,
    RESIZE_DIAGONAL = 1,
    RESIZE_HORIZONTAL = 2,
    RESIZE_VERTICAL = 3,
}

const MINIMUM_WORKSPACE_SIZE = 500;
const SIDE_BAR_SIZE = 400;
const HALF_RATIO = 0.5;
const DEFAULT_SIZE = 250;

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

    private DEFAULT_HEIGHT: number = 250;
    private DEFAULT_WIDTH: number = 250;

    private MOUSE_OFFSET: number = 15;

    mouse: { x: number; y: number };
    status: Status = Status.OFF;

    boxSize: BoxSize;
    subscription: Subscription;

    constructor(private drawingService: DrawingService) {
        this.subscription = this.drawingService.getMessage().subscribe((message) => {
            if (message) {
                this.newDrawingNotification();
                console.log("Passe par icitte, tout de suite");
            }
        });
    }

    ngAfterViewInit(): void {
        this.loadBox();
    }

    private loadBox(): void {
        const { left, top } = this.box.nativeElement.getBoundingClientRect();
        this.boxPosition = { left, top };
    }

    setStatus(event: MouseEvent, status: number): void {
        if (status === Status.RESIZE_DIAGONAL || Status.RESIZE_HORIZONTAL || Status.RESIZE_VERTICAL) event.stopPropagation();
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
            this.width = this.mouse.x - this.boxPosition.left - this.MOUSE_OFFSET;
        }
        if (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) {
            this.height = this.mouse.y - this.boxPosition.top - this.MOUSE_OFFSET;
        }
    }

    newDrawingNotification(): void {
        /* Recoit un message */
        console.log(window.innerWidth, window.innerHeight);
        this.width =
            (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO > MINIMUM_WORKSPACE_SIZE
                ? (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO
                : DEFAULT_SIZE;
        this.height = window.innerHeight * HALF_RATIO < MINIMUM_WORKSPACE_SIZE ? window.innerHeight * HALF_RATIO : DEFAULT_SIZE;
        this.boxSize = { widthBox: this.width, heightBox: this.height };
        this.notifyResize.emit(this.boxSize);
    }
}
