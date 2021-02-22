import { Injectable } from '@angular/core';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { ExportService } from '@app/services/option/export/export.service';
import { SaveService } from '@app/services/option/save/save.service';

export enum DialogType {
    Carousel,
    Save,
    Export,
}

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private exportService: ExportService, private carouselService: CarouselService, private saveService: SaveService) {}

    openDialog(dialogType: DialogType): void {
        switch (dialogType) {
            case DialogType.Carousel: {
                this.carouselService.openDialog();
                break;
            }
            case DialogType.Save: {
                this.saveService.openDialog();
                break;
            }
            case DialogType.Export: {
                this.exportService.openDialog();
                break;
            }
        }
    }
}
