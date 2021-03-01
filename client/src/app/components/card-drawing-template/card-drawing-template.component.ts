import { Component, Input } from '@angular/core';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';

@Component({
    selector: 'app-card-drawing-template',
    templateUrl: './card-drawing-template.component.html',
    styleUrls: ['./card-drawing-template.component.scss'],
})
export class CardDrawingTemplateComponent {
    @Input() drawingForm: DrawingForm;

    constructor(private carouselService: CarouselService) {}

    setToCurrentDrawing(): void {
        // Need antoine.
    }

    deleteDrawing(id: number): void {
        this.carouselService.deleteDrawingFromServer(id).subscribe();
    }
}
