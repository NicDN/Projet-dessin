import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawing-form';

@Component({
    selector: 'app-card-drawing-template',
    templateUrl: './card-drawing-template.component.html',
    styleUrls: ['./card-drawing-template.component.scss'],
})
export class CardDrawingTemplateComponent {
    @Input() drawingForm: DrawingForm;
    @Output() closeCarousel: EventEmitter<void> = new EventEmitter<void>();
    @Output() requestDrawings: EventEmitter<void> = new EventEmitter<void>();

    deletingState: boolean = false; // boolean set to true while deleting the drawing

    constructor(
        private carouselService: CarouselService,
        private snackBar: MatSnackBar,
        public drawingService: DrawingService,
        private router: Router,
    ) {}

    setToCurrentDrawing(): void {
        const image = new Image();
        image.src = this.drawingForm.drawingData;

        if (this.router.url !== '/editor') {
            this.router.navigate(['editor']);
            this.drawingService.newImage = image;
            this.closeCarousel.emit();
        } else {
            if (this.drawingService.handleNewDrawing(image)) {
                this.closeCarousel.emit();
            }
        }
    }

    deleteDrawing(id: string): void {
        this.deletingState = true;
        this.carouselService.deleteDrawingFromServer(id).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                this.openSnackBar(error, 'Fermer');
                this.deletingState = false;
                this.requestDrawings.emit();
            },
            () => {
                this.openSnackBar('Le dessin a été supprimé avec succès.', 'Fermer');
                this.deletingState = false;
                this.requestDrawings.emit();
            },
        );
    }

    openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }

    isTheLoadedCanvas(): boolean {
        if (this.router.url === '/home') {
            return false;
        }
        return this.drawingService.canvas === undefined ? false : this.drawingForm.drawingData === this.drawingService.canvas.toDataURL();
    }
}
