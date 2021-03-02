import { TYPES } from '@app/types';
import { DrawingForm } from '@common/communication/drawingForm';
import { Message } from '@common/communication/message';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { DateService } from './date.service';

interface DrawingData {
    id: number;
    drawing: FormData;
}

@injectable()
export class DatabaseService {
    drawingsData: DrawingData[];

    constructor(@inject(TYPES.DateService) private dateService: DateService) {
        this.drawingsData = [];
    }

    async helloWorld(): Promise<Message> {
        return this.dateService
            .currentTime()
            .then((timeMessage: Message) => {
                return {
                    title: 'Hello world',
                    body: 'Time is ' + timeMessage.body,
                };
            })
            .catch((error: unknown) => {
                console.error('There was an error!!!', error);

                return {
                    title: 'Error',
                    body: error as string,
                };
            });
    }

    about(): Message {
        return {
            title: 'Database for the pictures of PolyFill',
            body: 'Try calling helloWorld to get the time',
        };
    }

    storeData(drawingForm: DrawingForm): void {
        const data: DrawingData = { id: drawingForm.id, drawing: drawingForm.drawing };
        this.drawingsData.push(data);
    }

    getData(): DrawingData {
        return this.drawingsData[0];
    }
}
