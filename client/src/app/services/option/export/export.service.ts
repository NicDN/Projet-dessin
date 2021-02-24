import { Injectable } from '@angular/core';
import { FilterService } from '@app/services/filter/filter.service';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    constructor(private filterService: FilterService) {}

    exportCanvas(fileName: string, fileFormat: string): void {
        const exportLink = document.createElement('a');

        if (fileName === '') {
            fileName = 'Sans titre';
        }
        exportLink.setAttribute('download', `${fileName}.${fileFormat}`);

        this.filterService.canvas.nativeElement.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            exportLink.setAttribute('href', url);
            exportLink.click();
        });
    }
}
