import { TYPES } from '@app/types';
import { Message } from '@common/communication/message';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { DateService } from './date.service';

@injectable()
export class DatabaseService {
    formDatas: FormData[];

    constructor(@inject(TYPES.DateService) private dateService: DateService) {
        this.formDatas = [];
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

    storeData(formData: FormData): void {
        // tslint:disable-next-line: prefer-const
        let blob = formData.get('drawing');
        let fileName = formData.get('name');
        // tslint:disable-next-line: prefer-const
        let exportLink: HTMLAnchorElement = document.createElement('a');

        // tslint:disable-next-line: no-unused-expression
        fileName ? '' : (fileName = 'Sans titre');
        exportLink.setAttribute('download', `${fileName}.png`);
        const url = URL.createObjectURL(blob);
        exportLink.setAttribute('href', url);
        exportLink.click();
    }

    getData(): FormData {
        return this.formDatas[0];
    }
}
