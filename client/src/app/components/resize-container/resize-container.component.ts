import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, HALF_RATIO, MINIMUM_WORKSPACE_SIZE, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subscription } from 'rxjs';

export const enum Status {
    NOT_RESIZING = 0,
    RESIZE_DIAGONAL = 1,
    RESIZE_HORIZONTAL = 2,
    RESIZE_VERTICAL = 3,
}

@Component({
    selector: 'app-resize-container',
    templateUrl: './resize-container.component.html',
    styleUrls: ['./resize-container.component.scss'],
})
export class ResizeContainerComponent {
    @Input() width: number;
    @Input() height: number;

    @Output() notifyResize: EventEmitter<BoxSize> = new EventEmitter();
    @Output() usingButton: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('box') box: ElementRef;

    readonly MOUSE_OFFSET: number = 5;
    status: Status = Status.NOT_RESIZING;
    boxSize: BoxSize;
    subscription: Subscription;

    constructor(private drawingService: DrawingService) {
        this.listenToNewDrawingNotifications();
    }

    setStatus(status: number): void {
        this.status = status;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.status !== Status.NOT_RESIZING) this.resize(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.onMouseUpContainer(event);
        this.usingButton.emit(false);
    }

    onMouseDown(event: MouseEvent, status: number): void {
        this.setStatus(status);
        this.usingButton.emit(true);
    }

    onMouseUpContainer(event: MouseEvent): void {
        if (this.status !== Status.NOT_RESIZING) {
            this.boxSize = { widthBox: this.width, heightBox: this.height };
            this.notifyResize.emit(this.boxSize);
        }
        this.setStatus(Status.NOT_RESIZING);
    }

    resize(event: MouseEvent): void {
        if (this.updateWidthValid(event)) {
            this.width = event.pageX - SIDE_BAR_SIZE - this.MOUSE_OFFSET;
        }
        if (this.updateHeightValid(event)) {
            this.height = event.pageY - this.MOUSE_OFFSET;
        }
    }

    listenToNewDrawingNotifications(): void {
        this.subscription = this.drawingService.newIncomingResizeSignals().subscribe((message) => {
            this.newDrawingNotification();
        });
    }

    newDrawingNotification(): void {
        /* When creating a new drawing*/
        this.width = this.WindowWidthIsOverMinimum() ? (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO : DEFAULT_WIDTH;
        this.height = this.WindowHeightIsOverMinimum() ? window.innerHeight * HALF_RATIO : DEFAULT_HEIGHT;
        this.boxSize = { widthBox: this.width, heightBox: this.height };
        this.notifyResize.emit(this.boxSize);
    }

    updateWidthValid(event: MouseEvent): boolean {
        return (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_HORIZONTAL) && this.XisOverMinimum(event);
    }

    updateHeightValid(event: MouseEvent): boolean {
        return (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) && this.YisOverMinimum(event);
    }

    XisOverMinimum(event: MouseEvent): boolean {
        return event.pageX - SIDE_BAR_SIZE - this.MOUSE_OFFSET >= DEFAULT_WIDTH;
    }

    YisOverMinimum(event: MouseEvent): boolean {
        return event.pageY - this.MOUSE_OFFSET >= DEFAULT_HEIGHT;
    }

    WindowWidthIsOverMinimum(): boolean {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE;
    }

    WindowHeightIsOverMinimum(): boolean {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE;
    }
}
