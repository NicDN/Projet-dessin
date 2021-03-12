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

    constructor(
        private carouselService: CarouselService,
        private snackBar: MatSnackBar,
        public drawingService: DrawingService,
        private router: Router,
    ) {
        // this.routeEvent(this.router);
    }

    // routeEvent(router: Router): void {
    //     router.events.subscribe((e) => {
    //         if (e instanceof NavigationEnd) {
    //             const image = new Image();
    //             image.src = this.drawingForm.drawingData;
    //             if (this.drawingService.handleNewDrawing(image)) {
    //                 this.closeCarousel.emit();
    //             }
    //         }
    //     });
    // }

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
        this.carouselService.deleteDrawingFromServer(id).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                if (error === 'NO_SERVER_RESPONSE') this.openSnackBar("Impossible d'accéder au serveur", 'Fermer');
                if (error === 'INTERNAL_SERVER_ERROR') this.openSnackBar("Le dessin n'existe pas sur le serveur", 'Fermer');
                if (error === 'NOT_ON_DATABASE') this.openSnackBar('Impossible de supprimer le dessin sur la base de données.', 'Fermer');
                if (error === 'FAILED_TO_DELETE_DRAWING') this.openSnackBar('La suppression sur la base de donnée a échouée.', 'Fermer');

                this.requestDrawings.emit();
            },
            () => {
                this.openSnackBar('Le dessin a été supprimé avec succès.', 'Fermer');
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
