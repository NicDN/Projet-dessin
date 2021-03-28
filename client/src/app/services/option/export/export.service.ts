import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private readonly IMGUR_UPLOAD_URL: string = 'https://api.imgur.com/3/image';
    private readonly CLIENT_ID: string = 'a941b795d061911';

    private downloadFormat: string;
    private exportLink: HTMLAnchorElement;

    canvasToExport: HTMLCanvasElement;

    constructor(private http: HttpClient /*private snackBarService: SnackBarService*/) {}

    async exportCanvas(fileName: string, fileFormat: string, exportToImgur: boolean): Promise<string> {
        this.exportLink = document.createElement('a');
        // tslint:disable-next-line: no-unused-expression
        fileName ? '' : (fileName = 'Sans titre');
        this.exportLink.setAttribute('download', `${fileName}.${fileFormat}`);
        this.downloadFormat = `image/${fileFormat}`;

        return new Promise((resolve, reject) => {
            this.canvasToExport.toBlob((blob) => {
                exportToImgur
                    ? this.handleImgurExport(fileName, blob)
                          .then((url) => resolve(url))
                          .catch(reject)
                    : this.handleLocalExport(blob);
            }, this.downloadFormat);
        });
    }

    private handleLocalExport(blob: Blob | null): void {
        const url = URL.createObjectURL(blob);
        this.exportLink.setAttribute('href', url);
        this.exportLink.click();
    }

    private async handleImgurExport(fileName: string, blob: Blob | null): Promise<string> {
        const imgurData = new FormData();
        imgurData.append(fileName, blob as string | Blob);

        const headers = new HttpHeaders({ Authorization: 'Client-ID ' + this.CLIENT_ID });
        this.http
            .post(this.IMGUR_UPLOAD_URL, imgurData, { headers })
            .toPromise()
            .then((res) => {
                console.log(res);
                return 'url';
            })

            .catch((err) => {
                console.log(err);
            });

        return ''; // TODO: unreachable
    }
}
