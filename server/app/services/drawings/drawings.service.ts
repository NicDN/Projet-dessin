import { DrawingForm } from '@common/communication/drawing-form';

import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { Collection, ObjectId } from 'mongodb';
import 'reflect-metadata';
import { DrawingData } from '../../../classes/drawingData';
import { TYPES } from '../../types';
import { DatabaseService } from '../database/database.service';

const DATABASE_COLLECTION = 'drawingData';

const MAX_LENGTH = 10;
const MIN_LENGTH = 2;

const DRAWINGS_MAX_COUNT = 3;

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
            await this.collection
                .insertOne(drawingData)
                .then(async (data) => {
                    drawingForm.id = data.insertedId.toString();
                    await this.writeFile(`${this.DRAWINGS_DIRECTORY}/` + drawingForm.id, drawingForm.drawingData).catch(() => {
                        throw new Error('FAILED_TO_SAVE_DRAWING');
                    });
                })
                .catch((error: Error) => {
                    if (error.message === 'FAILED_TO_SAVE_DRAWING') {
                        throw new Error('FAILED_TO_SAVE_DRAWING');
                    } else {
                        throw new Error('DATABASE_ERROR');
                    }
                });
        } else {
            throw new Error('INVALID_DRAWING');
        }
    }

    async getDrawings(tags: string[], index: number): Promise<DrawingForm[]> {
        let drawingForms: DrawingForm[] = [];

        // get drawings info from database
        await this.collection
            .find({})
            .toArray()
            .then((drawingsData) => {
                drawingsData.forEach((drawingData) => {
                    // tslint:disable-next-line: no-string-literal
                    drawingForms.push({ name: drawingData.name, tags: drawingData.tags, id: drawingData['_id'], drawingData: '' });
                });
            })
            .catch(() => {
                throw new Error('DATABASE_ERROR');
            });

        if (tags.length > 0) {
            drawingForms = this.filterDrawingsByTags(drawingForms, tags);
        }

        return this.getValidDrawings(drawingForms, index);
    }

    private filterDrawingsByTags(drawingForms: DrawingForm[], tags: string[]): DrawingForm[] {
        const filteredForms: DrawingForm[] = [];
        for (const tag of tags) {
            for (const form of drawingForms) {
                if (form.tags.includes(tag) && !filteredForms.includes(form)) {
                    filteredForms.push(form);
                }
            }
        }
        return filteredForms;
    }

    private async getValidDrawings(drawingForms: DrawingForm[], index: number): Promise<DrawingForm[]> {
        const validForms: DrawingForm[] = [];

        // get file from server
        for (const form of drawingForms) {
            const id = form.id;
            await this.readFile(`${this.DRAWINGS_DIRECTORY}/` + id)
                .then((drawingData) => {
                    form.drawingData = drawingData;
                    validForms.push(form);
                })
                .catch(() => {
                    return [];
                });
        }

        return this.carouselEffect(validForms, index);
    }

    private carouselEffect(drawingForms: DrawingForm[], index: number): DrawingForm[] {
        const validForms = [...drawingForms];
        const LAST_INDEX_VALID_FORMS = -3;
        const BEFORE_LAST_INDEX_VALID_FORMS = -4;

        index = Math.abs(index % validForms.length);
        const drawingMaxCount = validForms.length >= DRAWINGS_MAX_COUNT ? DRAWINGS_MAX_COUNT : validForms.length;

        validForms.push(validForms[0]);
        validForms.push(validForms[1]);
        validForms.unshift(validForms[LAST_INDEX_VALID_FORMS]);
        validForms.unshift(validForms[BEFORE_LAST_INDEX_VALID_FORMS]);

        index += 2;
        return validForms.splice(index, drawingMaxCount);
    }

    async deleteDrawing(id: string): Promise<void> {
        // delete file from server
        try {
            fs.unlinkSync(`${this.DRAWINGS_DIRECTORY}/` + id);
        } catch (error) {
            throw new Error('FILE_NOT_FOUND');
        }

        // delete drawing infos from database
        return this.collection
            .findOneAndDelete({ _id: new ObjectId(id) })
            .then((deletedDrawing) => {
                if (deletedDrawing.value == null) {
                    throw new Error('NOT_ON_DATABASE');
                }
            })
            .catch((error) => {
                if (error.message === 'NOT_ON_DATABASE') throw new Error('NOT_ON_DATABASE');
                else throw new Error('FAILED_TO_DELETE_DRAWING');
            });
    }

    private validateDrawing(drawingForm: DrawingForm): boolean {
        return this.validateTags(drawingForm.tags) && drawingForm.name !== '';
    }

    private validateTags(tags: string[]): boolean {
        for (const tag of tags) {
            if (tag.length < MIN_LENGTH || tag.length > MAX_LENGTH) return false;
            if (/\d/.test(tag)) return false;
        }
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
            });
        });
    }

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
