import { ElementRef, Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class ExportService {
    exportCanvas(fileName: string, fileFormat: string, filterCanvas: ElementRef<HTMLCanvasElement>): void {
        const exportLink = document.createElement('a');

        if (fileName === '') {
            fileName = 'Sans titre';
        }
        exportLink.setAttribute('download', `${fileName}.${fileFormat}`);

        filterCanvas.nativeElement.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            exportLink.setAttribute('href', url);
            exportLink.click();
        });
    }
}
