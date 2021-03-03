import { DrawingForm } from '@common/communication/drawingForm';
import * as fs from 'fs';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class DrawingsService {
    private readonly DRAWINGS_DIRECTORY: string = 'drawingsData';

    drawingsData: DrawingForm[];

    constructor() {
        this.drawingsData = [];
    }

    // temp
    storeData(drawingForm: DrawingForm): void {
        this.drawingsData.push(drawingForm);
        this.writeFile(`${this.DRAWINGS_DIRECTORY}/` + drawingForm.id, drawingForm.drawingData); // writing file mapped by id
        console.log(this.drawingsData.length);
    }

    // temp
    getData(): DrawingForm[] {
        return this.drawingsData;
    }

    // TODO: those functions will be used to communicate with the database service

    // async addDrawing(drawingForm: DrawingForm): Promise<void> {
    //
    // }

    // async getAllDrawings(): Promise<DrawingForm[]> {
    //
    // }

    // async getDrawingsByTagName(): Promise<DrawingForm[]> {
    //
    // }

    // async deleteDrawing(id: number): Promise<void> {

    // }

    // private validateDrawing(drawingForm: DrawingForm): boolean {
    // TODO:  Des vérifications (client ET serveur) sont présentes pour la sauvegarde. Vérification minimale: nom non vide et étiquettes valides
    // }

    private async writeFile(fileName: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, content, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
                console.log('dessin sauvegardé dans le dossier drawingsData');
            });
        });
    }

    // legit (commented function)
    // private async readFile(name: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         fs.readFile(name, (err, data) => {
    //             if (err) {
    //                 reject(err);
    //                 return;
    //             }
    //             resolve(data.toString());
    //         });
    //     });
    // }
}
