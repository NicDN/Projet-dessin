import { DrawingForm } from '@common/communication/drawingForm';
import * as fs from 'fs';
import * as Httpstatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Collection, ObjectId } from 'mongodb';
import 'reflect-metadata';
import { DrawingData } from '../../../classes/drawingData';
import { HttpException } from '../../../classes/http.exception';
import { TYPES } from '../../types';
import { DatabaseService } from '../database/database.service';

const DATABASE_COLLECTION = 'drawingData';

const MAX_LENGTH = 10;
const MIN_LENGTH = 2;

const DRAWINGS_MAX_COUNT = 3;

const LAST_INDEX = -3;
const BEFORE_LAST_INDEX = -4;

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
            try {
                await this.collection.insertOne(drawingData, (err, data) => {
                    drawingForm.id = data.insertedId.toString();
                    this.writeFile(`${this.DRAWINGS_DIRECTORY}/` + drawingForm.id, drawingForm.drawingData); // writing file mapped by id
                });
            } catch (error) {
                throw new HttpException(Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to insert course');
            }
        } else {
            throw new Error('Invalid');
        }
    }

    async getDrawings(tags: string[], index: number): Promise<DrawingForm[]> {
        let drawingForms: DrawingForm[] = [];

        await this.collection
            .find({})
            .toArray()
            .then((drawingsData) => {
                drawingsData.forEach((drawingData) => {
                    // tslint:disable-next-line: no-string-literal
                    drawingForms.push({ name: drawingData.name, tags: drawingData.tags, id: drawingData['_id'], drawingData: '' });
                });
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

        for (const form of drawingForms) {
            const id = form.id;
            await this.readFile(`${this.DRAWINGS_DIRECTORY}/` + id)
                .then((image) => {
                    form.drawingData = image;
                    validForms.push(form);
                })
                .catch(() => {
                    return;
                });
        }
        index = Math.abs(index % validForms.length);
        const drawingMaxCount = validForms.length >= DRAWINGS_MAX_COUNT ? DRAWINGS_MAX_COUNT : validForms.length;

        validForms.push(validForms[0]);
        validForms.push(validForms[1]);
        validForms.unshift(validForms[LAST_INDEX]);
        validForms.unshift(validForms[BEFORE_LAST_INDEX]);

        index += 2;
        return validForms.splice(index, drawingMaxCount);
    }

    async deleteDrawing(id: string): Promise<void> {
        try {
            fs.unlinkSync(`${this.DRAWINGS_DIRECTORY}/` + id);
        } catch (error) {
            throw new Error('FILE_NOT_FOUND');
        }

        return this.collection
            .findOneAndDelete({ _id: new ObjectId(id) })
            .then((deletedDrawing) => {
                if (deletedDrawing.value == null) {
                    throw new Error('NOT_ON_DATABASE');
                }
            })
            .catch(() => {
                throw new Error('FAILED_TO_DELETE_DRAWING');
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
