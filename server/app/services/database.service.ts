import { DrawingForm } from '@common/communication/drawingForm';
import { Message } from '@common/communication/message';
import { injectable } from 'inversify';
import 'reflect-metadata';

// interface DrawingData {
//     id: number;
//     drawing: FormData;
// }

@injectable()
export class DatabaseService {
    drawingsData: DrawingForm[];

    constructor() {
        this.drawingsData = [];
    }

    about(): Message {
        return {
            title: 'Database for the pictures of PolyFill',
            body: 'Try calling helloWorld to get the time',
        };
    }

    storeData(drawingForm: DrawingForm): void {
        // const data: DrawingData = { id: drawingForm.id, drawing: drawingForm.drawing };
        this.drawingsData.push(drawingForm);
    }

    getData(): DrawingForm[] {
        return this.drawingsData;
    }
}
