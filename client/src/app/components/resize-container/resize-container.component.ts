import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { ResizeCommand } from '@app/classes/commands/resize-command/resize-command';
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
export class ResizeContainerComponent {
    @Output() usingButton: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('box') box: ElementRef;

    readonly MOUSE_OFFSET: number = 5;

    status: Status = Status.NOT_RESIZING;
    subscription: Subscription;

    constructor(private drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        this.listenToResizeNotifications();
    }

    setStatus(status: number): void {
        this.status = status;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.status !== Status.NOT_RESIZING) this.resizeContainer(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.onMouseUpContainer();
        this.usingButton.emit(false);
    }

    onMouseDown(event: MouseEvent, status: number): void {
        this.setStatus(status);
        this.usingButton.emit(true);
    }

    onMouseUpContainer(): void {
        if (this.box === undefined) return;
        if (this.status !== Status.NOT_RESIZING) {
            const resizeCommand: ResizeCommand = new ResizeCommand(
                { widthBox: this.box.nativeElement.style.width.slice(0, -2), heightBox: this.box.nativeElement.style.height.slice(0, -2) },
                this.drawingService,
            );
            this.undoRedoService.addCommand(resizeCommand);
            resizeCommand.execute();
        }
        this.setStatus(Status.NOT_RESIZING);
    }

    resizeContainer(event: MouseEvent): void {
        if (this.box === undefined) return;
        if (this.isValidWidth(event)) {
            this.box.nativeElement.style.width = `${event.pageX - SIDE_BAR_SIZE - this.MOUSE_OFFSET}px`;
        }
        if (this.isValidHeight(event)) {
            this.box.nativeElement.style.height = `${event.pageY - this.MOUSE_OFFSET}px`;
        }
    }

    resizeCanvas(newWidth: number, newHeight: number): void {
        if (this.box === undefined) return;
        this.box.nativeElement.style.width = `${newWidth}px`;
        this.box.nativeElement.style.height = `${newHeight}px`;

        const resizeBoxSize = { widthBox: newWidth, heightBox: newHeight };
        this.drawingService.onSizeChange(resizeBoxSize);
    }

    listenToResizeNotifications(): void {
        this.subscription = this.drawingService.newIncomingResizeSignals().subscribe((boxSize) => {
            this.resizeNotification(boxSize);
        });
    }

    resizeNotification(boxSize: BoxSize): void {
        let width: number;
        let height: number;
        if (boxSize.widthBox < 0 || boxSize.heightBox < 0) {
            width = this.workspaceWidthIsOverMinimum() ? (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO : DEFAULT_WIDTH;
            height = this.workspaceHeightIsOverMinimum() ? window.innerHeight * HALF_RATIO : DEFAULT_HEIGHT;
        } else {
            width = boxSize.widthBox;
            height = boxSize.heightBox;
        }
        this.resizeCanvas(width, height);
    }

    isValidWidth(event: MouseEvent): boolean {
        return (
            (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_HORIZONTAL) &&
            this.xCoordinateIsOverMinimum(event) &&
            this.xCoordinateIsUnderMaximum(event)
        );
    }

    isValidHeight(event: MouseEvent): boolean {
        return (
            (this.status === Status.RESIZE_DIAGONAL || this.status === Status.RESIZE_VERTICAL) &&
            this.yCoordinateIsOverMinimum(event) &&
            this.yCoordinateIsUnderMaximum(event)
        );
    }

    xCoordinateIsOverMinimum(event: MouseEvent): boolean {
        return event.pageX - SIDE_BAR_SIZE - this.MOUSE_OFFSET >= DEFAULT_WIDTH;
    }

    yCoordinateIsOverMinimum(event: MouseEvent): boolean {
        return event.pageY - this.MOUSE_OFFSET >= DEFAULT_HEIGHT;
    }

    xCoordinateIsUnderMaximum(event: MouseEvent): boolean {
        const offSetFactor = 2.5;
        return event.pageX + offSetFactor * this.MOUSE_OFFSET < window.innerWidth;
    }

    yCoordinateIsUnderMaximum(event: MouseEvent): boolean {
        const offSetFactor = 2.5;
        return event.pageY + offSetFactor * this.MOUSE_OFFSET < window.innerHeight;
    }

    workspaceWidthIsOverMinimum(): boolean {
        return window.innerWidth - SIDE_BAR_SIZE > MINIMUM_WORKSPACE_SIZE;
    }

    workspaceHeightIsOverMinimum(): boolean {
        return window.innerHeight > MINIMUM_WORKSPACE_SIZE;
    }
}
