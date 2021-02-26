import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, HALF_RATIO, MINIMUM_WORKSPACE_SIZE, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
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
export class ResizeContainerComponent implements AfterViewInit {
    @Input() width: number;
    @Input() height: number;

    @Output() usingButton: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('box') box: ElementRef;

    readonly MOUSE_OFFSET: number = 5;

    status: Status = Status.NOT_RESIZING;
    oldBoxSize: BoxSize;
    currentBoxSize: BoxSize;
    boxSize: BoxSize;
    subscription: Subscription;
    undoRedoSubscription: Subscription;

    constructor(private drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        this.listenToNewDrawingNotifications();
        this.listenToNewUndoRedoNotifications();
    }

    ngAfterViewInit(): void {
        this.oldBoxSize = { widthBox: this.width, heightBox: this.height };
        console.log(this.oldBoxSize);
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
            // this.addActionToUndoList(this.oldBoxSize);
            this.resizeCanvas(this.currentBoxSize.widthBox, this.currentBoxSize.heightBox, true);
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
        this.currentBoxSize = { widthBox: this.width, heightBox: this.height };
    }


    // ==================================================
    addActionToUndoList(boxSize: BoxSize): void {
        const resizeAction = { id: 'resize', oldBoxSize: boxSize };
        this.undoRedoService.addActionResize(resizeAction);
    }

    listenToNewUndoRedoNotifications(): void {
        this.undoRedoSubscription = this.undoRedoService.newIncomingUndoRedoResizeSignals().subscribe((boxSize) => {
            this.undoRedoResizeNotification(boxSize);
        });
    }

    undoRedoResizeNotification(boxSize: BoxSize): void {
        const width = boxSize.widthBox;
        const height = boxSize.heightBox;
        this.resizeCanvas(width, height, false);
    }
    resizeCanvas(newWidth: number, newHeight: number, updateUndoRedo: boolean): void {
        if (updateUndoRedo) {
            this.addActionToUndoList(this.oldBoxSize);
        }

        this.oldBoxSize = { widthBox: newWidth, heightBox: newHeight };
        this.width = newWidth;
        this.height = newHeight;
        this.boxSize = { widthBox: newWidth, heightBox: newHeight };
        this.drawingService.onSizeChange(this.boxSize);
        // this.notifyResize.emit(this.boxSize);
    }
    // ===================================================

    listenToNewDrawingNotifications(): void {
        this.subscription = this.drawingService.newIncomingResizeSignals().subscribe(() => {
            this.newDrawingNotification();
        });
    }

    newDrawingNotification(): void {
        const width = this.workspaceWidthIsOverMinimum() ? (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO : DEFAULT_WIDTH;
        const height = this.workspaceHeightIsOverMinimum() ? window.innerHeight * HALF_RATIO : DEFAULT_HEIGHT;
        this.resizeCanvas(width, height, false);
    }

    updateWidthValid(event: MouseEvent): boolean {
        return (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_HORIZONTAL) && this.xCoordinateisOverMinimum(event);
    }

    updateHeightValid(event: MouseEvent): boolean {
        return (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) && this.yCoordinateIsOverMinimum(event);
    }

    xCoordinateisOverMinimum(event: MouseEvent): boolean {
        return event.pageX - SIDE_BAR_SIZE - this.MOUSE_OFFSET >= DEFAULT_WIDTH;
    }

    yCoordinateIsOverMinimum(event: MouseEvent): boolean {
        return event.pageY - this.MOUSE_OFFSET >= DEFAULT_HEIGHT;
    }

    workspaceWidthIsOverMinimum(): boolean {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE;
    }

    workspaceHeightIsOverMinimum(): boolean {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE;
    }
}
