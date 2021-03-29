import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ImgurResponse {
    data: {
        link: string;
    };
    success: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private readonly IMGUR_UPLOAD_URL: string = 'https://api.imgur.com/3/image';
    private readonly CLIENT_ID: string = 'a941b795d061911';

    private downloadFormat: string = '';
    private exportLink: HTMLAnchorElement;
    private fileName: string = '';

    canvasToExport: HTMLCanvasElement;

    constructor(private http: HttpClient) {}

    handleLocalExport(fileName: string, fileFormat: string): void {
        this.exportLink = document.createElement('a');
        fileName === '' ? (this.fileName = 'Sans titre') : (this.fileName = fileName);
        this.downloadFormat = `image/${fileFormat}`;
        this.exportLink.setAttribute('download', `${this.fileName}.${fileFormat}`);

        this.canvasToExport.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            this.exportLink.setAttribute('href', url);
            this.exportLink.click();
        }, this.downloadFormat);
    }

    async handleImgurExport(fileFormat: string): Promise<string> {
        this.downloadFormat = `image/${fileFormat}`;

        return new Promise((resolve, reject) => {
            this.canvasToExport.toBlob((blob) => {
                const imgurData = new FormData();
                imgurData.append('image', blob as string | Blob);

                const headers = new HttpHeaders({ Authorization: 'Client-ID ' + this.CLIENT_ID });
                this.http
                    .post(this.IMGUR_UPLOAD_URL, imgurData, { headers })
                    .toPromise()
                    .then((res: ImgurResponse) => {
                        res.success ? resolve(res.data.link) : reject();
                    })
                    .catch(() => {
                        reject();
                    });
            }, this.downloadFormat);
        });
    }
}
