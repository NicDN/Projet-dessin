import { TYPES } from '@app/types';
import { Message } from '@common/communication/message';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { DateService } from './date.service';

@injectable()
export class IndexService {
    clientMessages: Message[];
    formDatas: FormData[];

    constructor(@inject(TYPES.DateService) private dateService: DateService) {
        this.clientMessages = [];
        this.formDatas = [];
    }

    about(): Message {
        return {
            title: 'Basic Server About Page',
            body: 'Try calling helloWorld to get the time',
        };
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

    // TODO : ceci est à titre d'exemple. À enlever pour la remise
    storeMessage(message: Message): void {
        console.log(message);
        this.clientMessages.push(message);
    }

    getAllMessages(): Message[] {
        return this.clientMessages;
    }

    storeData(formData: FormData): void {
        this.formDatas.push(formData);
    }

    getData(): FormData {
        return this.formDatas[0];
    }
}
