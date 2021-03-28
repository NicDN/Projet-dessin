import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private readonly IMGUR_UPLOAD_URL: string = 'https://api.imgur.com/3/image';
    private readonly CLIENT_ID: string = 'a941b795d061911';

    private downloadFormat: string;
    private exportLink: HTMLAnchorElement;

    canvasToExport: HTMLCanvasElement;

    constructor(private http: HttpClient) {}

    exportCanvas(fileName: string, fileFormat: string, exportToImgur: boolean): void {
        this.exportLink = document.createElement('a');
        // tslint:disable-next-line: no-unused-expression
        fileName ? '' : (fileName = 'Sans titre');
        this.exportLink.setAttribute('download', `${fileName}.${fileFormat}`);
        this.downloadFormat = `image/${fileFormat}`;
        this.canvasToExport.toBlob((blob) => {
            exportToImgur ? this.handleImgurExport(fileName, blob) : this.handleLocalExport(blob);
        }, this.downloadFormat);
    }

    private handleLocalExport(blob: Blob | null): void {
        const url = URL.createObjectURL(blob);
        this.exportLink.setAttribute('href', url);
        this.exportLink.click();
    }

    private handleImgurExport(fileName: string, blob: Blob | null): void {
        const imgurData = new FormData();
        imgurData.append(fileName, blob as string | Blob);

        const headers = new HttpHeaders({ Authorization: 'Client-ID ' + this.CLIENT_ID });
        this.http
            .post(this.IMGUR_UPLOAD_URL, imgurData, { headers })
            .toPromise()
            .then((res) => {
                console.log(res);
            })
            .catch((err) => console.log(err));
    }
}
