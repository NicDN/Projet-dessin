import { DrawingForm } from '@common/communication/drawingForm';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { Collection } from 'mongodb';
import 'reflect-metadata';
import { DrawingData } from '../../../classes/drawingData';
import { TYPES } from '../../types';
import { DatabaseService } from '../database/database.service';

const DATABASE_COLLECTION = 'drawingData';

@injectable()
export class DrawingsService {
    private readonly DRAWINGS_DIRECTORY: string = 'drawingsData';

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

    get collection(): Collection<DrawingData> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async storeDrawing(drawingForm: DrawingForm): Promise<void> {
        if (this.validateDrawing(drawingForm)) {
            const drawingData: DrawingData = { name: drawingForm.name, tags: drawingForm.tags };
            await this.collection.insertOne(drawingData, (err, data) => {
                drawingForm.id = data.insertedId.toString();
                this.writeFile(`${this.DRAWINGS_DIRECTORY}/` + drawingForm.id, drawingForm.drawingData); // writing file mapped by id
            });
            // .catch((error: Error) => {
            //     throw new HttpException(500, 'Failed to insert course');
            // });
        } else {
            throw new Error('Invalid course');
        }
    }

    async getData(tags: string[]): Promise<DrawingForm[]> {
        const drawingForms: DrawingForm[] = [];

        // TODO: checker pourquoi length = 2 quand il est vide
        if (tags.length === 2) {
            await this.collection
                .find({})
                .toArray()
                .then((drawingsData) => {
                    drawingsData.forEach((drawingData) => {
                        drawingForms.push({ name: drawingData['name'], tags: drawingData['tags'], id: drawingData['_id'], drawingData: '' });
                    });
                });
        }

        const formsToSend: DrawingForm[] = [];

        for (const form of drawingForms) {
            const id = form['id'];
            await this.readFile(`${this.DRAWINGS_DIRECTORY}/` + id)
                .then((image) => {
                    form['drawingData'] = image;
                    formsToSend.push(form);
                })
                .catch(() => {
                    return;
                });
        }
        return formsToSend;
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

    private validateDrawing(drawingForm: DrawingForm): boolean {
        // TODO:  Des vérifications (client ET serveur) sont présentes pour la sauvegarde. Vérification minimale: nom non vide et étiquettes valides
        return true;
    }

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
    private async readFile(name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(name, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.toString());
            });
        });
    }
}
