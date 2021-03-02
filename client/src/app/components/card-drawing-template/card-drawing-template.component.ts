import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';

@Component({
    selector: 'app-card-drawing-template',
    templateUrl: './card-drawing-template.component.html',
    styleUrls: ['./card-drawing-template.component.scss'],
})
export class CardDrawingTemplateComponent {
    @Input() drawingForm: DrawingForm;
    drawingSrc: string;

    constructor(private carouselService: CarouselService, private snackBar: MatSnackBar) {
        // this.convertBlobToSrc();
    }

    setToCurrentDrawing(): void {
        // if (!this.drawingForm.drawing) {
        //     this.openSnackBar("Impossible d'ouvrir le dessin, veuillez en choisir un autre.", 'Fermer');
        //     return;
        // }
        // Need antoine for opening the drawing
    }

    deleteDrawing(id: number): void {
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

    // TODO: should work when a blob will be passed to formData
    // convertBlobToSrc(): void {
    //     const formData: FormData = this.drawingForm.drawing;
    //     this.drawingSrc = URL.createObjectURL(formData.get('drawing')); // formData.get returns a blob
    // }

    openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, {
            duration: 5000,
        });
    }
}
