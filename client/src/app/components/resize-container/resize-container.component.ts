import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { DEFAULT_SIZE, HALF_RATIO, MINIMUM_WORKSPACE_SIZE, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subscription } from 'rxjs';
import { __assign } from 'tslib';

const enum Status {
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
export class ResizeContainerComponent implements AfterViewInit {
    @Input() width: number;
    @Input() height: number;

    @Output() notifyResize: EventEmitter<BoxSize> = new EventEmitter();
    @Output() usingButton: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('box') box: ElementRef;

    private boxPosition: { left: number; top: number };

    readonly MOUSE_OFFSET: number = 5;
    status: Status = Status.NOT_RESIZING;

    boxSize: BoxSize;
    subscription: Subscription;

    constructor(private drawingService: DrawingService) {
        this.subscription = this.drawingService.getMessage().subscribe((message) => {
            if (message) {
                this.newDrawingNotification();
            }
        });
    }

    ngAfterViewInit(): void {
        this.loadBox();
    }

    private loadBox(): void {
        const { left, top } = this.box.nativeElement.getBoundingClientRect();
        this.boxPosition = { left, top };
        console.log(this.boxPosition);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.resize(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.onMouseUpContainer(event);
    }

    onMouseDown(event: MouseEvent, status: number): void {
        this.setStatus(event, status);
    }

    setStatus(event: MouseEvent, status: number): void {
        // if (status === Status.RESIZE_DIAGONAL || Status.RESIZE_HORIZONTAL || Status.RESIZE_VERTICAL) event.stopPropagation();
        this.status = status;
        if (this.status !== Status.NOT_RESIZING) {
            this.usingButton.emit(true);
        }
    }

    onMouseUpContainer(event: MouseEvent): void {
        if (this.status !== Status.NOT_RESIZING) {
            this.boxSize = { widthBox: this.width, heightBox: this.height };
            this.notifyResize.emit(this.boxSize);
        }

        this.setStatus(event, Status.NOT_RESIZING);
    }

    resize(event: MouseEvent): void {
        if (this.updateWidthValid(event)) {
            this.width = event.clientX - this.boxPosition.left - this.MOUSE_OFFSET;
        }
        if (this.updateHeightValid(event)) {
            this.height = event.clientY - this.boxPosition.top - this.MOUSE_OFFSET;
        }
    }

    newDrawingNotification(): void {
        /* When creating a new drawing*/
        this.width =
            (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO > MINIMUM_WORKSPACE_SIZE
                ? (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO
                : DEFAULT_SIZE;
        this.height = window.innerHeight * HALF_RATIO < MINIMUM_WORKSPACE_SIZE ? window.innerHeight * HALF_RATIO : DEFAULT_SIZE;
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
        return event.clientX - this.boxPosition.left - this.MOUSE_OFFSET >= DEFAULT_SIZE;
    }

    YisOverMinimum(event: MouseEvent): boolean {
        return event.clientY - this.boxPosition.top - this.MOUSE_OFFSET >= DEFAULT_SIZE;
    }
}
