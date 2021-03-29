import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface ImgurResponse {
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

    private setupExport(fileName: string, fileFormat: string): void {
        this.exportLink = document.createElement('a'); // local
        // tslint:disable-next-line: no-unused-expression
        fileName === '' ? (this.fileName = 'Sans titre') : (this.fileName = fileName); // imgur local
        this.exportLink.setAttribute('download', `${this.fileName}.${fileFormat}`); // local
        this.downloadFormat = `image/${fileFormat}`; // imgur local
    }

    handleLocalExport(fileName: string, fileFormat: string): void {
        this.setupExport(fileName, fileFormat);

        // this.exportLink = document.createElement('a');
        // this.downloadFormat = `image/${fileFormat}`;

        this.canvasToExport.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            this.exportLink.setAttribute('href', url);
            this.exportLink.click();
        }, this.downloadFormat);
    }

    async handleImgurExport(fileName: string, fileFormat: string): Promise<string> {
        this.setupExport(fileName, fileFormat);

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
