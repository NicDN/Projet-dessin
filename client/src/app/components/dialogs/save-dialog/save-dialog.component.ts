import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { SaveService } from '@app/services/option/save/save.service';

@Component({
    selector: 'app-save-dialog',
    templateUrl: './save-dialog.component.html',
    styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

    private canvasCtx: CanvasRenderingContext2D;

    constructor(
        public drawingService: DrawingService,
        private saveService: SaveService,
        public filterService: FilterService,
        public dialogRef: MatDialogRef<SaveDialogComponent>,
    ) {}

    ngAfterViewInit(): void {
        this.canvasCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.saveService.canvasToPost = this.canvas.nativeElement;
    }

    postCanvas(fileName: string, fileFormat: string): void {
        this.saveService.postCanvas(fileName, fileFormat);
        this.dialogRef.close();
    }
}
