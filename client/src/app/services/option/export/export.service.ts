import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    canvasToExport: HTMLCanvasElement;
    private exportLink: HTMLAnchorElement;

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportLink = document.createElement('a');

        if (fileName === '') {
            fileName = 'Sans titre';
        }
        this.exportLink.setAttribute('download', `${fileName}.${fileFormat}`);
        this.canvasToExport.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            this.exportLink.setAttribute('href', url);
            this.exportLink.click();
        });
    }
}
