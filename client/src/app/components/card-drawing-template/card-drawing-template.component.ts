import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { DrawingService } from '@app/services/drawing/drawing.service';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';

@Component({
    selector: 'app-card-drawing-template',
    templateUrl: './card-drawing-template.component.html',
    styleUrls: ['./card-drawing-template.component.scss'],
})
export class CardDrawingTemplateComponent {
    @Input() drawingForm: DrawingForm;
    @Output() closeCarousel: EventEmitter<void> = new EventEmitter<void>();

    constructor(private carouselService: CarouselService, private snackBar: MatSnackBar, private drawingService:DrawingService) {}

    setToCurrentDrawing(): void {
        const image = new Image();
        image.src = this.drawingForm.drawingData;
        // this.drawingService.checkNewDrawing(image);

        // if (!this.drawingForm.drawing) {
        //     this.openSnackBar("Impossible d'ouvrir le dessin, veuillez en choisir un autre.", 'Fermer');
        //     return;
        // }

        this.closeCarousel.emit();
    }

    deleteDrawing(id: string): void {
        let feedBackMessage = '';
        this.carouselService.deleteDrawingFromServer(id).subscribe(
            () => {
                // callback is invoked if error
                feedBackMessage = 'Impossible de supprimer le dessin.';
            },
            () => {
                // callback is invoked if success
                feedBackMessage = 'Le dessin a été supprimé avec succès.';
            },
        );
        this.openSnackBar(feedBackMessage, 'Fermer');
    }

    openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, {
            duration: 5000,
        });
    }
}
